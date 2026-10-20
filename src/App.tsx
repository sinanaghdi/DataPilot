/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalyticsWorkspacePage } from './pages/AnalyticsWorkspacePage';
import { AssistantPage } from './pages/AssistantPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigateTab={setActiveTab} />;
      case 'upload':
        return <UploadPage onNavigateToDashboard={() => setActiveTab('dashboard')} />;
      case 'workspace':
        return <AnalyticsWorkspacePage />;
      case 'assistant':
        return <AssistantPage />;
      case 'anomalies':
        return <AnomaliesPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'landing':
        return (
          <LandingPage
            onStartDashboard={() => setActiveTab('dashboard')}
            onStartUpload={() => setActiveTab('upload')}
          />
        );
      case 'auth':
        return <AuthPage onSuccess={() => setActiveTab('dashboard')} />;
      default:
        return <DashboardPage onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <AuthProvider>
      <DataProvider>
        <div className="flex min-h-screen bg-[#FAF8F5] text-[#0F172A] font-['Vazirmatn',sans-serif] selection:bg-emerald-600 selection:text-white" dir="rtl">
          {/* Main Layout Area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Top Navigation Bar */}
            <Navbar
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                  {renderCurrentPage()}
                </div>
              </main>
            </div>
          </div>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
