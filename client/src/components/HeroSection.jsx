import React from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Award, 
  Headphones, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Target,
  FileText
} from 'lucide-react';

export default function HeroSection({ onStartTestClick }) {
  const cefrLevels = [
    { code: 'A1', label: 'Découverte', desc: 'Expressions quotidiennes de base' },
    { code: 'A2', label: 'Élémentaire', desc: 'Situations courantes et immédiates' },
    { code: 'B1', label: 'Intermédiaire', desc: 'Autonomie dans les échanges usuels' },
    { code: 'B2', label: 'Avancé', desc: 'Aisance professionnelle et spontanéité' },
    { code: 'C1', label: 'Autonome', desc: 'Maîtrise fluide et contextes complexes' },
    { code: 'C2', label: 'Maîtrise', desc: 'Niveau bilingue d\'excellence' },
  ];

  const competencies = [
    {
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      title: 'Grammaire & Syntaxe',
      desc: 'Évaluation des temps, conditionnels, structures passives et inversion syntaxique.'
    },
    {
      icon: Sparkles,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      title: 'Vocabulaire & Idiomes',
      desc: 'Richesse lexicale, collocations professionnelles et faux-amis fréquents.'
    },
    {
      icon: FileText,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      title: 'Compréhension Écrite',
      desc: 'Analyse d\'articles, notes professionnelles, correspondances et déductions logiques.'
    },
    {
      icon: Headphones,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
      title: 'Compréhension Orale',
      desc: 'Dialogues immersifs, annonces internationales et briefings audio authentiques.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-white to-slate-50">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Test Officiel de Positionnement CECRL • 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Ouvrez les portes de votre avenir avec{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
                OPEN THE GATE
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Mesurez votre niveau réel d'anglais en <strong>15 à 20 minutes</strong> grâce à notre moteur adaptatif. 
              Recevez instantanément votre bilan détaillé par compétence et votre <strong>attestation officielle PDF</strong>.
            </p>

            {/* CTA Group */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartTestClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Commencer le Test Gratuit</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Feature badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>15 - 20 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Résultats & Certificat immédiats</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>100% Gratuit & Sans engagement</span>
              </div>
            </div>

          </div>

          {/* CEFR Scale Visualizer */}
          <div className="mt-16 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-5xl mx-auto">
            <h3 className="text-center font-bold text-slate-900 text-lg mb-6">
              Échelle d'Évaluation Conforme au Cadre Européen (CECRL)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cefrLevels.map((lvl) => (
                <div 
                  key={lvl.code}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-center group"
                >
                  <div className="w-10 h-10 mx-auto rounded-lg bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {lvl.code}
                  </div>
                  <div className="mt-2 font-bold text-slate-800 text-sm">
                    {lvl.label}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-tight">
                    {lvl.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4 Evaluated Competencies */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Une évaluation complète en 4 dimensions
            </h2>
            <p className="mt-3 text-slate-600">
              Notre protocole pédagogique teste l'ensemble des compétences indispensables pour réussir dans un cadre professionnel ou universitaire international.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competencies.map((comp, idx) => {
              const Icon = comp.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${comp.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {comp.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {comp.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instructions & Guidelines */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              Consignes pour une évaluation optimale
            </h3>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Écouteurs recommandés :</strong> La section Listening contient des extraits audio à écouter attentivement (limité à 2 écoutes par extrait).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Temps maîtrisé :</strong> Le test dure environ 20 minutes. Un chronomètre vous indique le temps restant.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Réponses spontanées :</strong> Évitez d'utiliser des dictionnaires ou traducteurs automatiques afin d'obtenir un placement pédagogique fidèle à votre niveau réel.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Sauvegarde automatique :</strong> Chaque réponse est enregistrée en continu ; en cas de coupure réseau, votre progression est préservée.</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
              <button
                onClick={onStartTestClick}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Je suis prêt, démarrer le test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
