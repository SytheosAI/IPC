const { parentPort, workerData } = require('worker_threads');
const tf = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');

class MLAnalysisWorker {
  constructor(data) {
    this.components = data.components;
    this.patterns = data.patterns;
    this.issues = data.issues;
    this.models = {};
    this.yoloModel = null;
  }

  async initialize() {
    await this.loadModels();
    await this.processData();
  }

  async loadModels() {
    try {
      // Load pre-trained models for different analysis tasks
      this.models.issueDetection = await this.createIssueDetectionModel();
      this.models.patternRecognition = await this.createPatternRecognitionModel();
      this.models.optimizationSuggestion = await this.createOptimizationModel();
      this.models.componentAnalysis = await this.createComponentAnalysisModel();
      
      // Load YOLO model for UI/UX analysis
      await this.loadYOLOModel();
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }

  async createIssueDetectionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [128], units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 9, activation: 'softmax' }) // 9 issue types
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createPatternRecognitionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv1d({ inputShape: [100, 64], filters: 32, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling1d({ poolSize: 2 }),
        tf.layers.conv1d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.globalMaxPooling1d(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 6, activation: 'softmax' }) // 6 pattern types
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createOptimizationModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [64], units: 128, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 9, activation: 'softmax' }) // 9 optimization types
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createComponentAnalysisModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({ inputShape: [50, 32], units: 64, returnSequences: true }),
        tf.layers.lstm({ units: 32 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'softmax' }) // 8 component types
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async loadYOLOModel() {
    // Initialize YOLO-like model for UI component detection
    this.yoloModel = {
      detect: async (imageData) => {
        // Simplified YOLO-like detection
        const detections = [];
        
        // Simulate UI component detection
        const componentTypes = ['button', 'form', 'navigation', 'card', 'modal', 'table'];
        const issues = ['misalignment', 'inconsistent_spacing', 'color_contrast', 'missing_accessibility'];
        
        // Generate mock detections (in production, this would use actual YOLO)
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          detections.push({
            class: componentTypes[Math.floor(Math.random() * componentTypes.length)],
            confidence: Math.random() * 0.5 + 0.5,
            bbox: {
              x: Math.random() * 800,
              y: Math.random() * 600,
              width: Math.random() * 200 + 50,
              height: Math.random() * 100 + 30
            },
            issue: Math.random() > 0.7 ? issues[Math.floor(Math.random() * issues.length)] : null
          });
        }
        
        return detections;
      }
    };
  }

  async processData() {
    const predictions = {
      newIssues: [],
      patternSuggestions: [],
      optimizationSuggestions: [],
      componentUpgrades: [],
      yoloDetections: []
    };

    // Process components for issue detection
    for (const component of this.components) {
      const features = this.extractComponentFeatures(component);
      const issuePredictions = await this.predictIssues(features);
      
      if (issuePredictions.length > 0) {
        predictions.newIssues.push(...issuePredictions);
      }
    }

    // Pattern analysis
    const patternFeatures = this.extractPatternFeatures();
    const newPatterns = await this.predictPatterns(patternFeatures);
    predictions.patternSuggestions.push(...newPatterns);

    // Optimization opportunities
    const optimizationFeatures = this.extractOptimizationFeatures();
    const optimizations = await this.predictOptimizations(optimizationFeatures);
    predictions.optimizationSuggestions.push(...optimizations);

    // Component upgrade recommendations
    const upgrades = await this.analyzeComponentUpgrades();
    predictions.componentUpgrades.push(...upgrades);

    // YOLO UI/UX analysis
    const yoloResults = await this.performYOLOAnalysis();
    predictions.yoloDetections.push(...yoloResults);

    // Send results back to main thread
    parentPort.postMessage({
      type: 'predictions',
      data: predictions
    });
  }

  extractComponentFeatures(component) {
    const features = tf.tensor2d([
      [
        component.metrics.linesOfCode / 1000,
        component.metrics.cyclomaticComplexity / 100,
        component.metrics.maintainabilityIndex / 100,
        component.metrics.technicalDebtRatio / 100,
        component.metrics.testCoverage / 100,
        component.metrics.performanceScore / 100,
        component.metrics.securityScore / 100,
        Object.keys(component.dependencies).length / 50,
        this.getComponentTypeScore(component.type),
        this.calculateComponentAge(component.lastModified),
        ...this.padArray(this.encodeComponentName(component.name), 118)
      ]
    ]);

    return features;
  }

  getComponentTypeScore(type) {
    const scores = {
      'ui': 0.1,
      'api': 0.2,
      'service': 0.3,
      'database': 0.4,
      'middleware': 0.5,
      'library': 0.6,
      'configuration': 0.7,
      'infrastructure': 0.8
    };
    return scores[type] || 0.5;
  }

  calculateComponentAge(lastModified) {
    const ageInDays = (Date.now() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24);
    return Math.min(ageInDays / 365, 1); // Normalize to 0-1 (max 1 year)
  }

  encodeComponentName(name) {
    // Simple character encoding for component names
    const encoded = [];
    for (let i = 0; i < Math.min(name.length, 10); i++) {
      encoded.push(name.charCodeAt(i) / 255);
    }
    return encoded;
  }

  padArray(arr, targetLength) {
    const padded = [...arr];
    while (padded.length < targetLength) {
      padded.push(0);
    }
    return padded.slice(0, targetLength);
  }

  async predictIssues(features) {
    const predictions = await this.models.issueDetection.predict(features).array();
    const issues = [];
    const threshold = 0.7;

    const issueTypes = [
      'hole', 'gap', 'redundancy', 'inefficiency', 
      'security_vulnerability', 'performance_bottleneck', 
      'technical_debt', 'compatibility', 'scalability'
    ];

    predictions[0].forEach((confidence, index) => {
      if (confidence > threshold) {
        issues.push({
          type: issueTypes[index],
          severity: this.calculateSeverity(confidence),
          title: `ML-Detected ${issueTypes[index].replace('_', ' ')}`,
          description: `Machine learning analysis detected potential ${issueTypes[index]}`,
          mlConfidence: Math.round(confidence * 100),
          impactScore: Math.round(confidence * 80),
          autoFixable: false
        });
      }
    });

    features.dispose();
    return issues;
  }

  calculateSeverity(confidence) {
    if (confidence > 0.9) return 'critical';
    if (confidence > 0.8) return 'high';
    if (confidence > 0.7) return 'medium';
    if (confidence > 0.6) return 'low';
    return 'informational';
  }

  extractPatternFeatures() {
    // Convert existing patterns to feature vectors
    const features = [];
    
    for (const pattern of this.patterns) {
      const vector = [
        pattern.confidence / 100,
        pattern.locations.length / 10,
        pattern.isBeneficial ? 1 : 0,
        this.getPatternTypeScore(pattern.type),
        ...this.padArray(this.encodePatternName(pattern.name), 60)
      ];
      features.push(vector);
    }

    // Pad to consistent batch size
    while (features.length < 10) {
      features.push(new Array(64).fill(0));
    }

    return tf.tensor3d([features.slice(0, 10).map(f => 
      f.map((v, i) => new Array(64).fill(0).map((_, j) => j === 0 ? v : 0))
    )]);
  }

  getPatternTypeScore(type) {
    const scores = {
      'design_pattern': 0.9,
      'anti_pattern': 0.1,
      'code_smell': 0.2,
      'security_pattern': 0.5,
      'performance_pattern': 0.7,
      'ui_pattern': 0.6
    };
    return scores[type] || 0.5;
  }

  encodePatternName(name) {
    const words = name.toLowerCase().split(/\s+/);
    const encoded = [];
    
    for (const word of words.slice(0, 5)) {
      let sum = 0;
      for (let i = 0; i < word.length; i++) {
        sum += word.charCodeAt(i);
      }
      encoded.push(sum / 1000);
    }
    
    return encoded;
  }

  async predictPatterns(features) {
    const predictions = await this.models.patternRecognition.predict(features).array();
    const patterns = [];
    const threshold = 0.6;

    const patternTypes = [
      'design_pattern', 'anti_pattern', 'code_smell',
      'security_pattern', 'performance_pattern', 'ui_pattern'
    ];

    predictions[0].forEach((confidence, index) => {
      if (confidence > threshold) {
        patterns.push({
          name: `ML-Suggested ${patternTypes[index].replace('_', ' ')}`,
          type: patternTypes[index],
          confidence: Math.round(confidence * 100),
          description: `Machine learning suggests investigating this ${patternTypes[index]}`,
          isBeneficial: patternTypes[index] === 'design_pattern',
          locations: []
        });
      }
    });

    features.dispose();
    return patterns;
  }

  extractOptimizationFeatures() {
    const features = [];
    
    // Analyze component metrics for optimization opportunities
    for (const component of this.components.slice(0, 10)) {
      features.push([
        component.metrics.linesOfCode / 1000,
        component.metrics.cyclomaticComplexity / 100,
        component.metrics.maintainabilityIndex / 100,
        component.metrics.performanceScore / 100,
        Object.keys(component.dependencies).length / 50,
        ...new Array(59).fill(0) // Padding
      ]);
    }

    while (features.length < 10) {
      features.push(new Array(64).fill(0));
    }

    return tf.tensor2d(features[0]);
  }

  async predictOptimizations(features) {
    const predictions = await this.models.optimizationSuggestion.predict(features).array();
    const optimizations = [];
    const threshold = 0.65;

    const optimizationTypes = [
      'performance', 'code_refactor', 'architecture_redesign',
      'caching', 'database_optimization', 'bundle_size',
      'api_consolidation', 'component_reuse', 'dependency_update'
    ];

    predictions[0].forEach((confidence, index) => {
      if (confidence > threshold) {
        optimizations.push({
          type: optimizationTypes[index],
          title: `ML-Recommended ${optimizationTypes[index].replace('_', ' ')}`,
          description: `Machine learning analysis suggests ${optimizationTypes[index]} optimization`,
          mlConfidence: Math.round(confidence * 100),
          estimatedImpact: Math.round(confidence * 70),
          priority: Math.ceil(confidence * 10),
          implementationComplexity: this.calculateComplexity(confidence),
          currentState: {},
          proposedState: {},
          expectedImprovement: [{
            metric: 'Performance',
            currentValue: 100,
            expectedValue: Math.round(100 * (1 - confidence * 0.3)),
            improvementPercentage: Math.round(confidence * 30)
          }]
        });
      }
    });

    features.dispose();
    return optimizations;
  }

  calculateComplexity(confidence) {
    if (confidence > 0.9) return 'trivial';
    if (confidence > 0.8) return 'simple';
    if (confidence > 0.7) return 'moderate';
    if (confidence > 0.6) return 'complex';
    return 'very_complex';
  }

  async analyzeComponentUpgrades() {
    const upgrades = [];
    
    // Analyze dependencies for upgrade opportunities
    for (const component of this.components) {
      for (const [dep, version] of Object.entries(component.dependencies)) {
        // Simulate version analysis (in production, check npm registry)
        const needsUpgrade = Math.random() > 0.7;
        
        if (needsUpgrade) {
          upgrades.push({
            componentName: component.name,
            dependency: dep,
            currentVersion: version || 'unknown',
            recommendedVersion: 'latest',
            reason: 'Security updates and performance improvements',
            riskLevel: Math.random() > 0.5 ? 'low' : 'medium',
            mlConfidence: Math.round(70 + Math.random() * 30)
          });
        }
      }
    }
    
    return upgrades;
  }

  async performYOLOAnalysis() {
    const detections = [];
    
    // Simulate UI component analysis
    for (const component of this.components.filter(c => c.type === 'ui').slice(0, 5)) {
      // In production, this would capture actual UI screenshots
      const mockImageData = await this.createMockUIImage();
      const yoloResults = await this.yoloModel.detect(mockImageData);
      
      for (const detection of yoloResults) {
        if (detection.issue) {
          detections.push({
            componentPath: component.filePath,
            detectionType: 'ui_component',
            class: detection.class,
            issue: detection.issue,
            confidence: Math.round(detection.confidence * 100),
            boundingBox: detection.bbox,
            metadata: {
              component: component.name,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    }
    
    return detections;
  }

  async createMockUIImage() {
    // Create mock image data for YOLO processing using Jimp
    const image = new Jimp(800, 600, 0xFFFFFFFF);
    
    // Mock buttons (blue rectangles)
    for (let x = 50; x < 170; x++) {
      for (let y = 50; y < 90; y++) {
        image.setPixelColor(0x007BFFFF, x, y);
      }
    }
    for (let x = 200; x < 320; x++) {
      for (let y = 50; y < 90; y++) {
        image.setPixelColor(0x007BFFFF, x, y);
      }
    }
    
    // Mock form border
    for (let x = 50; x < 350; x++) {
      image.setPixelColor(0xDEE2E6FF, x, 120);
      image.setPixelColor(0xDEE2E6FF, x, 320);
    }
    for (let y = 120; y < 320; y++) {
      image.setPixelColor(0xDEE2E6FF, 50, y);
      image.setPixelColor(0xDEE2E6FF, 350, y);
    }
    
    // Mock navigation (dark gray bar)
    for (let x = 0; x < 800; x++) {
      for (let y = 0; y < 60; y++) {
        image.setPixelColor(0x343A40FF, x, y);
      }
    }
    
    return await image.getBufferAsync(Jimp.MIME_PNG);
  }

  async trainOnFeedback(feedback) {
    // Prepare training data from user feedback
    const trainingData = this.prepareFeedbackData(feedback);
    
    // Retrain appropriate model based on feedback type
    if (feedback.referenceType === 'issue') {
      await this.retrainIssueDetection(trainingData);
    } else if (feedback.referenceType === 'pattern') {
      await this.retrainPatternRecognition(trainingData);
    } else if (feedback.referenceType === 'opportunity') {
      await this.retrainOptimizationModel(trainingData);
    }
  }

  prepareFeedbackData(feedback) {
    // Convert feedback to training data format
    return {
      input: this.extractFeaturesFromFeedback(feedback),
      output: this.createLabelFromFeedback(feedback),
      weight: feedback.rating / 5 // Use rating as sample weight
    };
  }

  extractFeaturesFromFeedback(feedback) {
    // Extract features based on feedback content
    const features = [];
    
    if (feedback.correctedData) {
      // Use corrected data to create features
      Object.values(feedback.correctedData).forEach(value => {
        if (typeof value === 'number') {
          features.push(value / 100);
        } else if (typeof value === 'string') {
          features.push(value.length / 100);
        }
      });
    }
    
    // Pad to consistent size
    while (features.length < 128) {
      features.push(0);
    }
    
    return features.slice(0, 128);
  }

  createLabelFromFeedback(feedback) {
    // Create training label based on feedback
    const labels = new Array(9).fill(0);
    
    if (feedback.feedbackType === 'false_positive') {
      // Negative example
      return labels;
    }
    
    // Positive example - set appropriate class
    const classIndex = this.getClassIndexFromFeedback(feedback);
    if (classIndex >= 0 && classIndex < labels.length) {
      labels[classIndex] = 1;
    }
    
    return labels;
  }

  getClassIndexFromFeedback(feedback) {
    // Map feedback to class index
    const mapping = {
      'accuracy': 0,
      'usefulness': 1,
      'false_positive': 2,
      'missed_issue': 3,
      'priority_adjustment': 4
    };
    
    return mapping[feedback.feedbackType] || 0;
  }

  async retrainIssueDetection(trainingData) {
    const xs = tf.tensor2d([trainingData.input]);
    const ys = tf.tensor2d([trainingData.output]);
    
    await this.models.issueDetection.fit(xs, ys, {
      epochs: 5,
      batchSize: 1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Retraining epoch ${epoch}: loss = ${logs.loss}`);
        }
      }
    });
    
    xs.dispose();
    ys.dispose();
  }

  async retrainPatternRecognition(trainingData) {
    // Similar retraining for pattern recognition model
    const xs = tf.tensor3d([[trainingData.input.map(v => [v])]]);
    const ys = tf.tensor2d([trainingData.output.slice(0, 6)]);
    
    await this.models.patternRecognition.fit(xs, ys, {
      epochs: 5,
      batchSize: 1
    });
    
    xs.dispose();
    ys.dispose();
  }

  async retrainOptimizationModel(trainingData) {
    // Similar retraining for optimization model
    const xs = tf.tensor2d([trainingData.input.slice(0, 64)]);
    const ys = tf.tensor2d([trainingData.output]);
    
    await this.models.optimizationSuggestion.fit(xs, ys, {
      epochs: 5,
      batchSize: 1
    });
    
    xs.dispose();
    ys.dispose();
  }

  async saveModels() {
    // Save trained models for persistence
    const modelPaths = {
      issueDetection: './models/issue-detection',
      patternRecognition: './models/pattern-recognition',
      optimizationSuggestion: './models/optimization',
      componentAnalysis: './models/component-analysis'
    };
    
    for (const [name, model] of Object.entries(this.models)) {
      await model.save(`file://${modelPaths[name]}`);
    }
  }
}

// Initialize and run the worker
const worker = new MLAnalysisWorker(workerData);
worker.initialize().catch(error => {
  console.error('ML Worker failed:', error);
  process.exit(1);
});