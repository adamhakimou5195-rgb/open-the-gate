import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Download, 
  CheckCircle, 
  BookOpen, 
  Headphones, 
  Sparkles, 
  FileText, 
  Share2, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getCertificatePdfUrl } from '../services/api';

export default function ResultView({ resultData, onRestartTest }) {
  const {
    sessionId,
    studentName = 'Candidat',
    cefr_level = 'B1',
    percentage = 75,
    total_score = 15,
    max_possible_score = 20,
    skills_breakdown = { GRAMMAR: 75, VOCABULARY: 80, READING: 70, LISTENING: 75 },
    details = {},
    certificateId = 'OTG-2026-CERT'
  } = resultData || {};

  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const getLevelColor = (level) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          badge: 'bg-emerald-600 text-white',
          accent: 'text-emerald-600'
        };
      case 'B1':
      case 'B2':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
          badge: 'bg-indigo-600 text-white',
          accent: 'text-indigo-600'
        };
      case 'C1':
      case 'C2':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-300',
          badge: 'bg-purple-600 text-white',
          accent: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-300',
          badge: 'bg-slate-600 text-white',
          accent: 'text-slate-600'
        };
    }
  };

  const levelColor = getLevelColor(cefr_level);

  const skills = [
    { key: 'GRAMMAR', label: 'Grammaire & Syntaxe', score: skills_breakdown.GRAMMAR ?? 0, icon: BookOpen, color: 'bg-indigo-600' },
    { key: 'VOCABULARY', label: 'Vocabulaire & Idiomes', score: skills_breakdown.VOCABULARY ?? 0, icon: Sparkles, color: 'bg-emerald-600' },
    { key: 'READING', label: 'Compréhension Écrite', score: skills_breakdown.READING ?? 0, icon: FileText, color: 'bg-amber-600' },
    { key: 'LISTENING', label: 'Compréhension Orale', score: skills_breakdown.LISTENING ?? 0, icon: Headphones, color: 'bg-violet-600' },
  ];

  const handleDownloadPDF = () => {
    const url = getCertificatePdfUrl(sessionId);
    window.open(url, '_blank');
  };

  const whatsappMessage = encodeURIComponent(
    `Bonjour OPEN THE GATE ! Je viens de passer mon test de niveau d'anglais. J'ai obtenu le niveau ${cefr_level} (${percentage}%). Je souhaiterais avoir des informations sur vos programmes de formation adaptés.`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Certificate Card Header */}
        <div className={`p-8 sm:p-10 rounded-3xl border-2 shadow-xl bg-white relative overflow-hidden`}>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Attestation Officielle de Niveau</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Félicitations, {studentName} !
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Identifiant de vérification : <span className="font-mono font-bold text-slate-700">{certificateId}</span>
              </p>
            </div>

            {/* CEFR Level Badge */}
            <div className={`text-center px-6 py-4 rounded-2xl border ${levelColor.bg} shadow-md`}>
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                Niveau CECRL Estimé
              </span>
              <span className="block text-4xl sm:text-5xl font-black mt-1 text-indigo-700 tracking-tight">
                {cefr_level}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 shadow-xs mt-1 inline-block">
                Score : {percentage}%
              </span>
            </div>
          </div>

          {/* Level Details / Description */}
          <div className="mt-6 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <h3 className="font-bold text-indigo-900 text-lg mb-1">
              {details.title || `${cefr_level} - Niveau Officiel`}
            </h3>
            <p className="text-sm text-indigo-950 leading-relaxed">
              {details.summary || 'Votre performance démontre une très bonne maîtrise des fondamentaux linguistiques.'}
            </p>
          </div>

          {/* Skill Breakdown */}
          <div className="mt-8">
            <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
              <span>Bilan Détaillé par Compétence :</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-800 mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{s.label}</span>
                      </div>
                      <span className="text-indigo-600">{s.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${s.color} h-2.5 rounded-full transition-all duration-700`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Program */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Recommandation Personnalisée Open The Gate
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  {details.recommendation || 'Programme Intensif Sur-Mesure'}
                </h4>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Ce cursus est spécialement calibré pour consolider vos acquis et vous propulser vers le palier CECRL supérieur en un temps record.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger mon Attestation Officielle PDF</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Échanger sur WhatsApp</span>
              </a>

              <button
                onClick={onRestartTest}
                title="Repasser le test"
                className="p-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

        {/* Security & Verification Guarantee */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <ShieldCheck className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <h5 className="font-bold text-slate-900 text-sm">
                Attestation Certifiée OPEN THE GATE
              </h5>
              <p className="text-xs text-slate-500">
                Ce document possède une signature numérique et peut être fourni à votre employeur ou organisme de formation.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
          >
            Vérifier la validité du certificat
          </button>
        </div>

      </div>
    </div>
  );
}
