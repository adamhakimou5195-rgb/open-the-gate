import React from 'react';
import { GraduationCap, Shield, Clock, LogOut, BookOpen, User, QrCode, Smartphone } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  onNavigate, 
  adminToken, 
  onAdminLogout, 
  onOpenShareModal,
  testProgress = null 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                OPEN THE GATE
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                CECRL
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium tracking-wide">
              Académie de Formation Linguistique & Certification
            </p>
          </div>
        </div>

        {/* Center: Live Test Status (if test in progress) */}
        {currentView === 'test' && testProgress && (
          <div className="hidden md:flex items-center gap-6 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Progression :
              </span>
              <span className="text-sm font-bold text-indigo-700">
                {testProgress.current} / {testProgress.total}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold font-mono">
                {testProgress.timeFormatted}
              </span>
            </div>
          </div>
        )}

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              title="Connecter un smartphone ou un autre appareil"
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Accès Mobile (QR Code)</span>
            </button>
          )}

          {adminToken ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  currentView === 'admin' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                Tableau de Bord Admin
              </button>
              <button
                onClick={onAdminLogout}
                title="Déconnexion admin"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentView !== 'test' && (
                <>
                  <button
                    onClick={() => onNavigate('home')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'home' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Accueil
                  </button>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    Espace Pédagogique
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
