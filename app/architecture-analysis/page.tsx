'use client';

import React, { useState } from 'react';
import { Brain, Activity, Shield, Zap, Package, GitBranch, RefreshCw, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function ArchitectureAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab: string) => {
    console.log('Switching to tab:', tab);
    setActiveTab(tab);
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResults({
        healthScore: 85,
        components: 124,
        issues: 7,
        opportunities: 12,
        lastRun: new Date().toISOString()
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const mockData = {
    componentBreakdown: [
      { name: 'React Components', value: 45, health: 92 },
      { name: 'API Routes', value: 23, health: 88 },
      { name: 'Database Models', value: 18, health: 85 },
      { name: 'Utilities', value: 38, health: 79 }
    ],
    issues: [
      { type: 'Performance', severity: 'medium', title: 'Large bundle size in VBA module', impact: 6 },
      { type: 'Security', severity: 'low', title: 'Missing rate limiting on API endpoints', impact: 4 },
      { type: 'Code Quality', severity: 'high', title: 'Duplicate code in submittal handlers', impact: 8 },
      { type: 'Architecture', severity: 'medium', title: 'Tight coupling between components', impact: 7 }
    ],
    opportunities: [
      { type: 'Performance', title: 'Implement code splitting for faster load times', value: 8 },
      { type: 'Architecture', title: 'Extract shared logic into custom hooks', value: 7 },
      { type: 'Testing', title: 'Add integration tests for critical paths', value: 9 },
      { type: 'Documentation', title: 'Generate API documentation from TypeScript', value: 6 }
    ]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Architecture Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered codebase analysis and optimization recommendations
              </p>
            </div>
          </div>
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Start Analysis
              </>
            )}
          </button>
        </div>

        {/* Quick Stats */}
        {analysisResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysisResults.healthScore}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Components</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysisResults.components}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Issues</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysisResults.issues}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analysisResults.opportunities}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 px-6">
            {['overview', 'components', 'issues', 'opportunities'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {/* Tab Content */}
          {(() => {
            switch(activeTab) {
              case 'overview':
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        System Architecture Overview
                      </h3>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Your application follows a modern Next.js architecture with TypeScript, utilizing Supabase for backend services. 
                    The codebase is well-structured with clear separation of concerns between components, API routes, and business logic.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Strengths</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Type-safe development with TypeScript
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Modular component architecture
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Real-time capabilities with Supabase
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Areas for Improvement</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Bundle size optimization needed
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Missing test coverage
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <XCircle className="h-4 w-4 text-red-500" />
                          API rate limiting not implemented
                        </li>
                      </ul>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              );
              
              case 'components':
                return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Component Analysis
              </h3>
              <div className="space-y-4">
                {mockData.componentBreakdown.map((component) => (
                  <div key={component.name} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {component.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {component.value} files
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full ${
                          component.health >= 90 ? 'bg-green-500' :
                          component.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${component.health}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Health: {component.health}%
                    </div>
                  </div>
                ))}
                  </div>
                </div>
              );
              
              case 'issues':
                return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detected Issues
              </h3>
              <div className="space-y-4">
                {mockData.issues.map((issue, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            issue.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {issue.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {issue.title}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Impact</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {issue.impact}/10
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                </div>
              );
              
              case 'opportunities':
                return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Improvement Opportunities
              </h3>
              <div className="space-y-4">
                {mockData.opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {opportunity.type}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {opportunity.title}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Value</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          +{opportunity.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                </div>
              );
              
              default:
                return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
}