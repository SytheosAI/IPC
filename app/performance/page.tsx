'use client';

import { Suspense } from 'react';
import { PerformanceDashboardWithSuspense } from '../../components/LazyComponents';

export default function PerformancePage() {
  return (
    <div className="min-h-screen">
      <PerformanceDashboardWithSuspense />
    </div>
  );
}