'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for lazy-loaded components
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-400" />
      <p className="text-gray-300">{message}</p>
    </div>
  </div>
);

// Heavy components that should be lazy loaded
export const LazyArchitectureAnalysis = lazy(() => 
  import('../app/architecture-analysis/page').then(module => ({
    default: module.default
  }))
);

export const LazyVBAProjectDetails = lazy(() => 
  import('../app/vba/project/[projectId]/page').then(module => ({
    default: module.default
  }))
);

export const LazyNotificationCenter = lazy(() => 
  import('../app/notifications/page').then(module => ({
    default: module.default
  }))
);

export const LazySecurityCenter = lazy(() => 
  import('../app/security/page').then(module => ({
    default: module.default
  }))
);

export const LazyProjectControlCenter = lazy(() => 
  import('../app/projects/[id]/control-center/page').then(module => ({
    default: module.default
  }))
);

// Chart components (heavy due to recharts)
export const LazyPerformanceDashboard = lazy(() => 
  import('./PerformanceDashboard').then(module => ({
    default: module.default
  }))
);

export const LazyAnalyticsCharts = lazy(() => 
  import('./AnalyticsCharts').then(module => ({
    default: module.default
  }))
);

// Export utilities for complex operations
export const LazyExportTools = lazy(() => 
  import('./ExportTools').then(module => ({
    default: module.default
  }))
);

// Wrapper components with Suspense boundaries
export const ArchitectureAnalysisWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading System Analysis..." />}>
    <LazyArchitectureAnalysis />
  </Suspense>
);

export const VBAProjectDetailsWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Project Details..." />}>
    <LazyVBAProjectDetails />
  </Suspense>
);

export const NotificationCenterWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Notifications..." />}>
    <LazyNotificationCenter />
  </Suspense>
);

export const SecurityCenterWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Security Center..." />}>
    <LazySecurityCenter />
  </Suspense>
);

export const ProjectControlCenterWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Control Center..." />}>
    <LazyProjectControlCenter />
  </Suspense>
);

export const PerformanceDashboardWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Performance Data..." />}>
    <LazyPerformanceDashboard />
  </Suspense>
);

export const AnalyticsChartsWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Loading Analytics..." />}>
    <LazyAnalyticsCharts />
  </Suspense>
);

export const ExportToolsWithSuspense = () => (
  <Suspense fallback={<LoadingSpinner message="Preparing Export Tools..." />}>
    <LazyExportTools />
  </Suspense>
);