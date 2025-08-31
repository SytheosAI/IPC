import { createClient } from '@supabase/supabase-js';
import { Worker } from 'worker_threads';
import * as path from 'path';

interface FeedbackData {
  referenceType: 'issue' | 'opportunity' | 'upgrade' | 'pattern';
  referenceId: string;
  feedbackType: 'accuracy' | 'usefulness' | 'false_positive' | 'missed_issue' | 'priority_adjustment';
  rating: number;
  comments?: string;
  correctedData?: any;
  userId: string;
}

interface LearningMetrics {
  accuracyBefore: number;
  accuracyAfter: number;
  precisionScore: number;
  recallScore: number;
  f1Score: number;
  trainingSamples: number;
  trainingDuration: number;
}

interface ModelPerformance {
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTraining: Date;
  totalSamples: number;
}

export class FeedbackLoopManager {
  private supabase: any;
  private mlWorker?: Worker;
  private feedbackQueue: FeedbackData[] = [];
  private retrainingThreshold = 100; // Retrain after 100 feedback items
  private performanceHistory: Map<string, ModelPerformance[]> = new Map();
  private isProcessing = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeWorker();
    this.startFeedbackProcessor();
  }

  private initializeWorker() {
    this.mlWorker = new Worker(path.join(__dirname, 'ml-worker.js'), {
      workerData: {
        mode: 'feedback_processing'
      }
    });

    this.mlWorker.on('message', (message) => {
      if (message.type === 'training_complete') {
        this.handleTrainingComplete(message.data);
      }
    });

    this.mlWorker.on('error', (error) => {
      console.error('ML Worker error:', error);
      this.restartWorker();
    });
  }

  private restartWorker() {
    if (this.mlWorker) {
      this.mlWorker.terminate();
    }
    setTimeout(() => this.initializeWorker(), 5000);
  }

  async submitFeedback(feedback: FeedbackData): Promise<void> {
    try {
      // Store feedback in database
      const { data, error } = await this.supabase
        .from('analysis_feedback')
        .insert({
          reference_type: feedback.referenceType,
          reference_id: feedback.referenceId,
          feedback_type: feedback.feedbackType,
          rating: feedback.rating,
          comments: feedback.comments,
          corrected_data: feedback.correctedData,
          user_id: feedback.userId,
          processed_for_ml: false
        })
        .select()
        .single();

      if (error) throw error;

      // Add to processing queue
      this.feedbackQueue.push(feedback);

      // Update reference entity based on feedback
      await this.updateEntityBasedOnFeedback(feedback);

      // Check if retraining is needed
      if (this.feedbackQueue.length >= this.retrainingThreshold) {
        await this.triggerRetraining();
      }

      // Process immediate adjustments
      await this.processImmediateFeedback(feedback);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  private async updateEntityBasedOnFeedback(feedback: FeedbackData): Promise<void> {
    const updateMap = {
      issue: 'architecture_issues',
      opportunity: 'optimization_opportunities',
      upgrade: 'component_upgrades',
      pattern: 'architecture_patterns'
    };

    const tableName = updateMap[feedback.referenceType];
    
    if (feedback.feedbackType === 'false_positive') {
      // Mark as false positive
      await this.supabase
        .from(tableName)
        .update({ status: 'false_positive' })
        .eq('id', feedback.referenceId);
    } else if (feedback.feedbackType === 'priority_adjustment' && feedback.correctedData?.priority) {
      // Update priority
      await this.supabase
        .from(tableName)
        .update({ priority: feedback.correctedData.priority })
        .eq('id', feedback.referenceId);
    }
  }

  private async processImmediateFeedback(feedback: FeedbackData): Promise<void> {
    // Apply immediate adjustments based on feedback
    if (feedback.feedbackType === 'missed_issue' && feedback.correctedData) {
      // Create new issue based on user feedback
      await this.createMissedIssue(feedback.correctedData);
    }

    // Update confidence scores
    if (feedback.rating <= 2) {
      await this.adjustConfidenceScores(feedback.referenceType, feedback.referenceId, -10);
    } else if (feedback.rating >= 4) {
      await this.adjustConfidenceScores(feedback.referenceType, feedback.referenceId, 5);
    }
  }

  private async createMissedIssue(issueData: any): Promise<void> {
    await this.supabase
      .from('architecture_issues')
      .insert({
        issue_type: issueData.type || 'gap',
        severity: issueData.severity || 'medium',
        title: issueData.title || 'User-reported issue',
        description: issueData.description || 'Issue identified through user feedback',
        location: issueData.location || {},
        impact_score: issueData.impactScore || 50,
        detection_confidence: 100, // User-reported
        suggested_fix: issueData.suggestedFix,
        auto_fixable: false,
        status: 'open'
      });
  }

  private async adjustConfidenceScores(type: string, id: string, adjustment: number): Promise<void> {
    const tableMap: Record<string, string> = {
      issue: 'architecture_issues',
      opportunity: 'optimization_opportunities',
      upgrade: 'component_upgrades',
      pattern: 'architecture_patterns'
    };

    const table = tableMap[type];
    const confidenceField = type === 'pattern' ? 'confidence_score' : 
                           type === 'opportunity' ? 'ml_confidence' : 'detection_confidence';

    // Get current confidence
    const { data: current } = await this.supabase
      .from(table)
      .select(confidenceField)
      .eq('id', id)
      .single();

    if (current) {
      const newConfidence = Math.max(0, Math.min(100, current[confidenceField] + adjustment));
      
      await this.supabase
        .from(table)
        .update({ [confidenceField]: newConfidence })
        .eq('id', id);
    }
  }

  private async triggerRetraining(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('Triggering model retraining with', this.feedbackQueue.length, 'feedback items');

    try {
      // Get all unprocessed feedback from database
      const { data: feedbackData, error } = await this.supabase
        .from('analysis_feedback')
        .select('*')
        .eq('processed_for_ml', false)
        .limit(1000);

      if (error) throw error;

      // Prepare training data
      const trainingData = this.prepareTrainingData(feedbackData);

      // Send to ML worker for retraining
      this.mlWorker?.postMessage({
        type: 'retrain',
        data: trainingData
      });

      // Mark feedback as processed
      const feedbackIds = feedbackData.map((f: any) => f.id);
      await this.supabase
        .from('analysis_feedback')
        .update({ processed_for_ml: true })
        .in('id', feedbackIds);

      // Clear processed items from queue
      this.feedbackQueue = [];

    } catch (error) {
      console.error('Retraining failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private prepareTrainingData(feedbackData: any[]): any {
    const grouped: Record<string, any[]> = {
      issues: [],
      patterns: [],
      optimizations: [],
      upgrades: []
    };

    for (const feedback of feedbackData) {
      const category = this.getCategoryFromType(feedback.reference_type);
      if (grouped[category]) {
        grouped[category].push({
          input: this.extractFeatures(feedback),
          output: this.createLabel(feedback),
          weight: feedback.rating / 5
        });
      }
    }

    return grouped;
  }

  private getCategoryFromType(type: string): string {
    const mapping: Record<string, string> = {
      'issue': 'issues',
      'pattern': 'patterns',
      'opportunity': 'optimizations',
      'upgrade': 'upgrades'
    };
    return mapping[type] || 'issues';
  }

  private extractFeatures(feedback: any): number[] {
    const features: number[] = [];
    
    // Extract numerical features from corrected data
    if (feedback.corrected_data) {
      this.extractNumericalFeatures(feedback.corrected_data, features);
    }

    // Add feedback metadata features
    features.push(
      feedback.rating / 5,
      this.encodeFeedbackType(feedback.feedback_type),
      this.encodeReferenceType(feedback.reference_type),
      feedback.comments ? feedback.comments.length / 500 : 0
    );

    // Pad to consistent size
    while (features.length < 128) {
      features.push(0);
    }

    return features.slice(0, 128);
  }

  private extractNumericalFeatures(data: any, features: number[]): void {
    for (const value of Object.values(data)) {
      if (typeof value === 'number') {
        features.push(value / 100);
      } else if (typeof value === 'boolean') {
        features.push(value ? 1 : 0);
      } else if (typeof value === 'string') {
        features.push(value.length / 100);
      } else if (typeof value === 'object' && value !== null) {
        this.extractNumericalFeatures(value, features);
      }
    }
  }

  private encodeFeedbackType(type: string): number {
    const encoding: Record<string, number> = {
      'accuracy': 0.2,
      'usefulness': 0.4,
      'false_positive': 0.6,
      'missed_issue': 0.8,
      'priority_adjustment': 1.0
    };
    return encoding[type] || 0.5;
  }

  private encodeReferenceType(type: string): number {
    const encoding: Record<string, number> = {
      'issue': 0.25,
      'pattern': 0.5,
      'opportunity': 0.75,
      'upgrade': 1.0
    };
    return encoding[type] || 0.5;
  }

  private createLabel(feedback: any): number[] {
    const label = new Array(10).fill(0);
    
    // Set label based on feedback type and rating
    if (feedback.feedback_type === 'false_positive') {
      label[0] = 1; // False positive class
    } else if (feedback.rating >= 4) {
      label[1] = 1; // Correct prediction class
    } else if (feedback.rating <= 2) {
      label[2] = 1; // Incorrect prediction class
    } else {
      label[3] = 1; // Neutral class
    }

    return label;
  }

  private async handleTrainingComplete(metrics: LearningMetrics): Promise<void> {
    // Store training metrics
    await this.supabase
      .from('ml_learning_history')
      .insert({
        model_type: 'architecture_analyzer',
        model_version: `v${Date.now()}`,
        training_samples: metrics.trainingSamples,
        accuracy_before: metrics.accuracyBefore,
        accuracy_after: metrics.accuracyAfter,
        precision_score: metrics.precisionScore,
        recall_score: metrics.recallScore,
        f1_score: metrics.f1Score,
        training_duration_seconds: metrics.trainingDuration
      });

    // Update model performance tracking
    this.updatePerformanceTracking(metrics);

    // Notify about training completion
    console.log('Model retraining completed:', metrics);
  }

  private updatePerformanceTracking(metrics: LearningMetrics): void {
    const performance: ModelPerformance = {
      modelType: 'architecture_analyzer',
      accuracy: metrics.accuracyAfter,
      precision: metrics.precisionScore,
      recall: metrics.recallScore,
      f1Score: metrics.f1Score,
      lastTraining: new Date(),
      totalSamples: metrics.trainingSamples
    };

    if (!this.performanceHistory.has('architecture_analyzer')) {
      this.performanceHistory.set('architecture_analyzer', []);
    }

    this.performanceHistory.get('architecture_analyzer')!.push(performance);
  }

  private startFeedbackProcessor(): void {
    // Process feedback queue periodically
    setInterval(async () => {
      if (this.feedbackQueue.length > 0 && !this.isProcessing) {
        await this.processFeedbackBatch();
      }
    }, 60000); // Every minute

    // Check for retraining need
    setInterval(async () => {
      await this.checkRetrainingNeed();
    }, 3600000); // Every hour
  }

  private async processFeedbackBatch(): Promise<void> {
    const batch = this.feedbackQueue.splice(0, 10);
    
    for (const feedback of batch) {
      // Process each feedback item
      await this.analyzeFeedbackPattern(feedback);
    }
  }

  private async analyzeFeedbackPattern(feedback: FeedbackData): Promise<void> {
    // Analyze patterns in feedback to identify systematic issues
    const similarFeedback = await this.findSimilarFeedback(feedback);
    
    if (similarFeedback.length > 5) {
      // Pattern detected - create insight
      await this.createSystematicInsight(feedback, similarFeedback);
    }
  }

  private async findSimilarFeedback(feedback: FeedbackData): Promise<any[]> {
    const { data } = await this.supabase
      .from('analysis_feedback')
      .select('*')
      .eq('reference_type', feedback.referenceType)
      .eq('feedback_type', feedback.feedbackType)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    return data || [];
  }

  private async createSystematicInsight(feedback: FeedbackData, similarFeedback: any[]): Promise<void> {
    const avgRating = similarFeedback.reduce((sum, f) => sum + f.rating, 0) / similarFeedback.length;
    
    if (avgRating < 3) {
      // Systematic issue detected
      await this.supabase
        .from('architecture_issues')
        .insert({
          issue_type: 'technical_debt',
          severity: 'medium',
          title: `Systematic ${feedback.feedbackType} in ${feedback.referenceType} detection`,
          description: `Multiple users reported ${feedback.feedbackType} issues with ${feedback.referenceType} detection. Average rating: ${avgRating.toFixed(1)}`,
          impact_score: 60,
          detection_confidence: 90,
          auto_fixable: false,
          status: 'open'
        });
    }
  }

  private async checkRetrainingNeed(): Promise<void> {
    // Check model performance degradation
    const recentPerformance = await this.getRecentModelPerformance();
    
    if (recentPerformance && this.shouldRetrain(recentPerformance)) {
      await this.triggerRetraining();
    }
  }

  private async getRecentModelPerformance(): Promise<ModelPerformance | null> {
    const history = this.performanceHistory.get('architecture_analyzer');
    if (!history || history.length === 0) return null;
    
    return history[history.length - 1];
  }

  private shouldRetrain(performance: ModelPerformance): boolean {
    // Retrain if accuracy drops below 70% or F1 score below 0.65
    return performance.accuracy < 70 || performance.f1Score < 0.65;
  }

  async getPerformanceMetrics(): Promise<Map<string, ModelPerformance[]>> {
    return this.performanceHistory;
  }

  async getFeedbackStatistics(): Promise<any> {
    const { data: stats } = await this.supabase
      .from('analysis_feedback')
      .select('feedback_type, rating, reference_type')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (!stats) return null;

    const summary: any = {
      totalFeedback: stats.length,
      averageRating: stats.reduce((sum: number, f: any) => sum + f.rating, 0) / stats.length,
      byType: {},
      byReferenceType: {},
      trends: []
    };

    // Group by feedback type
    stats.forEach((f: any) => {
      if (!summary.byType[f.feedback_type]) {
        summary.byType[f.feedback_type] = { count: 0, avgRating: 0 };
      }
      summary.byType[f.feedback_type].count++;
      summary.byType[f.feedback_type].avgRating += f.rating;
    });

    // Calculate averages
    Object.keys(summary.byType).forEach(type => {
      summary.byType[type].avgRating /= summary.byType[type].count;
    });

    return summary;
  }

  async exportTrainingData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const { data } = await this.supabase
      .from('ml_training_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row: any) => Object.values(row).join(','));
      return [headers, ...rows].join('\n');
    }
  }

  async cleanup(): Promise<void> {
    if (this.mlWorker) {
      await this.mlWorker.terminate();
    }
  }
}