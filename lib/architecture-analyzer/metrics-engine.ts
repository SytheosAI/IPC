import { CodeAnalysisResult, CodeMetrics } from './code-parser';
import { FileInfo } from './file-scanner';

export interface ProjectMetrics {
  overview: {
    totalFiles: number;
    totalLinesOfCode: number;
    totalComponents: number;
    totalFunctions: number;
    totalClasses: number;
    testCoverage: number;
    techDebtRatio: number;
  };
  quality: {
    averageComplexity: number;
    averageMaintainability: number;
    codeSmells: number;
    technicalDebtMinutes: number;
    duplicationPercentage: number;
  };
  performance: {
    bundleSize: BundleSizeMetrics;
    performanceScore: number;
    bottlenecks: PerformanceBottleneck[];
  };
  security: {
    vulnerabilities: SecurityVulnerability[];
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  architecture: {
    componentTypes: ComponentTypeBreakdown[];
    dependencyDepth: number;
    circularDependencies: string[][];
    orphanedFiles: string[];
    coupling: CouplingMetrics;
    cohesion: CohesionMetrics;
  };
  trends: {
    complexityTrend: TrendData[];
    qualityTrend: TrendData[];
    sizeTrend: TrendData[];
  };
}

export interface BundleSizeMetrics {
  totalSize: number;
  gzippedSize: number;
  largestFiles: { path: string; size: number }[];
  unusedExports: string[];
  duplicateCode: DuplicateCodeBlock[];
}

export interface PerformanceBottleneck {
  type: 'render' | 'memory' | 'network' | 'computation' | 'bundle';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  impact: number;
  suggestion: string;
}

export interface SecurityVulnerability {
  type: 'xss' | 'injection' | 'secrets' | 'dependencies' | 'permissions' | 'crypto';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  cve?: string;
  suggestion: string;
  autoFixable: boolean;
}

export interface ComponentTypeBreakdown {
  type: 'ui' | 'api' | 'service' | 'utility' | 'config' | 'test';
  count: number;
  averageComplexity: number;
  averageSize: number;
  healthScore: number;
}

export interface CouplingMetrics {
  afferentCoupling: number; // Ca - incoming dependencies
  efferentCoupling: number; // Ce - outgoing dependencies
  instability: number; // I = Ce / (Ca + Ce)
  abstractness: number; // A = abstract classes / total classes
  distance: number; // D = |A + I - 1|
}

export interface CohesionMetrics {
  lackOfCohesion: number; // LCOM - Lack of Cohesion of Methods
  cohesionScore: number;
  relationalCohesion: number;
}

export interface DuplicateCodeBlock {
  files: string[];
  lineStart: number;
  lineEnd: number;
  duplicatedLines: number;
  similarity: number;
}

export interface TrendData {
  date: string;
  value: number;
  change: number;
}

export class MetricsEngine {
  private analyses: Map<string, CodeAnalysisResult> = new Map();
  
  addAnalysis(filePath: string, analysis: CodeAnalysisResult): void {
    this.analyses.set(filePath, analysis);
  }

  calculateProjectMetrics(): ProjectMetrics {
    const analyses = Array.from(this.analyses.values());
    
    return {
      overview: this.calculateOverviewMetrics(analyses),
      quality: this.calculateQualityMetrics(analyses),
      performance: this.calculatePerformanceMetrics(analyses),
      security: this.calculateSecurityMetrics(analyses),
      architecture: this.calculateArchitectureMetrics(analyses),
      trends: this.calculateTrends(analyses)
    };
  }

  private calculateOverviewMetrics(analyses: CodeAnalysisResult[]): ProjectMetrics['overview'] {
    const totalFiles = analyses.length;
    const totalLinesOfCode = analyses.reduce((sum, a) => sum + a.metrics.linesOfCode, 0);
    const totalComponents = analyses.reduce((sum, a) => sum + a.components.length, 0);
    const totalFunctions = analyses.reduce((sum, a) => sum + a.functions.length, 0);
    const totalClasses = analyses.reduce((sum, a) => sum + a.classes.length, 0);
    
    const testFiles = analyses.filter(a => a.file.isTestFile).length;
    const testCoverage = (testFiles / Math.max(totalFiles, 1)) * 100;
    
    const avgComplexity = analyses.reduce((sum, a) => sum + a.metrics.cyclomaticComplexity, 0) / analyses.length;
    const techDebtRatio = this.calculateTechnicalDebtRatio(analyses);

    return {
      totalFiles,
      totalLinesOfCode,
      totalComponents,
      totalFunctions,
      totalClasses,
      testCoverage,
      techDebtRatio
    };
  }

  private calculateQualityMetrics(analyses: CodeAnalysisResult[]): ProjectMetrics['quality'] {
    const complexities = analyses.map(a => a.metrics.cyclomaticComplexity);
    const maintainabilities = analyses.map(a => a.metrics.maintainabilityIndex);
    
    const averageComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const averageMaintainability = maintainabilities.reduce((sum, m) => sum + m, 0) / maintainabilities.length;
    
    const codeSmells = analyses.reduce((sum, a) => 
      sum + a.issues.filter(i => i.type === 'smell').length, 0
    );
    
    const technicalDebtMinutes = this.calculateTechnicalDebtMinutes(analyses);
    const duplicationPercentage = this.calculateDuplicationPercentage(analyses);

    return {
      averageComplexity,
      averageMaintainability,
      codeSmells,
      technicalDebtMinutes,
      duplicationPercentage
    };
  }

  private calculatePerformanceMetrics(analyses: CodeAnalysisResult[]): ProjectMetrics['performance'] {
    const bundleSize = this.calculateBundleSize(analyses);
    const performanceScore = this.calculatePerformanceScore(analyses);
    const bottlenecks = this.detectPerformanceBottlenecks(analyses);

    return {
      bundleSize,
      performanceScore,
      bottlenecks
    };
  }

  private calculateSecurityMetrics(analyses: CodeAnalysisResult[]): ProjectMetrics['security'] {
    const vulnerabilities = this.detectSecurityVulnerabilities(analyses);
    const securityScore = this.calculateSecurityScore(vulnerabilities);
    const riskLevel = this.determineRiskLevel(vulnerabilities);

    return {
      vulnerabilities,
      securityScore,
      riskLevel
    };
  }

  private calculateArchitectureMetrics(analyses: CodeAnalysisResult[]): ProjectMetrics['architecture'] {
    const componentTypes = this.analyzeComponentTypes(analyses);
    const dependencyDepth = this.calculateDependencyDepth(analyses);
    const circularDependencies = this.detectCircularDependencies(analyses);
    const orphanedFiles = this.detectOrphanedFiles(analyses);
    const coupling = this.calculateCoupling(analyses);
    const cohesion = this.calculateCohesion(analyses);

    return {
      componentTypes,
      dependencyDepth,
      circularDependencies,
      orphanedFiles,
      coupling,
      cohesion
    };
  }

  private calculateTrends(analyses: CodeAnalysisResult[]): ProjectMetrics['trends'] {
    // For now, we'll return empty trends as we need historical data
    return {
      complexityTrend: [],
      qualityTrend: [],
      sizeTrend: []
    };
  }

  private calculateTechnicalDebtRatio(analyses: CodeAnalysisResult[]): number {
    let debtPoints = 0;
    let totalPoints = 0;

    analyses.forEach(analysis => {
      // Add debt for high complexity
      if (analysis.metrics.cyclomaticComplexity > 10) {
        debtPoints += (analysis.metrics.cyclomaticComplexity - 10) * 2;
      }
      
      // Add debt for low maintainability
      if (analysis.metrics.maintainabilityIndex < 50) {
        debtPoints += (50 - analysis.metrics.maintainabilityIndex);
      }
      
      // Add debt for code smells
      debtPoints += analysis.issues.length;
      
      // Add debt for high duplication
      debtPoints += analysis.metrics.duplicationRatio;
      
      totalPoints += 100; // Base points per file
    });

    return Math.min((debtPoints / Math.max(totalPoints, 1)) * 100, 100);
  }

  private calculateTechnicalDebtMinutes(analyses: CodeAnalysisResult[]): number {
    let totalMinutes = 0;

    analyses.forEach(analysis => {
      // High complexity functions
      analysis.functions.forEach(func => {
        if (func.complexity > 10) {
          totalMinutes += (func.complexity - 10) * 15; // 15 minutes per excess complexity point
        }
      });

      // Code smells
      analysis.issues.forEach(issue => {
        const minutesByType = {
          'complexity': 60,
          'duplication': 30,
          'smell': 20,
          'anti-pattern': 45,
          'performance': 40,
          'maintainability': 25
        };
        totalMinutes += minutesByType[issue.type] || 20;
      });

      // Large files
      if (analysis.metrics.linesOfCode > 500) {
        totalMinutes += Math.floor((analysis.metrics.linesOfCode - 500) / 50) * 10;
      }
    });

    return totalMinutes;
  }

  private calculateDuplicationPercentage(analyses: CodeAnalysisResult[]): number {
    const duplications = analyses.map(a => a.metrics.duplicationRatio);
    return duplications.reduce((sum, d) => sum + d, 0) / analyses.length;
  }

  private calculateBundleSize(analyses: CodeAnalysisResult[]): BundleSizeMetrics {
    const totalSize = analyses.reduce((sum, a) => sum + a.file.size, 0);
    const gzippedSize = Math.round(totalSize * 0.3); // Rough estimate
    
    const largestFiles = analyses
      .sort((a, b) => b.file.size - a.file.size)
      .slice(0, 10)
      .map(a => ({ path: a.file.relativePath, size: a.file.size }));

    const unusedExports = this.findUnusedExports(analyses);
    const duplicateCode = this.findDuplicateCodeBlocks(analyses);

    return {
      totalSize,
      gzippedSize,
      largestFiles,
      unusedExports,
      duplicateCode
    };
  }

  private calculatePerformanceScore(analyses: CodeAnalysisResult[]): number {
    let score = 100;
    
    analyses.forEach(analysis => {
      // Penalize high complexity
      if (analysis.metrics.cyclomaticComplexity > 15) {
        score -= 5;
      }
      
      // Penalize large files
      if (analysis.metrics.linesOfCode > 1000) {
        score -= 3;
      }
      
      // Penalize performance issues
      const performanceIssues = analysis.issues.filter(i => i.type === 'performance');
      score -= performanceIssues.length * 2;
      
      // Penalize deep nesting
      if (analysis.metrics.nestingDepth > 6) {
        score -= 2;
      }
    });
    
    return Math.max(score, 0);
  }

  private detectPerformanceBottlenecks(analyses: CodeAnalysisResult[]): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];
    
    analyses.forEach(analysis => {
      // Large components
      analysis.components.forEach(comp => {
        if (comp.complexity > 20) {
          bottlenecks.push({
            type: 'render',
            severity: 'high',
            location: `${analysis.file.relativePath}:${comp.lineStart}`,
            description: `Component '${comp.name}' has high complexity (${comp.complexity})`,
            impact: comp.complexity,
            suggestion: 'Break down into smaller components or optimize rendering logic'
          });
        }
      });
      
      // Large files
      if (analysis.file.size > 100000) { // 100KB
        bottlenecks.push({
          type: 'bundle',
          severity: 'medium',
          location: analysis.file.relativePath,
          description: `Large file size (${Math.round(analysis.file.size / 1024)}KB)`,
          impact: Math.round(analysis.file.size / 1024),
          suggestion: 'Consider code splitting or lazy loading'
        });
      }
      
      // Memory leaks potential
      if (analysis.file.content?.includes('setInterval') && !analysis.file.content.includes('clearInterval')) {
        bottlenecks.push({
          type: 'memory',
          severity: 'high',
          location: analysis.file.relativePath,
          description: 'Potential memory leak: setInterval without clearInterval',
          impact: 80,
          suggestion: 'Always clear intervals in cleanup functions'
        });
      }
    });
    
    return bottlenecks;
  }

  private detectSecurityVulnerabilities(analyses: CodeAnalysisResult[]): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    analyses.forEach(analysis => {
      const content = analysis.file.content || '';
      
      // XSS vulnerabilities
      if (content.includes('dangerouslySetInnerHTML') || content.includes('innerHTML =')) {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          location: analysis.file.relativePath,
          description: 'Potential XSS vulnerability through dynamic HTML injection',
          suggestion: 'Sanitize user input and avoid direct HTML injection',
          autoFixable: false
        });
      }
      
      // SQL injection
      if (content.match(/query\s*\(\s*['"`].*\$\{.*\}.*['"`]/)) {
        vulnerabilities.push({
          type: 'injection',
          severity: 'critical',
          location: analysis.file.relativePath,
          description: 'Potential SQL injection vulnerability',
          suggestion: 'Use parameterized queries or prepared statements',
          autoFixable: false
        });
      }
      
      // Hardcoded secrets
      if (content.match(/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{10,}['"]/i)) {
        vulnerabilities.push({
          type: 'secrets',
          severity: 'critical',
          location: analysis.file.relativePath,
          description: 'Hardcoded secrets detected',
          suggestion: 'Move secrets to environment variables',
          autoFixable: true
        });
      }
      
      // Insecure random
      if (content.includes('Math.random()') && 
          (content.includes('token') || content.includes('password') || content.includes('secret'))) {
        vulnerabilities.push({
          type: 'crypto',
          severity: 'high',
          location: analysis.file.relativePath,
          description: 'Insecure random number generation for security purposes',
          suggestion: 'Use crypto.randomBytes() for cryptographically secure random numbers',
          autoFixable: true
        });
      }
    });
    
    return vulnerabilities;
  }

  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    let score = 100;
    
    vulnerabilities.forEach(vuln => {
      const deduction = {
        'low': 2,
        'medium': 5,
        'high': 10,
        'critical': 20
      }[vuln.severity];
      
      score -= deduction;
    });
    
    return Math.max(score, 0);
  }

  private determineRiskLevel(vulnerabilities: SecurityVulnerability[]): 'low' | 'medium' | 'high' | 'critical' {
    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    const hasHigh = vulnerabilities.some(v => v.severity === 'high');
    const hasMedium = vulnerabilities.some(v => v.severity === 'medium');
    
    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  }

  private analyzeComponentTypes(analyses: CodeAnalysisResult[]): ComponentTypeBreakdown[] {
    const types = new Map<string, { files: CodeAnalysisResult[], totalComplexity: number, totalSize: number }>();
    
    analyses.forEach(analysis => {
      let type = 'utility';
      
      if (analysis.file.relativePath.includes('/api/')) type = 'api';
      else if (analysis.file.relativePath.includes('/components/')) type = 'ui';
      else if (analysis.file.relativePath.includes('/services/')) type = 'service';
      else if (analysis.file.isConfigFile) type = 'config';
      else if (analysis.file.isTestFile) type = 'test';
      
      if (!types.has(type)) {
        types.set(type, { files: [], totalComplexity: 0, totalSize: 0 });
      }
      
      const typeData = types.get(type)!;
      typeData.files.push(analysis);
      typeData.totalComplexity += analysis.metrics.cyclomaticComplexity;
      typeData.totalSize += analysis.metrics.linesOfCode;
    });
    
    return Array.from(types.entries()).map(([type, data]) => ({
      type: type as any,
      count: data.files.length,
      averageComplexity: data.totalComplexity / data.files.length,
      averageSize: data.totalSize / data.files.length,
      healthScore: this.calculateTypeHealth(data.files)
    }));
  }

  private calculateTypeHealth(files: CodeAnalysisResult[]): number {
    let score = 100;
    
    files.forEach(file => {
      if (file.metrics.cyclomaticComplexity > 10) score -= 2;
      if (file.metrics.maintainabilityIndex < 50) score -= 3;
      if (file.issues.length > 5) score -= 5;
    });
    
    return Math.max(score / files.length, 0);
  }

  private calculateDependencyDepth(analyses: CodeAnalysisResult[]): number {
    // This would require building a dependency graph
    // For now, return average import count as a proxy
    const importCounts = analyses.map(a => a.imports.length);
    return importCounts.reduce((sum, count) => sum + count, 0) / analyses.length;
  }

  private detectCircularDependencies(analyses: CodeAnalysisResult[]): string[][] {
    // This requires complex graph analysis
    // For now, return empty array
    return [];
  }

  private detectOrphanedFiles(analyses: CodeAnalysisResult[]): string[] {
    const referenced = new Set<string>();
    
    // Mark all imported files as referenced
    analyses.forEach(analysis => {
      analysis.imports.forEach(imp => {
        if (!imp.isExternal) {
          referenced.add(imp.source);
        }
      });
    });
    
    // Find files that are not referenced
    return analyses
      .filter(a => !referenced.has(a.file.relativePath) && 
                   !a.file.relativePath.includes('index') &&
                   !a.file.relativePath.includes('main') &&
                   !a.file.relativePath.includes('app'))
      .map(a => a.file.relativePath);
  }

  private calculateCoupling(analyses: CodeAnalysisResult[]): CouplingMetrics {
    // Simplified coupling calculation
    const totalImports = analyses.reduce((sum, a) => sum + a.imports.length, 0);
    const totalFiles = analyses.length;
    
    const afferentCoupling = totalImports / Math.max(totalFiles, 1);
    const efferentCoupling = totalImports / Math.max(totalFiles, 1);
    const instability = efferentCoupling / Math.max(afferentCoupling + efferentCoupling, 1);
    
    // Simplified abstractness calculation
    const abstractClasses = analyses.reduce((sum, a) => 
      sum + a.classes.filter(c => c.name.includes('Abstract') || c.name.includes('Base')).length, 0
    );
    const totalClasses = analyses.reduce((sum, a) => sum + a.classes.length, 0);
    const abstractness = abstractClasses / Math.max(totalClasses, 1);
    
    const distance = Math.abs(abstractness + instability - 1);
    
    return {
      afferentCoupling,
      efferentCoupling,
      instability,
      abstractness,
      distance
    };
  }

  private calculateCohesion(analyses: CodeAnalysisResult[]): CohesionMetrics {
    // Simplified cohesion calculation
    let totalCohesion = 0;
    let classCount = 0;
    
    analyses.forEach(analysis => {
      analysis.classes.forEach(cls => {
        // LCOM calculation (simplified)
        const methods = cls.methods.length;
        const properties = cls.properties.length;
        
        // Higher cohesion when methods and properties are balanced
        const cohesion = methods > 0 ? Math.min(properties / methods, 1) : 0;
        totalCohesion += cohesion;
        classCount++;
      });
    });
    
    const cohesionScore = classCount > 0 ? (totalCohesion / classCount) * 100 : 100;
    
    return {
      lackOfCohesion: 100 - cohesionScore,
      cohesionScore,
      relationalCohesion: cohesionScore
    };
  }

  private findUnusedExports(analyses: CodeAnalysisResult[]): string[] {
    const exported = new Set<string>();
    const imported = new Set<string>();
    
    analyses.forEach(analysis => {
      analysis.exports.forEach(exp => exported.add(exp.name));
      analysis.imports.forEach(imp => imp.imports.forEach(name => imported.add(name)));
    });
    
    return Array.from(exported).filter(exp => !imported.has(exp));
  }

  private findDuplicateCodeBlocks(analyses: CodeAnalysisResult[]): DuplicateCodeBlock[] {
    const blocks: DuplicateCodeBlock[] = [];
    
    // This is a simplified version - real duplicate detection would be more complex
    const codeBlocks = new Map<string, string[]>();
    
    analyses.forEach(analysis => {
      if (analysis.file.content) {
        const lines = analysis.file.content.split('\n');
        for (let i = 0; i < lines.length - 5; i++) {
          const block = lines.slice(i, i + 6).join('\n');
          if (block.trim().length > 100) { // Only consider substantial blocks
            if (!codeBlocks.has(block)) {
              codeBlocks.set(block, []);
            }
            codeBlocks.get(block)!.push(analysis.file.relativePath);
          }
        }
      }
    });
    
    codeBlocks.forEach((files, block) => {
      if (files.length > 1) {
        blocks.push({
          files: [...new Set(files)], // Remove duplicates
          lineStart: 1,
          lineEnd: 6,
          duplicatedLines: 6,
          similarity: 100
        });
      }
    });
    
    return blocks;
  }

  getHealthScore(): number {
    const metrics = this.calculateProjectMetrics();
    
    let score = 100;
    
    // Quality impact (40%)
    score -= (100 - metrics.quality.averageMaintainability) * 0.2;
    score -= Math.min(metrics.quality.averageComplexity - 5, 10) * 2;
    score -= Math.min(metrics.quality.codeSmells, 20) * 0.5;
    
    // Security impact (30%)
    score -= (100 - metrics.security.securityScore) * 0.3;
    
    // Performance impact (20%)
    score -= (100 - metrics.performance.performanceScore) * 0.2;
    
    // Architecture impact (10%)
    score -= metrics.overview.techDebtRatio * 0.1;
    
    return Math.max(Math.round(score), 0);
  }

  getIssuesPrioritized() {
    const allIssues = Array.from(this.analyses.values()).flatMap(a => a.issues);
    
    return allIssues.sort((a, b) => {
      const severityWeight = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aWeight = severityWeight[a.severity] || 0;
      const bWeight = severityWeight[b.severity] || 0;
      
      return bWeight - aWeight;
    });
  }

  getOptimizationOpportunities() {
    const opportunities = [];
    const metrics = this.calculateProjectMetrics();
    
    // Bundle size optimization
    if (metrics.performance.bundleSize.totalSize > 1000000) { // 1MB
      opportunities.push({
        type: 'bundle_size',
        title: 'Reduce bundle size through code splitting',
        impact: Math.round((metrics.performance.bundleSize.totalSize - 1000000) / 10000),
        effort: 'medium',
        description: 'Large bundle size affects loading performance'
      });
    }
    
    // Duplicate code
    if (metrics.quality.duplicationPercentage > 10) {
      opportunities.push({
        type: 'duplication',
        title: 'Extract common code to reduce duplication',
        impact: Math.round(metrics.quality.duplicationPercentage),
        effort: 'high',
        description: 'High code duplication affects maintainability'
      });
    }
    
    // Technical debt
    if (metrics.overview.techDebtRatio > 20) {
      opportunities.push({
        type: 'technical_debt',
        title: 'Address technical debt backlog',
        impact: Math.round(metrics.quality.technicalDebtMinutes / 60),
        effort: 'high',
        description: 'High technical debt slows development'
      });
    }
    
    return opportunities.sort((a, b) => b.impact - a.impact);
  }
}