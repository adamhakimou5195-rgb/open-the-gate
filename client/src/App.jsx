import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LeadCaptureModal from './components/LeadCaptureModal';
import TestView from './components/TestView';
import ResultView from './components/ResultView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ShareModal from './components/ShareModal';

import { startSession, recordAnswer, submitTest } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'test', 'result', 'admin'
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin auth state from localStorage
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('otg_admin_token') || null);

  const handleStartTestClick = () => {
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const data = await startSession(formData);
      setActiveSession(data);
      setIsLeadModalOpen(false);
      setCurrentView('test');
    } catch (err) {
      alert(err.message || 'Impossible de démarrer le test. Vérifiez la connexion au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordAnswer = (sessionId, questionId, selectedOptionId) => {
    recordAnswer(sessionId, questionId, selectedOptionId).catch((err) => {
      console.warn('Silent answer record warning:', err);
    });
  };

  const handleSubmitTest = async () => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const results = await submitTest(activeSession.sessionId);
      setResultData(results);
      setCurrentView('result');
    } catch (err) {
      alert(err.message || 'Erreur lors de la soumission du test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLoginSuccess = (token) => {
    setAdminToken(token);
    localStorage.setItem('otg_admin_token', token);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('otg_admin_token');
    setCurrentView('home');
  };

  const handleRestartTest = () => {
    setActiveSession(null);
    setResultData(null);
    setCurrentView('home');
    setIsLeadModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        adminToken={adminToken}
        onAdminLogout={handleAdminLogout}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        localIp="192.168.100.40"
        port={5000}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection onStartTestClick={handleStartTestClick} />
            <LeadCaptureModal
              isOpen={isLeadModalOpen}
              onClose={() => setIsLeadModalOpen(false)}
              onSubmit={handleLeadSubmit}
              isLoading={isLoading}
            />
          </>
        )}

        {currentView === 'test' && activeSession && (
          <TestView
            session={activeSession}
            onRecordAnswer={handleRecordAnswer}
            onSubmitTest={handleSubmitTest}
            isSubmitting={isSubmitting}
            onCancelTest={() => setCurrentView('home')}
          />
        )}

        {currentView === 'result' && resultData && (
          <ResultView
            resultData={resultData}
            onRestartTest={handleRestartTest}
          />
        )}

        {currentView === 'admin' && (
          adminToken ? (
            <AdminDashboard adminToken={adminToken} />
          ) : (
            <AdminLogin
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => setCurrentView('home')}
            />
          )
        )}
      </main>

      {/* Footer */}
      {currentView !== 'test' && (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-white text-lg tracking-tight">
                OPEN THE GATE
              </span>
              <span className="text-xs text-slate-500">
                • Placement & Certification CECRL
              </span>
            </div>

            <div className="text-center sm:text-right text-xs space-y-1">
              <p>© 2026 OPEN THE GATE. Tous droits réservés.</p>
              <p className="text-slate-500">Conformité au Cadre Européen Commun de Référence pour les Langues (CECRL).</p>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
