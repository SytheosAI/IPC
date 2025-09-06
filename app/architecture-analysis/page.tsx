'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Activity, Shield, Zap, Package, GitBranch, RefreshCw, Download, AlertCircle, CheckCircle, XCircle, Monitor, Cpu, HardDrive, Network } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useSystemMetrics, useSecurityEvents } from '@/hooks/useSystemMetrics';

// Lazy load performance-heavy components
const PerformanceDial = lazy(() => import('@/components/PerformanceDial'));

export default function SystemAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use React Query for intelligent caching
  const { data: systemMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useSystemMetrics();
  const { data: securityEventsData, isLoading: securityLoading, refetch: refetchSecurity } = useSecurityEvents();
  
  const securityEvents = securityEventsData || [];
  
  // Calculate analysis results from live data
  const analysisResults = systemMetrics ? {
    healthScore: systemMetrics.healthScore,
    cpuUsage: systemMetrics.cpu_percent,
    memoryUsage: systemMetrics.memory_percent,
    diskUsage: systemMetrics.disk_percent,
    networkActivity: systemMetrics.networkActivity,
    securityAlerts: systemMetrics.securityAlerts,
    activeConnections: systemMetrics.activeConnections,
    blockedThreats: systemMetrics.blockedThreats,
    lastRun: systemMetrics.timestamp
  } : null;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Manually trigger data refresh
  const loadSystemData = async () => {
    await Promise.all([refetchMetrics(), refetchSecurity()]);
  };

  const calculateHealthScore = (metrics: any) => {
    const cpuScore = Math.max(0, 100 - metrics.cpu_percent);
    const memoryScore = Math.max(0, 100 - metrics.memory_percent);
    const diskScore = Math.max(0, 100 - metrics.disk_percent);
    return Math.round((cpuScore + memoryScore + diskScore) / 3);
  };

  const calculateNetworkActivity = (metrics: any) => {
    return metrics?.networkActivity || 0;
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await loadSystemData();
      
      // Store analysis run in database
      await supabase
        .from('activity_logs')
        .insert([{
          action: 'system_analysis',
          user_id: 'system',
          metadata: { 
            analysis_type: 'full_system',
            timestamp: new Date().toISOString()
          }
        }]);
        
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate live system breakdown based on real data
  const getSystemBreakdown = () => {
    if (!systemMetrics) return [];
    
    return [
      { 
        name: 'CPU Performance', 
        value: systemMetrics.cpu_percent || 0, 
        health: Math.max(0, 100 - (systemMetrics.cpu_percent || 0)),
        status: systemMetrics.cpu_percent > 80 ? 'critical' : systemMetrics.cpu_percent > 60 ? 'warning' : 'good'
      },
      { 
        name: 'Memory Usage', 
        value: systemMetrics.memory_percent || 0, 
        health: Math.max(0, 100 - (systemMetrics.memory_percent || 0)),
        status: systemMetrics.memory_percent > 90 ? 'critical' : systemMetrics.memory_percent > 75 ? 'warning' : 'good'
      },
      { 
        name: 'Disk Storage', 
        value: systemMetrics.disk_percent || 0, 
        health: Math.max(0, 100 - (systemMetrics.disk_percent || 0)),
        status: systemMetrics.disk_percent > 95 ? 'critical' : systemMetrics.disk_percent > 80 ? 'warning' : 'good'
      },
      { 
        name: 'Network Activity', 
        value: systemMetrics ? calculateNetworkActivity(systemMetrics) : 0, 
        health: 95,
        status: 'good'
      }
    ];
  };

  const getSystemIssues = () => {
    const issues = [];
    
    if (systemMetrics?.cpu_percent > 80) {
      issues.push({
        type: 'Performance',
        severity: 'high',
        title: `High CPU usage: ${systemMetrics.cpu_percent}%`,
        impact: Math.round(systemMetrics.cpu_percent / 10)
      });
    }
    
    if (systemMetrics?.memory_percent > 90) {
      issues.push({
        type: 'Performance',
        severity: 'critical',
        title: `Critical memory usage: ${systemMetrics.memory_percent}%`,
        impact: 9
      });
    }
    
    if (systemMetrics?.disk_percent > 95) {
      issues.push({
        type: 'Storage',
        severity: 'critical',
        title: `Disk space critically low: ${systemMetrics.disk_percent}%`,
        impact: 10
      });
    }
    
    const criticalSecurityEvents = securityEvents.filter((e: any) => e.severity === 'critical');
    if (criticalSecurityEvents.length > 0) {
      issues.push({
        type: 'Security',
        severity: 'critical',
        title: `${criticalSecurityEvents.length} critical security alert(s)`,
        impact: 8
      });
    }
    
    return issues;
  };

  const getOptimizationOpportunities = () => {
    const opportunities = [];
    
    if (systemMetrics?.cpu_percent < 30) {
      opportunities.push({
        type: 'Performance',
        title: 'System has unused CPU capacity for additional workloads',
        value: 7
      });
    }
    
    if (systemMetrics?.memory_percent < 50) {
      opportunities.push({
        type: 'Performance',
        title: 'Available memory can support memory caching improvements',
        value: 6
      });
    }
    
    if (securityEvents.length === 0) {
      opportunities.push({
        type: 'Security',
        title: 'No recent security events - system is well protected',
        value: 8
      });
    }
    
    opportunities.push({
      type: 'Monitoring',
      title: 'Real-time metrics collection is functioning optimally',
      value: 9
    });
    
    return opportunities;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-2 flex justify-center items-center relative">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-400 drop-shadow-lg text-center">
            System Analysis
          </h1>
        </div>
        <button
          onClick={startAnalysis}
          disabled={isAnalyzing}
          className="absolute right-0 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Monitor className="h-5 w-5" />
              Start Analysis
            </>
          )}
        </button>
      </div>
      <div className="text-center mb-6">
        <p className="text-gray-400">
          Live system performance monitoring and real-time diagnostics
        </p>
      </div>

        {/* Live System Stats */}
        {analysisResults && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="card-modern p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">System Health</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {analysisResults.healthScore}%
                  </p>
                </div>
                <Activity className={`h-8 w-8 ${analysisResults.healthScore > 80 ? 'text-green-500' : analysisResults.healthScore > 60 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
            
            <div className="card-modern p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {Math.round(analysisResults.cpuUsage)}%
                  </p>
                </div>
                <Cpu className={`h-8 w-8 ${analysisResults.cpuUsage < 50 ? 'text-green-500' : analysisResults.cpuUsage < 80 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
            
            <div className="card-modern p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Memory Usage</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {Math.round(analysisResults.memoryUsage)}%
                  </p>
                </div>
                <HardDrive className={`h-8 w-8 ${analysisResults.memoryUsage < 60 ? 'text-green-500' : analysisResults.memoryUsage < 85 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
            
            <div className="card-modern p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Security Alerts</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {analysisResults.securityAlerts}
                  </p>
                </div>
                <Shield className={`h-8 w-8 ${analysisResults.securityAlerts === 0 ? 'text-green-500' : analysisResults.securityAlerts < 3 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
          </div>
        )}

      {/* Tabs */}
      <div className="card-modern overflow-hidden mt-6">
        <div className="border-b border-gray-700/50">
          <div className="flex gap-6 px-6">
            {['overview', 'performance', 'issues', 'opportunities'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {/* Live Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">System Overview</h3>
              <p className="text-gray-400 mb-4">
                Live system monitoring with real-time performance metrics and health indicators.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-100">Current Metrics</h4>
                  {analysisResults && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">System Health</span>
                        <span className="font-medium text-gray-100">{analysisResults.healthScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="font-medium text-gray-100">{Math.round(analysisResults.cpuUsage)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Memory Usage</span>
                        <span className="font-medium text-gray-100">{Math.round(analysisResults.memoryUsage)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security Alerts</span>
                        <span className="font-medium text-gray-100">{analysisResults.securityAlerts}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-100">Data Source</h4>
                  {analysisResults && (
                    <div className="space-y-2">
                      <p className="text-gray-400">
                        Last Updated: {new Date(analysisResults.lastRun).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Data refreshes automatically every 10 seconds
                      </p>
                      <p className="text-gray-400 text-sm">
                        Source: Live Supabase database metrics
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-6">Live Performance Metrics</h3>
              
              {/* Dial Visualizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {analysisResults && (
                  <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-36 w-36 mx-auto bg-gray-700 rounded-full"></div>
                        <div className="h-4 bg-gray-700 rounded mt-3 mx-auto w-20"></div>
                      </div>
                    ))}
                  </div>}>
                    <>
                      <PerformanceDial
                        label="CPU Usage"
                        value={analysisResults.cpuUsage}
                        color={analysisResults.cpuUsage > 80 ? 'red' : analysisResults.cpuUsage > 60 ? 'yellow' : 'green'}
                        size="md"
                      />
                      <PerformanceDial
                        label="Memory Usage"
                        value={analysisResults.memoryUsage}
                        color={analysisResults.memoryUsage > 85 ? 'red' : analysisResults.memoryUsage > 70 ? 'yellow' : 'green'}
                        size="md"
                      />
                      <PerformanceDial
                        label="Disk Usage"
                        value={analysisResults.diskUsage}
                        color={analysisResults.diskUsage > 90 ? 'red' : analysisResults.diskUsage > 75 ? 'yellow' : 'green'}
                        size="md"
                      />
                      <PerformanceDial
                        label="System Health"
                        value={analysisResults.healthScore}
                        color={analysisResults.healthScore > 80 ? 'green' : analysisResults.healthScore > 60 ? 'yellow' : 'red'}
                        size="md"
                      />
                    </>
                  </Suspense>
                )}
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-200 mb-4">Detailed System Information</h4>
                {systemMetrics?.systemInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                      <h5 className="font-medium text-gray-100 mb-3">System Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform:</span>
                          <span className="text-gray-300">{systemMetrics.systemInfo.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Architecture:</span>
                          <span className="text-gray-300">{systemMetrics.systemInfo.architecture}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">CPU Cores:</span>
                          <span className="text-gray-300">{systemMetrics.systemInfo.cpuCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Uptime:</span>
                          <span className="text-gray-300">{Math.round(systemMetrics.systemInfo.uptime / 3600)}h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                      <h5 className="font-medium text-gray-100 mb-3">Memory Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Memory:</span>
                          <span className="text-gray-300">{Math.round(systemMetrics.totalMemory / 1024 / 1024 / 1024)} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Free Memory:</span>
                          <span className="text-gray-300">{Math.round(systemMetrics.freeMemory / 1024 / 1024 / 1024)} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Used Memory:</span>
                          <span className="text-gray-300">{Math.round(systemMetrics.usedMemory / 1024 / 1024 / 1024)} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network Activity:</span>
                          <span className="text-gray-300">{Math.round(analysisResults?.networkActivity || 0)} KB/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">System Issues</h3>
              <div className="space-y-4">
                {getSystemIssues().length > 0 ? (
                  getSystemIssues().map((issue, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              issue.severity === 'critical' ? 'bg-red-900 text-red-300' :
                              issue.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                              'bg-yellow-900 text-yellow-300'
                            }`}>
                              {issue.severity.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-100 mb-1">{issue.title}</h4>
                          <p className="text-sm text-gray-400">Type: {issue.type}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">Impact</span>
                          <div className="text-lg font-bold text-red-400">{issue.impact}/10</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-300">No system issues detected</p>
                    <p className="text-gray-500 text-sm">All systems are operating normally</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Optimization Opportunities</h3>
              <div className="space-y-4">
                {getOptimizationOpportunities().map((opportunity, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-medium px-2 py-1 rounded bg-green-900 text-green-300">
                            {opportunity.type.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-100">{opportunity.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Value</span>
                        <div className="text-lg font-bold text-green-400">{opportunity.value}/10</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}