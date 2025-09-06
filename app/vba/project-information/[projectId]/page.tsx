'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Save } from 'lucide-react';

interface ProjectInfo {
  reference: string;
  attention: string;
  logoUrl?: string;
  projectName: string;
  projectAddress: string;
  licenseNumber: string;
  companyName: string;
  digitalSignature?: string;
}

export default function ProjectInformationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    reference: '',
    attention: '',
    projectName: '',
    projectAddress: '',
    licenseNumber: '',
    companyName: '',
  });

  useEffect(() => {
    // Load project data
    const savedProjects = localStorage.getItem('vba-projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const project = projects.find((p: any) => p.id === projectId);
      if (project) {
        setProjectInfo(prev => ({
          ...prev,
          projectName: project.projectName || '',
          projectAddress: project.address || '',
        }));
      }
    }

    // Load saved project info
    const savedInfo = localStorage.getItem(`vba-project-info-${projectId}`);
    if (savedInfo) {
      setProjectInfo(prev => ({ ...prev, ...JSON.parse(savedInfo) }));
    }
  }, [projectId]);

  const handleSave = () => {
    localStorage.setItem(`vba-project-info-${projectId}`, JSON.stringify(projectInfo));
    alert('Project information saved successfully!');
  };

  const handleFileUpload = (type: 'logo' | 'signature') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (type === 'logo') {
            setProjectInfo({ ...projectInfo, logoUrl: e.target?.result as string });
          } else {
            setProjectInfo({ ...projectInfo, digitalSignature: e.target?.result as string });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
              <div>
                <h1 className="text-xl font-bold text-yellow-400">Project Information</h1>
                <p className="text-sm text-gray-300">Edit project details for inspection reports</p>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              <Save className="h-5 w-5" />
              <span>Save Information</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="card-modern hover-lift p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={projectInfo.reference}
                onChange={(e) => setProjectInfo({ ...projectInfo, reference: e.target.value })}
                placeholder="Project Reference"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Attention
              </label>
              <input
                type="text"
                value={projectInfo.attention}
                onChange={(e) => setProjectInfo({ ...projectInfo, attention: e.target.value })}
                placeholder="Recipient Name"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Company Logo
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-800">
                {projectInfo.logoUrl ? (
                  <img src={projectInfo.logoUrl} alt="Logo" className="h-20 mx-auto mb-2" />
                ) : null}
                <button
                  onClick={() => handleFileUpload('logo')}
                  className="btn-secondary mx-auto"
                >
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo({ ...projectInfo, projectName: e.target.value })}
                placeholder="Project Name"
                className="input-modern"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Project Address
              </label>
              <input
                type="text"
                value={projectInfo.projectAddress}
                onChange={(e) => setProjectInfo({ ...projectInfo, projectAddress: e.target.value })}
                placeholder="Project Address"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                License Number
              </label>
              <input
                type="text"
                value={projectInfo.licenseNumber}
                onChange={(e) => setProjectInfo({ ...projectInfo, licenseNumber: e.target.value })}
                placeholder="PE12345"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={projectInfo.companyName}
                onChange={(e) => setProjectInfo({ ...projectInfo, companyName: e.target.value })}
                placeholder="Engineering Associates, Inc."
                className="input-modern"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-yellow-400 mb-1">
                Digital Signature
              </label>
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center">
                {projectInfo.digitalSignature ? (
                  <img src={projectInfo.digitalSignature} alt="Signature" className="h-20 mx-auto mb-2" />
                ) : null}
                <button
                  onClick={() => handleFileUpload('signature')}
                  className="btn-secondary mx-auto"
                >
                  <Upload className="h-4 w-4" />
                  Upload Digital Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}