import * as path from 'path';
import { FileInfo } from './file-scanner';

export interface ImportInfo {
  source: string;
  imports: string[];
  isDefault: boolean;
  isNamespace: boolean;
  isDynamic: boolean;
  line: number;
  isExternal: boolean;
}

export interface ExportInfo {
  name: string;
  isDefault: boolean;
  type: 'function' | 'class' | 'const' | 'let' | 'var' | 'interface' | 'type' | 'enum';
  line: number;
}

export interface FunctionInfo {
  name: string;
  isArrow: boolean;
  isAsync: boolean;
  isExported: boolean;
  parameters: number;
  lineStart: number;
  lineEnd: number;
  complexity: number;
  isReactComponent: boolean;
  hooks: string[];
}

export interface ClassInfo {
  name: string;
  isExported: boolean;
  extends: string | null;
  implements: string[];
  methods: {
    name: string;
    isAsync: boolean;
    isStatic: boolean;
    parameters: number;
    complexity: number;
    line: number;
  }[];
  properties: {
    name: string;
    isStatic: boolean;
    isPrivate: boolean;
    line: number;
  }[];
  lineStart: number;
  lineEnd: number;
}

export interface ComponentInfo {
  name: string;
  type: 'functional' | 'class' | 'hoc' | 'hook';
  isDefault: boolean;
  props: string[];
  hooks: string[];
  state: string[];
  effects: number;
  dependencies: string[];
  isLazy: boolean;
  isMemo: boolean;
  lineStart: number;
  lineEnd: number;
  complexity: number;
}

export interface CodeMetrics {
  linesOfCode: number;
  linesOfComments: number;
  blankLines: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  halsteadMetrics: {
    vocabulary: number;
    length: number;
    volume: number;
    difficulty: number;
    effort: number;
    bugs: number;
  };
  cognitiveComplexity: number;
  nestingDepth: number;
  functionCount: number;
  classCount: number;
  duplicationRatio: number;
}

export interface CodeAnalysisResult {
  file: FileInfo;
  imports: ImportInfo[];
  exports: ExportInfo[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
  components: ComponentInfo[];
  metrics: CodeMetrics;
  issues: CodeIssue[];
  dependencies: {
    external: Set<string>;
    internal: Set<string>;
    circular: string[];
  };
}

export interface CodeIssue {
  type: 'complexity' | 'duplication' | 'smell' | 'anti-pattern' | 'performance' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line: number;
  column?: number;
  suggestion?: string;
  autoFixable: boolean;
}

export class CodeParser {
  private reactHooks = [
    'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
    'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
    'useDebugValue', 'useDeferredValue', 'useTransition', 'useId',
    'useSyncExternalStore', 'useInsertionEffect'
  ];

  private complexityKeywords = [
    'if', 'else', 'while', 'for', 'switch', 'case', 'catch', 'throw',
    '&&', '||', '?', ':', 'break', 'continue', 'return'
  ];

  analyzeCode(file: FileInfo): CodeAnalysisResult {
    if (!file.content) {
      throw new Error('File content is required for analysis');
    }

    const content = file.content;
    const lines = content.split('\n');

    const analysis: CodeAnalysisResult = {
      file,
      imports: this.parseImports(content),
      exports: this.parseExports(content),
      functions: this.parseFunctions(content),
      classes: this.parseClasses(content),
      components: this.parseComponents(content, file.extension),
      metrics: this.calculateMetrics(content),
      issues: [],
      dependencies: {
        external: new Set(),
        internal: new Set(),
        circular: []
      }
    };

    // Analyze dependencies
    analysis.dependencies = this.analyzeDependencies(analysis.imports, file.filePath);
    
    // Detect issues
    analysis.issues = this.detectIssues(analysis, content);

    return analysis;
  }

  private parseImports(content: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    const lines = content.split('\n');

    // Static imports
    const importRegex = /^import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s*(?:\s*as\s+(\w+))?\s*from\s+['"`]([^'"`]+)['"`]/gm;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const [fullMatch, defaultImport, namedImports, namespaceImport, source] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;
      
      const importInfo: ImportInfo = {
        source,
        imports: [],
        isDefault: !!defaultImport,
        isNamespace: !!namespaceImport,
        isDynamic: false,
        line: lineIndex + 1,
        isExternal: !source.startsWith('.') && !source.startsWith('/')
      };

      if (defaultImport) {
        importInfo.imports.push(defaultImport);
      }

      if (namedImports) {
        const named = namedImports.split(',').map(imp => imp.trim());
        importInfo.imports.push(...named);
      }

      if (namespaceImport) {
        importInfo.imports.push(namespaceImport);
      }

      imports.push(importInfo);
    }

    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;
      
      imports.push({
        source: match[1],
        imports: [],
        isDefault: false,
        isNamespace: false,
        isDynamic: true,
        line: lineIndex + 1,
        isExternal: !match[1].startsWith('.') && !match[1].startsWith('/')
      });
    }

    // Require statements
    const requireRegex = /(?:const|let|var)\s+(?:\{([^}]+)\}|(\w+))\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const [, destructured, variable, source] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;
      
      const importInfo: ImportInfo = {
        source,
        imports: [],
        isDefault: !!variable,
        isNamespace: false,
        isDynamic: false,
        line: lineIndex + 1,
        isExternal: !source.startsWith('.') && !source.startsWith('/')
      };

      if (variable) {
        importInfo.imports.push(variable);
      }

      if (destructured) {
        const named = destructured.split(',').map(imp => imp.trim());
        importInfo.imports.push(...named);
      }

      imports.push(importInfo);
    }

    return imports;
  }

  private parseExports(content: string): ExportInfo[] {
    const exports: ExportInfo[] = [];
    
    // Named exports
    const namedExportRegex = /export\s+(?:(const|let|var|function|class|interface|type|enum)\s+(\w+)|\{([^}]+)\})/g;
    let match;

    while ((match = namedExportRegex.exec(content)) !== null) {
      const [, type, name, namedExports] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;

      if (name) {
        exports.push({
          name,
          isDefault: false,
          type: type as any || 'const',
          line: lineIndex + 1
        });
      }

      if (namedExports) {
        const names = namedExports.split(',').map(exp => exp.trim());
        names.forEach(exportName => {
          exports.push({
            name: exportName,
            isDefault: false,
            type: 'const',
            line: lineIndex + 1
          });
        });
      }
    }

    // Default exports
    const defaultExportRegex = /export\s+default\s+(?:(function|class)\s+(\w+)|(\w+))/g;
    while ((match = defaultExportRegex.exec(content)) !== null) {
      const [, type, name, identifier] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;

      exports.push({
        name: name || identifier || 'default',
        isDefault: true,
        type: type as any || 'const',
        line: lineIndex + 1
      });
    }

    return exports;
  }

  private parseFunctions(content: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    // Function declarations
    const functionRegex = /(?:(export\s+)?(?:(async)\s+)?(function)\s+(\w+)\s*\(([^)]*)\)|(?:(export\s+)?(?:(async)\s+)?const\s+(\w+)\s*=\s*(?:\(([^)]*)\)|(\w+))\s*=>\s*\{?))/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const [fullMatch, exported1, async1, funcKeyword, funcName, params1, exported2, async2, constName, params2, arrowParam] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;

      const name = funcName || constName;
      const isAsync = !!(async1 || async2);
      const isExported = !!(exported1 || exported2);
      const isArrow = !funcKeyword;
      const parameters = this.countParameters(params1 || params2 || arrowParam || '');

      if (name) {
        const functionEnd = this.findFunctionEnd(content, match.index);
        const functionBody = content.substring(match.index, functionEnd);
        
        functions.push({
          name,
          isArrow,
          isAsync,
          isExported,
          parameters,
          lineStart: lineIndex + 1,
          lineEnd: content.substring(0, functionEnd).split('\n').length,
          complexity: this.calculateComplexity(functionBody),
          isReactComponent: this.isReactComponent(name, functionBody),
          hooks: this.extractHooks(functionBody)
        });
      }
    }

    return functions;
  }

  private parseClasses(content: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    const classRegex = /(?:(export\s+)?)class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*\{/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const [, exported, className, extendsClass, implementsClasses] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;
      
      const classEnd = this.findClassEnd(content, match.index);
      const classBody = content.substring(match.index, classEnd);
      
      const classInfo: ClassInfo = {
        name: className,
        isExported: !!exported,
        extends: extendsClass || null,
        implements: implementsClasses ? implementsClasses.split(',').map(i => i.trim()) : [],
        methods: this.parseClassMethods(classBody),
        properties: this.parseClassProperties(classBody),
        lineStart: lineIndex + 1,
        lineEnd: content.substring(0, classEnd).split('\n').length
      };

      classes.push(classInfo);
    }

    return classes;
  }

  private parseComponents(content: string, extension: string): ComponentInfo[] {
    if (!['.tsx', '.jsx'].includes(extension)) {
      return [];
    }

    const components: ComponentInfo[] = [];
    
    // React functional components
    const funcComponentRegex = /(?:(export\s+)(?:default\s+)?)?(?:const|let|var|function)\s+([A-Z]\w*)\s*[=:]?\s*(?:\([^)]*\)|\w+)\s*=>\s*[({]|(?:(export\s+)(?:default\s+)?)?function\s+([A-Z]\w*)\s*\([^)]*\)\s*[{]/g;
    let match;

    while ((match = funcComponentRegex.exec(content)) !== null) {
      const [, exported1, name1, exported2, name2] = match;
      const name = name1 || name2;
      const isExported = !!(exported1 || exported2);
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;
      
      if (name && this.isValidComponentName(name)) {
        const componentEnd = this.findFunctionEnd(content, match.index);
        const componentBody = content.substring(match.index, componentEnd);
        
        components.push({
          name,
          type: 'functional',
          isDefault: content.includes(`export default ${name}`),
          props: this.extractProps(componentBody),
          hooks: this.extractHooks(componentBody),
          state: this.extractState(componentBody),
          effects: this.countEffects(componentBody),
          dependencies: [],
          isLazy: false,
          isMemo: componentBody.includes('React.memo') || componentBody.includes('memo('),
          lineStart: lineIndex + 1,
          lineEnd: content.substring(0, componentEnd).split('\n').length,
          complexity: this.calculateComplexity(componentBody)
        });
      }
    }

    // React class components
    const classComponentRegex = /(?:(export\s+)(?:default\s+)?)?class\s+([A-Z]\w*)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/g;
    while ((match = classComponentRegex.exec(content)) !== null) {
      const [, exported, name] = match;
      const lineIndex = content.substring(0, match.index).split('\n').length - 1;
      
      const componentEnd = this.findClassEnd(content, match.index);
      const componentBody = content.substring(match.index, componentEnd);
      
      components.push({
        name,
        type: 'class',
        isDefault: content.includes(`export default ${name}`),
        props: this.extractClassProps(componentBody),
        hooks: [], // Class components don't use hooks
        state: this.extractClassState(componentBody),
        effects: this.countClassEffects(componentBody),
        dependencies: [],
        isLazy: false,
        isMemo: false,
        lineStart: lineIndex + 1,
        lineEnd: content.substring(0, componentEnd).split('\n').length,
        complexity: this.calculateComplexity(componentBody)
      });
    }

    return components;
  }

  private calculateMetrics(content: string): CodeMetrics {
    const lines = content.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
    const linesOfComments = lines.filter(line => line.trim().startsWith('//')).length;
    const blankLines = lines.filter(line => !line.trim()).length;
    
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const cognitiveComplexity = this.calculateCognitiveComplexity(content);
    const halsteadMetrics = this.calculateHalsteadMetrics(content);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(linesOfCode, cyclomaticComplexity, halsteadMetrics.volume);
    
    return {
      linesOfCode,
      linesOfComments,
      blankLines,
      cyclomaticComplexity,
      maintainabilityIndex,
      halsteadMetrics,
      cognitiveComplexity,
      nestingDepth: this.calculateNestingDepth(content),
      functionCount: (content.match(/function\s+\w+|=\s*\([^)]*\)\s*=>/g) || []).length,
      classCount: (content.match(/class\s+\w+/g) || []).length,
      duplicationRatio: this.calculateDuplicationRatio(content)
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    let complexity = 1;
    
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bdo\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\bthrow\b/g,
      /&&/g,
      /\|\|/g,
      /\?\s*[^:]*:/g,
      /\bbreak\b/g,
      /\bcontinue\b/g,
      /\breturn\b/g
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    });
    
    return complexity;
  }

  private calculateCognitiveComplexity(content: string): number {
    let complexity = 0;
    let nestingLevel = 0;
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Increase nesting for blocks
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      // Add complexity for control structures
      if (line.includes('if') || line.includes('while') || line.includes('for')) {
        complexity += 1 + nestingLevel;
      }
      
      if (line.includes('switch') || line.includes('catch')) {
        complexity += 1 + nestingLevel;
      }
      
      if (line.includes('&&') || line.includes('||')) {
        complexity += 1;
      }
      
      nestingLevel += openBraces - closeBraces;
      nestingLevel = Math.max(0, nestingLevel);
    }
    
    return complexity;
  }

  private calculateHalsteadMetrics(content: string): CodeMetrics['halsteadMetrics'] {
    const operators = content.match(/[+\-*/%=<>!&|^~?:;,(){}[\]]/g) || [];
    const operands = content.match(/\b\w+\b/g) || [];
    
    const uniqueOperators = new Set(operators);
    const uniqueOperands = new Set(operands);
    
    const vocabulary = uniqueOperators.size + uniqueOperands.size;
    const length = operators.length + operands.length;
    const volume = length * Math.log2(vocabulary);
    const difficulty = (uniqueOperators.size / 2) * (operands.length / uniqueOperands.size);
    const effort = difficulty * volume;
    const bugs = volume / 3000;
    
    return {
      vocabulary,
      length,
      volume: isFinite(volume) ? volume : 0,
      difficulty: isFinite(difficulty) ? difficulty : 0,
      effort: isFinite(effort) ? effort : 0,
      bugs: isFinite(bugs) ? bugs : 0
    };
  }

  private calculateMaintainabilityIndex(loc: number, complexity: number, volume: number): number {
    const mi = Math.max(0, (171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(loc)) * 100 / 171);
    return Math.round(isFinite(mi) ? mi : 0);
  }

  private calculateNestingDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of content) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
    
    return maxDepth;
  }

  private calculateDuplicationRatio(content: string): number {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 10);
    const totalLines = lines.length;
    const uniqueLines = new Set(lines).size;
    
    return totalLines > 0 ? ((totalLines - uniqueLines) / totalLines) * 100 : 0;
  }

  private analyzeDependencies(imports: ImportInfo[], filePath: string): CodeAnalysisResult['dependencies'] {
    const external = new Set<string>();
    const internal = new Set<string>();
    
    imports.forEach(imp => {
      if (imp.isExternal) {
        external.add(imp.source);
      } else {
        const resolvedPath = path.resolve(path.dirname(filePath), imp.source);
        internal.add(resolvedPath);
      }
    });
    
    return {
      external,
      internal,
      circular: [] // This would need cross-file analysis
    };
  }

  private detectIssues(analysis: CodeAnalysisResult, content: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    
    // High complexity functions
    analysis.functions.forEach(func => {
      if (func.complexity > 10) {
        issues.push({
          type: 'complexity',
          severity: func.complexity > 20 ? 'critical' : func.complexity > 15 ? 'high' : 'medium',
          message: `Function '${func.name}' has high cyclomatic complexity (${func.complexity})`,
          line: func.lineStart,
          suggestion: 'Consider breaking this function into smaller functions',
          autoFixable: false
        });
      }
    });
    
    // Large components
    analysis.components.forEach(comp => {
      if (comp.complexity > 15) {
        issues.push({
          type: 'complexity',
          severity: 'medium',
          message: `Component '${comp.name}' is too complex (${comp.complexity})`,
          line: comp.lineStart,
          suggestion: 'Consider breaking this component into smaller components',
          autoFixable: false
        });
      }
    });
    
    // Too many parameters
    analysis.functions.forEach(func => {
      if (func.parameters > 5) {
        issues.push({
          type: 'smell',
          severity: 'medium',
          message: `Function '${func.name}' has too many parameters (${func.parameters})`,
          line: func.lineStart,
          suggestion: 'Consider using an options object or breaking the function apart',
          autoFixable: false
        });
      }
    });
    
    // Missing key prop in lists
    if (content.includes('.map(') && !content.includes('key=')) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: 'Missing key prop in list rendering',
        line: content.split('\n').findIndex(line => line.includes('.map(')) + 1,
        suggestion: 'Add unique key prop to list items for better performance',
        autoFixable: true
      });
    }
    
    // Inline styles
    const inlineStyleMatches = content.match(/style=\{\{[^}]+\}\}/g);
    if (inlineStyleMatches && inlineStyleMatches.length > 3) {
      issues.push({
        type: 'performance',
        severity: 'low',
        message: `Multiple inline styles detected (${inlineStyleMatches.length})`,
        line: 1,
        suggestion: 'Consider using CSS classes or styled-components for better performance',
        autoFixable: false
      });
    }
    
    return issues;
  }

  // Helper methods
  private countParameters(paramStr: string): number {
    if (!paramStr.trim()) return 0;
    return paramStr.split(',').length;
  }

  private calculateComplexity(code: string): number {
    return this.calculateCyclomaticComplexity(code);
  }

  private isReactComponent(name: string, code: string): boolean {
    return /^[A-Z]/.test(name) && (code.includes('jsx') || code.includes('<') || code.includes('React.'));
  }

  private extractHooks(code: string): string[] {
    const hooks: string[] = [];
    this.reactHooks.forEach(hook => {
      if (code.includes(hook)) {
        hooks.push(hook);
      }
    });
    return hooks;
  }

  private isValidComponentName(name: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  private extractProps(code: string): string[] {
    const propMatches = code.match(/(?:props\.)(\w+)|(?:{\s*)(\w+)(?:\s*[,}])/g) || [];
    return propMatches.map(match => match.replace(/props\.|\{|\}|,/g, '').trim()).filter(Boolean);
  }

  private extractState(code: string): string[] {
    const stateMatches = code.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g) || [];
    return stateMatches.map(match => match.match(/\[(\w+),/)?.[1] || '').filter(Boolean);
  }

  private countEffects(code: string): number {
    return (code.match(/useEffect\(/g) || []).length;
  }

  private extractClassProps(code: string): string[] {
    const propMatches = code.match(/this\.props\.(\w+)/g) || [];
    return [...new Set(propMatches.map(match => match.replace('this.props.', '')))];
  }

  private extractClassState(code: string): string[] {
    const stateMatches = code.match(/this\.state\.(\w+)/g) || [];
    return [...new Set(stateMatches.map(match => match.replace('this.state.', '')))];
  }

  private countClassEffects(code: string): number {
    const lifecycleMethods = ['componentDidMount', 'componentDidUpdate', 'componentWillUnmount'];
    return lifecycleMethods.reduce((count, method) => {
      return count + (code.includes(method) ? 1 : 0);
    }, 0);
  }

  private parseClassMethods(classBody: string): ClassInfo['methods'] {
    const methods: ClassInfo['methods'] = [];
    const methodRegex = /(?:(static)\s+)?(?:(async)\s+)?(\w+)\s*\([^)]*\)\s*{/g;
    let match;

    while ((match = methodRegex.exec(classBody)) !== null) {
      const [, isStatic, isAsync, name] = match;
      const lineIndex = classBody.substring(0, match.index).split('\n').length - 1;
      
      methods.push({
        name,
        isAsync: !!isAsync,
        isStatic: !!isStatic,
        parameters: this.countParameters(match[0]),
        complexity: this.calculateComplexity(match[0]),
        line: lineIndex + 1
      });
    }

    return methods;
  }

  private parseClassProperties(classBody: string): ClassInfo['properties'] {
    const properties: ClassInfo['properties'] = [];
    const propRegex = /(?:(static)\s+)?(?:(private|protected|public)\s+)?(\w+)\s*[:=]/g;
    let match;

    while ((match = propRegex.exec(classBody)) !== null) {
      const [, isStatic, visibility, name] = match;
      const lineIndex = classBody.substring(0, match.index).split('\n').length - 1;
      
      properties.push({
        name,
        isStatic: !!isStatic,
        isPrivate: visibility === 'private',
        line: lineIndex + 1
      });
    }

    return properties;
  }

  private findFunctionEnd(content: string, startIndex: number): number {
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}' && inFunction) {
        braceCount--;
        if (braceCount === 0) {
          return i + 1;
        }
      }
    }
    
    return content.length;
  }

  private findClassEnd(content: string, startIndex: number): number {
    return this.findFunctionEnd(content, startIndex); // Same logic
  }
}