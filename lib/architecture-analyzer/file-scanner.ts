import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

export interface FileInfo {
  filePath: string;
  relativePath: string;
  extension: string;
  size: number;
  lastModified: Date;
  hash: string;
  content?: string;
  lineCount: number;
  isTestFile: boolean;
  isConfigFile: boolean;
}

export interface ScanOptions {
  includeContent?: boolean;
  excludeDirectories?: string[];
  includeExtensions?: string[];
  excludeExtensions?: string[];
  maxFileSize?: number; // in bytes
  followSymlinks?: boolean;
}

export class FileSystemScanner {
  private rootPath: string;
  private options: ScanOptions;

  constructor(rootPath: string, options: ScanOptions = {}) {
    this.rootPath = path.resolve(rootPath);
    this.options = {
      includeContent: true,
      excludeDirectories: ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache', '.vercel', '.github'],
      includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html', '.md', '.sql'],
      excludeExtensions: ['.map', '.min.js', '.min.css'],
      maxFileSize: 1024 * 1024, // 1MB
      followSymlinks: false,
      ...options
    };
  }

  async scanDirectory(): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    try {
      await this.scanRecursive(this.rootPath, files);
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw error;
    }

    return files;
  }

  private async scanRecursive(currentPath: string, files: FileInfo[]): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          if (this.shouldScanDirectory(entry.name)) {
            await this.scanRecursive(fullPath, files);
          }
        } else if (entry.isFile() || (entry.isSymbolicLink() && this.options.followSymlinks)) {
          try {
            const fileInfo = await this.analyzeFile(fullPath);
            if (fileInfo && this.shouldIncludeFile(fileInfo)) {
              files.push(fileInfo);
            }
          } catch (error) {
            console.warn(`Failed to analyze file ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${currentPath}:`, error);
    }
  }

  private async analyzeFile(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await fs.stat(filePath);
      
      // Skip files that are too large
      if (this.options.maxFileSize && stats.size > this.options.maxFileSize) {
        return null;
      }

      const relativePath = path.relative(this.rootPath, filePath);
      const extension = path.extname(filePath).toLowerCase();
      
      let content: string | undefined;
      let lineCount = 0;
      let hash = '';

      if (this.options.includeContent && this.isTextFile(extension)) {
        try {
          content = await fs.readFile(filePath, 'utf-8');
          lineCount = content.split('\n').length;
          hash = createHash('sha256').update(content).digest('hex');
        } catch (error) {
          // File might be binary or have encoding issues
          content = undefined;
          hash = createHash('sha256').update(stats.mtime.toISOString() + stats.size).digest('hex');
        }
      } else {
        hash = createHash('sha256').update(stats.mtime.toISOString() + stats.size).digest('hex');
      }

      return {
        filePath,
        relativePath,
        extension,
        size: stats.size,
        lastModified: stats.mtime,
        hash,
        content,
        lineCount,
        isTestFile: this.isTestFile(filePath),
        isConfigFile: this.isConfigFile(filePath)
      };
    } catch (error) {
      console.warn(`Failed to stat file ${filePath}:`, error);
      return null;
    }
  }

  private shouldScanDirectory(dirName: string): boolean {
    return !this.options.excludeDirectories?.includes(dirName);
  }

  private shouldIncludeFile(fileInfo: FileInfo): boolean {
    const { extension } = fileInfo;
    
    // Check exclude extensions first
    if (this.options.excludeExtensions?.includes(extension)) {
      return false;
    }
    
    // If include extensions is specified, only include those
    if (this.options.includeExtensions?.length) {
      return this.options.includeExtensions.includes(extension);
    }
    
    return true;
  }

  private isTextFile(extension: string): boolean {
    const textExtensions = [
      '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.sass', '.less',
      '.html', '.htm', '.xml', '.md', '.txt', '.sql', '.py', '.java', '.c', '.cpp',
      '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
      '.sh', '.bash', '.ps1', '.bat', '.cmd', '.yaml', '.yml', '.toml', '.ini',
      '.env', '.gitignore', '.gitattributes', '.eslintrc', '.prettierrc'
    ];
    
    return textExtensions.includes(extension);
  }

  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /\.test\./i,
      /\.spec\./i,
      /__tests__/i,
      /test\//i,
      /tests\//i,
      /spec\//i,
      /\.stories\./i,
      /\.story\./i
    ];
    
    return testPatterns.some(pattern => pattern.test(filePath));
  }

  private isConfigFile(filePath: string): boolean {
    const configPatterns = [
      /\.config\./i,
      /^\..*rc$/i,
      /package\.json$/i,
      /tsconfig\.json$/i,
      /next\.config\./i,
      /tailwind\.config\./i,
      /postcss\.config\./i,
      /webpack\.config\./i,
      /babel\.config\./i,
      /jest\.config\./i,
      /vitest\.config\./i,
      /vite\.config\./i,
      /rollup\.config\./i,
      /docker/i,
      /Dockerfile$/i,
      /\.env/i,
      /\.gitignore$/i,
      /\.gitattributes$/i,
      /\.eslintrc/i,
      /\.prettierrc/i,
      /\.editorconfig$/i,
      /\.nvmrc$/i,
      /\.yarnrc/i,
      /\.npmrc$/i
    ];
    
    const fileName = path.basename(filePath);
    return configPatterns.some(pattern => pattern.test(fileName));
  }

  async getDirectoryStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByExtension: Map<string, number>;
    sizeByExtension: Map<string, number>;
    filesByDirectory: Map<string, number>;
    largestFiles: { path: string; size: number }[];
  }> {
    const files = await this.scanDirectory();
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      filesByExtension: new Map<string, number>(),
      sizeByExtension: new Map<string, number>(),
      filesByDirectory: new Map<string, number>(),
      largestFiles: files
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map(file => ({ path: file.relativePath, size: file.size }))
    };

    files.forEach(file => {
      // Files by extension
      const currentCount = stats.filesByExtension.get(file.extension) || 0;
      stats.filesByExtension.set(file.extension, currentCount + 1);
      
      // Size by extension
      const currentSize = stats.sizeByExtension.get(file.extension) || 0;
      stats.sizeByExtension.set(file.extension, currentSize + file.size);
      
      // Files by directory
      const directory = path.dirname(file.relativePath);
      const currentDirCount = stats.filesByDirectory.get(directory) || 0;
      stats.filesByDirectory.set(directory, currentDirCount + 1);
    });

    return stats;
  }

  async findDuplicateFiles(): Promise<Map<string, FileInfo[]>> {
    const files = await this.scanDirectory();
    const duplicates = new Map<string, FileInfo[]>();
    const hashMap = new Map<string, FileInfo[]>();

    // Group files by hash
    files.forEach(file => {
      if (file.hash) {
        if (!hashMap.has(file.hash)) {
          hashMap.set(file.hash, []);
        }
        hashMap.get(file.hash)!.push(file);
      }
    });

    // Find duplicates
    hashMap.forEach((filesWithSameHash, hash) => {
      if (filesWithSameHash.length > 1) {
        duplicates.set(hash, filesWithSameHash);
      }
    });

    return duplicates;
  }

  async findLargeFiles(threshold: number = 100 * 1024): Promise<FileInfo[]> {
    const files = await this.scanDirectory();
    return files
      .filter(file => file.size > threshold)
      .sort((a, b) => b.size - a.size);
  }

  async findUnusedFiles(): Promise<FileInfo[]> {
    const files = await this.scanDirectory();
    const codeFiles = files.filter(file => 
      ['.ts', '.tsx', '.js', '.jsx'].includes(file.extension) && !file.isTestFile
    );
    
    const referencedFiles = new Set<string>();
    const importRegex = /(?:import|require)\s*\(?['"`]([^'"`]+)['"`]\)?/g;

    // Find all referenced files
    for (const file of codeFiles) {
      if (file.content) {
        let match;
        while ((match = importRegex.exec(file.content)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('.')) {
            // Resolve relative import
            const resolvedPath = path.resolve(path.dirname(file.filePath), importPath);
            referencedFiles.add(resolvedPath);
            
            // Also try with common extensions
            for (const ext of ['.ts', '.tsx', '.js', '.jsx', '.json']) {
              referencedFiles.add(resolvedPath + ext);
              referencedFiles.add(path.join(resolvedPath, 'index' + ext));
            }
          }
        }
      }
    }

    // Find unreferenced files (excluding entry points)
    const entryPoints = ['index', 'main', 'app', 'page', 'layout', '_app', '_document'];
    return codeFiles.filter(file => {
      const baseName = path.basename(file.filePath, file.extension);
      const isEntryPoint = entryPoints.includes(baseName) || 
                          file.relativePath.includes('pages/') || 
                          file.relativePath.includes('app/');
      
      return !isEntryPoint && !referencedFiles.has(file.filePath);
    });
  }
}