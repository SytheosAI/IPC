import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { Worker } from 'worker_threads';

interface AnalysisConfig {
  projectPath: string;
  analysisType: 'full' | 'partial' | 'component' | 'ui' | 'backend' | 'database' | 'security' | 'performance';
  mlModelVersion?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  deepScan?: boolean;
}

interface ComponentInfo {
  name: string;
  type: 'ui' | 'api' | 'service' | 'database' | 'middleware' | 'library' | 'configuration' | 'infrastructure';
  filePath: string;
  modulePath: string;
  version?: string;
  dependencies: Record<string, string>;
  metrics: ComponentMetrics;
  hash: string;
  lastModified: Date;
}

interface ComponentMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  testCoverage?: number;
  performanceScore?: number;
  securityScore?: number;
}

interface Pattern {
  name: string;
  type: 'design_pattern' | 'anti_pattern' | 'code_smell' | 'security_pattern' | 'performance_pattern' | 'ui_pattern';
  locations: Array<{ file: string; line: number; column: number }>;
  confidence: number;
  description: string;
  isBeneficial: boolean;
}

interface Issue {
  type: 'hole' | 'gap' | 'redundancy' | 'inefficiency' | 'security_vulnerability' | 'performance_bottleneck' | 'technical_debt' | 'compatibility' | 'scalability';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  title: string;
  description: string;
  location: {
    file?: string;
    component?: string;
    line?: number;
    column?: number;
  };
  impactScore: number;
  detectionConfidence: number;
  suggestedFix?: string;
  autoFixable: boolean;
  fixScript?: string;
}

interface OptimizationOpportunity {
  type: 'performance' | 'code_refactor' | 'architecture_redesign' | 'caching' | 'database_optimization' | 'bundle_size' | 'api_consolidation' | 'component_reuse' | 'dependency_update';
  title: string;
  description: string;
  component?: string;
  currentState: any;
  proposedState: any;
  expectedImprovement: {
    metric: string;
    currentValue: number;
    expectedValue: number;
    improvementPercentage: number;
  }[];
  implementationComplexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';
  priority: number;
  estimatedImpact: number;
  mlConfidence: number;
}

export class ArchitecturalAnalyzer {
  private supabase: any;
  private config: AnalysisConfig;
  private components: Map<string, ComponentInfo> = new Map();
  private patterns: Pattern[] = [];
  private issues: Issue[] = [];
  private opportunities: OptimizationOpportunity[] = [];
  private analysisRunId?: string;
  private mlWorker?: Worker;

  constructor(supabaseUrl: string, supabaseKey: string, config: AnalysisConfig) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;
  }

  async startAnalysis(): Promise<void> {
    try {
      const runNumber = `RUN-${Date.now()}`;
      const { data, error } = await this.supabase
        .from('architecture_analysis_runs')
        .insert({
          run_number: runNumber,
          analysis_type: this.config.analysisType,
          status: 'scanning',
          ml_model_version: this.config.mlModelVersion || 'v1.0.0'
        })
        .select()
        .single();

      if (error) throw error;
      this.analysisRunId = data.id;

      await this.scanComponents();
      await this.detectPatterns();
      await this.analyzeArchitecture();
      await this.runMLAnalysis();
      await this.generateOptimizations();
      await this.saveResults();
      await this.updateAnalysisStatus('completed');
    } catch (error) {
      console.error('Analysis failed:', error);
      await this.updateAnalysisStatus('failed');
      throw error;
    }
  }

  private async scanComponents(): Promise<void> {
    await this.updateAnalysisStatus('scanning');
    const files = await this.getAllFiles(this.config.projectPath);
    
    for (const file of files) {
      if (this.shouldAnalyzeFile(file)) {
        const component = await this.analyzeFile(file);
        if (component) {
          this.components.set(component.filePath, component);
          await this.saveComponent(component);
        }
      }
    }
  }

  private async analyzeFile(filePath: string): Promise<ComponentInfo | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath);
      
      const component: ComponentInfo = {
        name: path.basename(filePath, ext),
        type: this.determineComponentType(filePath, content),
        filePath: filePath,
        modulePath: path.relative(this.config.projectPath, filePath),
        dependencies: await this.extractDependencies(content, ext),
        metrics: await this.calculateMetrics(content, ext),
        hash: this.calculateHash(content),
        lastModified: stats.mtime
      };

      return component;
    } catch (error) {
      console.error(`Failed to analyze file ${filePath}:`, error);
      return null;
    }
  }

  private determineComponentType(filePath: string, content: string): ComponentInfo['type'] {
    if (filePath.includes('/api/') || filePath.includes('/services/')) return 'api';
    if (filePath.includes('/components/') || filePath.includes('/pages/')) return 'ui';
    if (filePath.includes('/lib/') || filePath.includes('/utils/')) return 'library';
    if (filePath.includes('/middleware')) return 'middleware';
    if (filePath.includes('.config.') || filePath.includes('config/')) return 'configuration';
    if (filePath.includes('/db/') || filePath.includes('/models/')) return 'database';
    if (filePath.includes('/infrastructure/') || filePath.includes('docker')) return 'infrastructure';
    return 'service';
  }

  private async extractDependencies(content: string, ext: string): Promise<Record<string, string>> {
    const dependencies: Record<string, string> = {};
    
    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
      const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const dep = match[1];
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          dependencies[dep] = 'unknown';
        }
      }
      
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        const dep = match[1];
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          dependencies[dep] = 'unknown';
        }
      }
    }
    
    return dependencies;
  }

  private async calculateMetrics(content: string, ext: string): Promise<ComponentMetrics> {
    const lines = content.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
    
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(linesOfCode, cyclomaticComplexity);
    const technicalDebtRatio = this.calculateTechnicalDebt(content);

    return {
      linesOfCode,
      cyclomaticComplexity,
      maintainabilityIndex,
      technicalDebtRatio,
      testCoverage: 0,
      performanceScore: 85,
      securityScore: 90
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    let complexity = 1;
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\?\s*:/g,
      /&&/g,
      /\|\|/g
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  private calculateMaintainabilityIndex(loc: number, complexity: number): number {
    const halsteadVolume = loc * Math.log2(loc + 1);
    const mi = Math.max(0, (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * complexity - 16.2 * Math.log(loc)) * 100 / 171);
    return Math.round(mi);
  }

  private calculateTechnicalDebt(content: string): number {
    let debt = 0;
    const todoComments = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
    const longFunctions = (content.match(/function[\s\S]{1000,}?\}/g) || []).length;
    const deepNesting = (content.match(/\{[\s\S]*?\{[\s\S]*?\{[\s\S]*?\{[\s\S]*?\{/g) || []).length;
    
    debt += todoComments * 2;
    debt += longFunctions * 5;
    debt += deepNesting * 3;
    
    return Math.min(debt, 100);
  }

  private calculateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private async detectPatterns(): Promise<void> {
    await this.updateAnalysisStatus('analyzing');
    
    const patternDetectors = [
      this.detectSingletonPattern.bind(this),
      this.detectFactoryPattern.bind(this),
      this.detectObserverPattern.bind(this),
      this.detectAntiPatterns.bind(this),
      this.detectCodeSmells.bind(this),
      this.detectSecurityPatterns.bind(this),
      this.detectPerformancePatterns.bind(this)
    ];

    for (const detector of patternDetectors) {
      const detectedPatterns = await detector();
      this.patterns.push(...detectedPatterns);
    }

    await this.savePatternsToDatabase();
  }

  private async detectSingletonPattern(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const singletonRegex = /class\s+(\w+)[\s\S]*?static\s+instance[\s\S]*?getInstance/g;
      let match;
      
      while ((match = singletonRegex.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        patterns.push({
          name: `Singleton: ${match[1]}`,
          type: 'design_pattern',
          locations: [{
            file: filePath,
            line: lines.length,
            column: 0
          }],
          confidence: 95,
          description: 'Singleton design pattern detected',
          isBeneficial: true
        });
      }
    }
    
    return patterns;
  }

  private async detectFactoryPattern(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const factoryRegex = /class\s+(\w*Factory\w*)|(create\w+)\s*\([^)]*\)\s*:\s*\w+/g;
      let match;
      
      while ((match = factoryRegex.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        patterns.push({
          name: `Factory: ${match[1] || match[2]}`,
          type: 'design_pattern',
          locations: [{
            file: filePath,
            line: lines.length,
            column: 0
          }],
          confidence: 85,
          description: 'Factory design pattern detected',
          isBeneficial: true
        });
      }
    }
    
    return patterns;
  }

  private async detectObserverPattern(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const observerRegex = /(subscribe|addEventListener|on\w+|emit|dispatch|notify)/g;
      const matches = content.match(observerRegex);
      
      if (matches && matches.length > 3) {
        patterns.push({
          name: 'Observer/Event Pattern',
          type: 'design_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 75,
          description: 'Observer/Event-driven pattern detected',
          isBeneficial: true
        });
      }
    }
    
    return patterns;
  }

  private async detectAntiPatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      if (content.length > 5000 && component.metrics.linesOfCode > 500) {
        patterns.push({
          name: 'God Object',
          type: 'anti_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 80,
          description: 'Class/module is too large and handles too many responsibilities',
          isBeneficial: false
        });
      }
      
      const deeplyNestedCallbacks = /\}\s*\)\s*\}\s*\)\s*\}\s*\)/g;
      if (deeplyNestedCallbacks.test(content)) {
        patterns.push({
          name: 'Callback Hell',
          type: 'anti_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 90,
          description: 'Deeply nested callbacks detected',
          isBeneficial: false
        });
      }
    }
    
    return patterns;
  }

  private async detectCodeSmells(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const longParameterList = /function\s+\w+\s*\([^)]{100,}\)/g;
      if (longParameterList.test(content)) {
        patterns.push({
          name: 'Long Parameter List',
          type: 'code_smell',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 85,
          description: 'Function with too many parameters',
          isBeneficial: false
        });
      }
      
      const duplicateCode = this.findDuplicateCode(content);
      if (duplicateCode.length > 0) {
        patterns.push({
          name: 'Duplicate Code',
          type: 'code_smell',
          locations: duplicateCode,
          confidence: 75,
          description: 'Duplicate code blocks detected',
          isBeneficial: false
        });
      }
    }
    
    return patterns;
  }

  private async detectSecurityPatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const sqlInjectionRisk = /query\s*\(\s*['"`].*\$\{.*\}.*['"`]/g;
      if (sqlInjectionRisk.test(content)) {
        patterns.push({
          name: 'SQL Injection Risk',
          type: 'security_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 95,
          description: 'Potential SQL injection vulnerability',
          isBeneficial: false
        });
      }
      
      const hardcodedSecrets = /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{10,}['"]/gi;
      if (hardcodedSecrets.test(content)) {
        patterns.push({
          name: 'Hardcoded Secrets',
          type: 'security_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 99,
          description: 'Hardcoded secrets or API keys detected',
          isBeneficial: false
        });
      }
    }
    
    return patterns;
  }

  private async detectPerformancePatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const nestedLoops = /for\s*\([^)]*\)[\s\S]*?for\s*\([^)]*\)/g;
      if (nestedLoops.test(content)) {
        patterns.push({
          name: 'Nested Loops',
          type: 'performance_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 70,
          description: 'Nested loops detected - potential O(n²) complexity',
          isBeneficial: false
        });
      }
      
      const inefficientArrayOps = /\.forEach\([\s\S]*?\.map\(|\.filter\([\s\S]*?\.map\(/g;
      if (inefficientArrayOps.test(content)) {
        patterns.push({
          name: 'Inefficient Array Operations',
          type: 'performance_pattern',
          locations: [{
            file: filePath,
            line: 0,
            column: 0
          }],
          confidence: 80,
          description: 'Multiple array iterations that could be combined',
          isBeneficial: false
        });
      }
    }
    
    return patterns;
  }

  private findDuplicateCode(content: string): Array<{ file: string; line: number; column: number }> {
    const blocks: string[] = [];
    const duplicates: Array<{ file: string; line: number; column: number }> = [];
    
    const lines = content.split('\n');
    for (let i = 0; i < lines.length - 10; i++) {
      const block = lines.slice(i, i + 10).join('\n');
      if (blocks.includes(block) && block.trim().length > 100) {
        duplicates.push({
          file: this.config.projectPath,
          line: i + 1,
          column: 0
        });
      }
      blocks.push(block);
    }
    
    return duplicates;
  }

  private async analyzeArchitecture(): Promise<void> {
    await this.detectArchitecturalIssues();
    await this.detectRedundancies();
    await this.detectGaps();
    await this.detectSecurityVulnerabilities();
    await this.detectPerformanceBottlenecks();
  }

  private async detectArchitecturalIssues(): Promise<void> {
    const circularDependencies = this.findCircularDependencies();
    for (const cycle of circularDependencies) {
      this.issues.push({
        type: 'technical_debt',
        severity: 'high',
        title: 'Circular Dependency Detected',
        description: `Circular dependency between components: ${cycle.join(' -> ')}`,
        location: {
          component: cycle[0]
        },
        impactScore: 75,
        detectionConfidence: 90,
        suggestedFix: 'Refactor to remove circular dependencies using dependency injection or interfaces',
        autoFixable: false
      });
    }

    const orphanedComponents = this.findOrphanedComponents();
    for (const component of orphanedComponents) {
      this.issues.push({
        type: 'gap',
        severity: 'low',
        title: 'Orphaned Component',
        description: `Component ${component} is not referenced by any other component`,
        location: {
          component
        },
        impactScore: 20,
        detectionConfidence: 85,
        suggestedFix: 'Remove if unused or integrate into the application',
        autoFixable: false
      });
    }
  }

  private findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (component: string, path: string[]): void => {
      if (stack.has(component)) {
        const cycleStart = path.indexOf(component);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(component)) return;

      visited.add(component);
      stack.add(component);
      path.push(component);

      const componentInfo = this.components.get(component);
      if (componentInfo) {
        for (const dep of Object.keys(componentInfo.dependencies)) {
          dfs(dep, [...path]);
        }
      }

      stack.delete(component);
    };

    for (const component of this.components.keys()) {
      if (!visited.has(component)) {
        dfs(component, []);
      }
    }

    return cycles;
  }

  private findOrphanedComponents(): string[] {
    const referenced = new Set<string>();
    
    for (const component of this.components.values()) {
      for (const dep of Object.keys(component.dependencies)) {
        referenced.add(dep);
      }
    }

    const orphaned: string[] = [];
    for (const [path, component] of this.components) {
      if (!referenced.has(component.name) && !path.includes('index') && !path.includes('main')) {
        orphaned.push(component.name);
      }
    }

    return orphaned;
  }

  private async detectRedundancies(): Promise<void> {
    const functionSignatures = new Map<string, string[]>();

    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:\([^)]*\)|\w+\s*=>)/g;
      let match;
      
      while ((match = functionRegex.exec(content)) !== null) {
        const signature = match[0];
        if (!functionSignatures.has(signature)) {
          functionSignatures.set(signature, []);
        }
        functionSignatures.get(signature)!.push(filePath);
      }
    }

    for (const [signature, files] of functionSignatures) {
      if (files.length > 1) {
        this.issues.push({
          type: 'redundancy',
          severity: 'medium',
          title: 'Duplicate Function Implementation',
          description: `Similar function found in ${files.length} files`,
          location: {
            file: files[0]
          },
          impactScore: 40,
          detectionConfidence: 75,
          suggestedFix: 'Extract to shared utility module',
          autoFixable: false
        });
      }
    }
  }

  private async detectGaps(): Promise<void> {
    const requiredPatterns = [
      { pattern: 'error handling', regex: /try\s*\{[\s\S]*?\}\s*catch/g },
      { pattern: 'logging', regex: /console\.(log|error|warn|info)|logger\./g },
      { pattern: 'input validation', regex: /validate|validation|schema\./gi },
      { pattern: 'authentication check', regex: /auth|authenticated|isLoggedIn/gi }
    ];

    for (const [filePath, component] of this.components) {
      if (component.type === 'api' || component.type === 'service') {
        const content = await fs.readFile(filePath, 'utf-8');
        
        for (const { pattern, regex } of requiredPatterns) {
          if (!regex.test(content)) {
            this.issues.push({
              type: 'gap',
              severity: 'medium',
              title: `Missing ${pattern}`,
              description: `Component lacks ${pattern} implementation`,
              location: {
                file: filePath
              },
              impactScore: 50,
              detectionConfidence: 70,
              suggestedFix: `Add ${pattern} to ensure robustness`,
              autoFixable: false
            });
          }
        }
      }
    }
  }

  private async detectSecurityVulnerabilities(): Promise<void> {
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const xssRisk = /innerHTML\s*=|dangerouslySetInnerHTML/g;
      if (xssRisk.test(content)) {
        this.issues.push({
          type: 'security_vulnerability',
          severity: 'high',
          title: 'Potential XSS Vulnerability',
          description: 'Direct HTML injection detected',
          location: {
            file: filePath
          },
          impactScore: 85,
          detectionConfidence: 90,
          suggestedFix: 'Sanitize input or use safe rendering methods',
          autoFixable: false
        });
      }

      const insecureRandom = /Math\.random\(\)/g;
      if (insecureRandom.test(content) && (content.includes('token') || content.includes('password') || content.includes('secret'))) {
        this.issues.push({
          type: 'security_vulnerability',
          severity: 'critical',
          title: 'Insecure Random Number Generation',
          description: 'Math.random() used for security-sensitive operations',
          location: {
            file: filePath
          },
          impactScore: 95,
          detectionConfidence: 95,
          suggestedFix: 'Use crypto.randomBytes() or similar secure random generation',
          autoFixable: true,
          fixScript: `content.replace(/Math\\.random\\(\\)/g, 'crypto.randomBytes(32).toString("hex")')`
        });
      }
    }
  }

  private async detectPerformanceBottlenecks(): Promise<void> {
    for (const [filePath, component] of this.components) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      const syncFileOps = /readFileSync|writeFileSync|existsSync/g;
      if (syncFileOps.test(content)) {
        this.issues.push({
          type: 'performance_bottleneck',
          severity: 'medium',
          title: 'Synchronous File Operations',
          description: 'Blocking file operations detected',
          location: {
            file: filePath
          },
          impactScore: 60,
          detectionConfidence: 95,
          suggestedFix: 'Use async file operations to prevent blocking',
          autoFixable: true,
          fixScript: `content.replace(/readFileSync/g, 'readFile').replace(/writeFileSync/g, 'writeFile')`
        });
      }

      const nPlusOneQueries = /for\s*\([^)]*\)[\s\S]*?await\s+.*\.(find|query|fetch)/g;
      if (nPlusOneQueries.test(content)) {
        this.issues.push({
          type: 'performance_bottleneck',
          severity: 'high',
          title: 'N+1 Query Problem',
          description: 'Database queries inside loops detected',
          location: {
            file: filePath
          },
          impactScore: 80,
          detectionConfidence: 85,
          suggestedFix: 'Batch queries or use eager loading',
          autoFixable: false
        });
      }
    }
  }

  private async runMLAnalysis(): Promise<void> {
    await this.updateAnalysisStatus('ml_processing');
    
    this.mlWorker = new Worker(path.join(__dirname, 'ml-worker.js'), {
      workerData: {
        components: Array.from(this.components.values()),
        patterns: this.patterns,
        issues: this.issues
      }
    });

    return new Promise((resolve, reject) => {
      this.mlWorker!.on('message', (message) => {
        if (message.type === 'predictions') {
          this.processMlPredictions(message.data);
          resolve();
        }
      });

      this.mlWorker!.on('error', reject);
      this.mlWorker!.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`ML Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  private processMlPredictions(predictions: any): void {
    if (predictions.newIssues) {
      for (const issue of predictions.newIssues) {
        issue.detectionConfidence = issue.mlConfidence;
        this.issues.push(issue);
      }
    }

    if (predictions.patternSuggestions) {
      for (const pattern of predictions.patternSuggestions) {
        this.patterns.push(pattern);
      }
    }

    if (predictions.optimizationSuggestions) {
      for (const opportunity of predictions.optimizationSuggestions) {
        this.opportunities.push(opportunity);
      }
    }
  }

  private async generateOptimizations(): Promise<void> {
    this.generateBundleOptimizations();
    this.generateCachingOpportunities();
    this.generateCodeRefactoringSuggestions();
    this.generateApiOptimizations();
    this.generateDatabaseOptimizations();
  }

  private generateBundleOptimizations(): void {
    const largeComponents = Array.from(this.components.values())
      .filter(c => c.metrics.linesOfCode > 300);

    for (const component of largeComponents) {
      this.opportunities.push({
        type: 'bundle_size',
        title: 'Code Splitting Opportunity',
        description: `Component ${component.name} is large and could benefit from code splitting`,
        component: component.name,
        currentState: {
          size: component.metrics.linesOfCode,
          loadTime: 'synchronous'
        },
        proposedState: {
          size: Math.round(component.metrics.linesOfCode * 0.3),
          loadTime: 'lazy-loaded'
        },
        expectedImprovement: [{
          metric: 'Initial Bundle Size',
          currentValue: component.metrics.linesOfCode,
          expectedValue: Math.round(component.metrics.linesOfCode * 0.3),
          improvementPercentage: 70
        }],
        implementationComplexity: 'simple',
        priority: 7,
        estimatedImpact: 65,
        mlConfidence: 80
      });
    }
  }

  private generateCachingOpportunities(): void {
    for (const [filePath, component] of this.components) {
      if (component.type === 'api') {
        this.opportunities.push({
          type: 'caching',
          title: 'API Response Caching',
          description: `Add caching layer to ${component.name} API endpoints`,
          component: component.name,
          currentState: {
            caching: 'none',
            responseTime: 'variable'
          },
          proposedState: {
            caching: 'redis',
            ttl: 300,
            responseTime: 'consistent'
          },
          expectedImprovement: [{
            metric: 'Response Time',
            currentValue: 200,
            expectedValue: 50,
            improvementPercentage: 75
          }],
          implementationComplexity: 'moderate',
          priority: 8,
          estimatedImpact: 70,
          mlConfidence: 85
        });
      }
    }
  }

  private generateCodeRefactoringSuggestions(): void {
    for (const [filePath, component] of this.components) {
      if (component.metrics.maintainabilityIndex < 50) {
        this.opportunities.push({
          type: 'code_refactor',
          title: `Refactor ${component.name} for Better Maintainability`,
          description: 'Low maintainability index indicates need for refactoring',
          component: component.name,
          currentState: {
            maintainabilityIndex: component.metrics.maintainabilityIndex,
            complexity: component.metrics.cyclomaticComplexity
          },
          proposedState: {
            maintainabilityIndex: 75,
            complexity: Math.round(component.metrics.cyclomaticComplexity * 0.5)
          },
          expectedImprovement: [{
            metric: 'Maintainability Index',
            currentValue: component.metrics.maintainabilityIndex,
            expectedValue: 75,
            improvementPercentage: 50
          }],
          implementationComplexity: 'complex',
          priority: 6,
          estimatedImpact: 60,
          mlConfidence: 75
        });
      }
    }
  }

  private generateApiOptimizations(): void {
    const apiComponents = Array.from(this.components.values())
      .filter(c => c.type === 'api');

    if (apiComponents.length > 10) {
      this.opportunities.push({
        type: 'api_consolidation',
        title: 'API Endpoint Consolidation',
        description: 'Multiple similar API endpoints could be consolidated',
        currentState: {
          endpoints: apiComponents.length,
          pattern: 'scattered'
        },
        proposedState: {
          endpoints: Math.round(apiComponents.length * 0.6),
          pattern: 'RESTful'
        },
        expectedImprovement: [{
          metric: 'API Endpoints',
          currentValue: apiComponents.length,
          expectedValue: Math.round(apiComponents.length * 0.6),
          improvementPercentage: 40
        }],
        implementationComplexity: 'moderate',
        priority: 5,
        estimatedImpact: 55,
        mlConfidence: 70
      });
    }
  }

  private generateDatabaseOptimizations(): void {
    const dbComponents = Array.from(this.components.values())
      .filter(c => c.type === 'database');

    for (const component of dbComponents) {
      this.opportunities.push({
        type: 'database_optimization',
        title: `Optimize Database Queries in ${component.name}`,
        description: 'Add indexes and optimize query patterns',
        component: component.name,
        currentState: {
          indexing: 'basic',
          queryOptimization: 'none'
        },
        proposedState: {
          indexing: 'optimized',
          queryOptimization: 'applied'
        },
        expectedImprovement: [{
          metric: 'Query Performance',
          currentValue: 100,
          expectedValue: 25,
          improvementPercentage: 75
        }],
        implementationComplexity: 'simple',
        priority: 9,
        estimatedImpact: 80,
        mlConfidence: 90
      });
    }
  }

  private async saveResults(): Promise<void> {
    await this.saveIssuesToDatabase();
    await this.saveOpportunitiesToDatabase();
    await this.saveMetrics();
  }

  private async saveComponent(component: ComponentInfo): Promise<void> {
    const { error } = await this.supabase
      .from('system_components')
      .upsert({
        component_name: component.name,
        component_type: component.type,
        file_path: component.filePath,
        module_path: component.modulePath,
        version: component.version,
        dependencies: component.dependencies,
        metrics: component.metrics,
        component_hash: component.hash,
        last_modified: component.lastModified
      }, {
        onConflict: 'file_path'
      });

    if (error) {
      console.error('Failed to save component:', error);
    }
  }

  private async savePatternsToDatabase(): Promise<void> {
    for (const pattern of this.patterns) {
      const { error } = await this.supabase
        .from('architecture_patterns')
        .insert({
          pattern_name: pattern.name,
          pattern_type: pattern.type,
          description: pattern.description,
          occurrences: pattern.locations.length,
          locations: pattern.locations,
          is_beneficial: pattern.isBeneficial,
          confidence_score: pattern.confidence
        });

      if (error) {
        console.error('Failed to save pattern:', error);
      }
    }
  }

  private async saveIssuesToDatabase(): Promise<void> {
    for (const issue of this.issues) {
      const { error } = await this.supabase
        .from('architecture_issues')
        .insert({
          analysis_run_id: this.analysisRunId,
          issue_type: issue.type,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          location: issue.location,
          impact_score: issue.impactScore,
          detection_confidence: issue.detectionConfidence,
          suggested_fix: issue.suggestedFix,
          auto_fixable: issue.autoFixable,
          fix_script: issue.fixScript
        });

      if (error) {
        console.error('Failed to save issue:', error);
      }
    }
  }

  private async saveOpportunitiesToDatabase(): Promise<void> {
    for (const opportunity of this.opportunities) {
      const { error } = await this.supabase
        .from('optimization_opportunities')
        .insert({
          analysis_run_id: this.analysisRunId,
          opportunity_type: opportunity.type,
          title: opportunity.title,
          description: opportunity.description,
          current_state: opportunity.currentState,
          proposed_state: opportunity.proposedState,
          expected_improvement: opportunity.expectedImprovement,
          implementation_complexity: opportunity.implementationComplexity,
          priority: opportunity.priority,
          estimated_impact: opportunity.estimatedImpact,
          ml_confidence: opportunity.mlConfidence
        });

      if (error) {
        console.error('Failed to save opportunity:', error);
      }
    }
  }

  private async saveMetrics(): Promise<void> {
    const overallHealth = this.calculateOverallHealth();
    
    const { error } = await this.supabase
      .from('architecture_analysis_runs')
      .update({
        total_components_analyzed: this.components.size,
        total_issues_found: this.issues.length,
        total_opportunities_found: this.opportunities.length,
        overall_health_score: overallHealth
      })
      .eq('id', this.analysisRunId);

    if (error) {
      console.error('Failed to update analysis metrics:', error);
    }
  }

  private calculateOverallHealth(): number {
    const issueWeight = this.issues.reduce((sum, issue) => {
      const severityWeight = {
        critical: 10,
        high: 7,
        medium: 4,
        low: 2,
        informational: 1
      }[issue.severity];
      return sum + (severityWeight * issue.impactScore / 100);
    }, 0);

    const maxPossibleIssueWeight = this.components.size * 10 * 5;
    const healthFromIssues = Math.max(0, 100 - (issueWeight / maxPossibleIssueWeight * 100));

    const avgMaintainability = Array.from(this.components.values())
      .reduce((sum, c) => sum + c.metrics.maintainabilityIndex, 0) / this.components.size;

    const healthScore = (healthFromIssues * 0.6) + (avgMaintainability * 0.4);
    return Math.round(healthScore);
  }

  private async updateAnalysisStatus(status: string): Promise<void> {
    if (!this.analysisRunId) return;

    const updateData: any = { status };
    if (status === 'completed' || status === 'failed') {
      updateData.end_time = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('architecture_analysis_runs')
      .update(updateData)
      .eq('id', this.analysisRunId);

    if (error) {
      console.error('Failed to update analysis status:', error);
    }
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const readDir = async (currentDir: string) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.shouldSkipDirectory(entry.name)) {
            await readDir(fullPath);
          }
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    };

    await readDir(dir);
    return files;
  }

  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache'];
    return skipDirs.includes(dirName);
  }

  private shouldAnalyzeFile(filePath: string): boolean {
    const supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.sql', '.css', '.scss'];
    const ext = path.extname(filePath);
    
    if (!supportedExtensions.includes(ext)) return false;
    
    if (this.config.includePatterns && this.config.includePatterns.length > 0) {
      return this.config.includePatterns.some(pattern => filePath.includes(pattern));
    }
    
    if (this.config.excludePatterns && this.config.excludePatterns.length > 0) {
      return !this.config.excludePatterns.some(pattern => filePath.includes(pattern));
    }
    
    return true;
  }

  async cleanup(): Promise<void> {
    if (this.mlWorker) {
      await this.mlWorker.terminate();
    }
  }
}