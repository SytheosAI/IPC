'use client';

import React from 'react';
import { InspectionReportTemplate } from '@/src/components/inspections/InspectionReportTemplate';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function InspectionReportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="glass-morphism border-b border-gray-600 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-200 hover:text-yellow-400"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <InspectionReportTemplate projectId={projectId} />
      </div>
    </main>
  );
}