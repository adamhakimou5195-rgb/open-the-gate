import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen, 
  Headphones, 
  Sparkles, 
  FileText,
  Send
} from 'lucide-react';

export default function TestView({ 
  session, 
  onRecordAnswer, 
  onSubmitTest, 
  isSubmitting,
  onCancelTest 
}) {
  const { sessionId, questions = [], estimatedTimeMinutes = 20 } = session;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(estimatedTimeMinutes * 60);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [listenCounts, setListenCounts] = useState({}); // { [questionId]: count }
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [antiCheatWarning, setAntiCheatWarning] = useState('');

  const currentQuestion = questions[currentIndex] || null;

  // Global Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = () => {
    setAntiCheatWarning('Temps imparti écoulé ! Finalisation automatique de votre test...');
    setTimeout(() => {
      onSubmitTest();
    }, 1500);
  };

  // Anti-cheat protections: Right-click & Copy-Paste prevention
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerAntiCheat('Le clic droit est désactivé durant le test d\'évaluation.');
    };

    const handleCopy = (e) => {
      e.preventDefault();
      triggerAntiCheat('Le copier-coller est désactivé afin de garantir l\'intégrité de l\'évaluation.');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  const triggerAntiCheat = (msg) => {
    setAntiCheatWarning(msg);
    setTimeout(() => {
      setAntiCheatWarning('');
    }, 3500);
  };

  // Select Option
  const handleSelectOption = (optionId) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));

    // Send to backend in background
    onRecordAnswer(sessionId, qId, optionId);
  };

  // Audio Playback with Web Speech API & 2-listen limit
  const handlePlayAudio = () => {
    if (!currentQuestion || currentQuestion.skill_type !== 'LISTENING') return;

    const qId = currentQuestion.id;
    const currentCount = listenCounts[qId] || 0;

    if (currentCount >= 2) {
      triggerAntiCheat('Vous avez atteint le maximum de 2 écoutes autorisées pour cet extrait.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const scriptText = currentQuestion.audio_text || currentQuestion.question_text;
    if (!scriptText) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.lang = 'en-US';
      utterance.rate = 0.95; // Natural deliberate pacing

      // Choose natural English voice if present
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
      if (engVoice) utterance.voice = engVoice;

      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setListenCounts((prev) => ({ ...prev, [qId]: currentCount + 1 }));
      };

      utterance.onend = () => {
        setIsPlayingAudio(false);
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('La synthèse audio n\'est pas supportée sur votre navigateur.');
    }
  };

  // Stop speech when changing question
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, [currentIndex]);

  // Format Timer mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const getSkillConfig = (skill) => {
    switch (skill) {
      case 'GRAMMAR':
        return { label: 'Grammaire & Syntaxe', icon: BookOpen, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'VOCABULARY':
        return { label: 'Vocabulaire & Collocations', icon: Sparkles, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'READING':
        return { label: 'Compréhension Écrite (Reading)', icon: FileText, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'LISTENING':
        return { label: 'Compréhension Orale (Listening)', icon: Headphones, color: 'bg-violet-100 text-violet-800 border-violet-200' };
      default:
        return { label: skill, icon: BookOpen, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Chargement des questions du test...</p>
      </div>
    );
  }

  const skillInfo = getSkillConfig(currentQuestion.skill_type);
  const SkillIcon = skillInfo.icon;
  const currentListenCount = listenCounts[currentQuestion.id] || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Anti-cheat Toast Warning */}
        {antiCheatWarning && (
          <div className="fixed top-6 right-6 z-50 bg-amber-900 text-amber-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-700 animate-bounce">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-sm font-medium">{antiCheatWarning}</span>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question {currentIndex + 1} / {questions.length}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${skillInfo.color}`}>
              <SkillIcon className="w-3.5 h-3.5" />
              <span>{skillInfo.label}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono font-bold">
              Palier {currentQuestion.cefr_level}
            </span>
          </div>

          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm border ${
            timeLeftSeconds < 180 
              ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)} restant</span>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Question Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
          
          {/* READING PASSAGE (if Reading question) */}
          {currentQuestion.skill_type === 'READING' && currentQuestion.context_text && (
            <div className="mb-6 p-5 bg-amber-50/60 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Texte de lecture (Reading Comprehension)</span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                {currentQuestion.context_text}
              </p>
            </div>
          )}

          {/* LISTENING AUDIO PLAYER (if Listening question) */}
          {currentQuestion.skill_type === 'LISTENING' && (
            <div className="mb-6 p-5 bg-violet-50/80 rounded-xl border border-violet-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-800">
                  <Headphones className="w-4 h-4 text-violet-600" />
                  <span>Extrait Audio (Listening Comprehension)</span>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-200/70 text-violet-800">
                  Écoute : {currentListenCount} / 2
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayAudio}
                  disabled={currentListenCount >= 2 && !isPlayingAudio}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    currentListenCount >= 2 && !isPlayingAudio
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isPlayingAudio
                      ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{currentListenCount === 0 ? 'Lancer l\'audio (Écoute 1/2)' : 'Réécouter l\'audio (Écoute 2/2)'}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 italic">
                  {currentListenCount >= 2 
                    ? 'Limite d\'écoute atteinte pour cette question.' 
                    : 'Conseil : activez vos écouteurs pour une écoute claire.'}
                </p>
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options && currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              const letter = String.fromCharCode(65 + idx); // A, B, C, D

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 shadow-sm text-indigo-950'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {letter}
                  </div>
                  <span className="text-base font-medium flex-1">
                    {opt.text}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Card Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <div className="text-xs text-slate-600 font-medium hidden sm:block">
              {answeredCount} sur {questions.length} répondues
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Terminer et Voir mes Résultats</span>
                <Send className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Confirmer la soumission du test ?
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Vous avez répondu à <strong>{answeredCount} sur {questions.length}</strong> questions. 
              Une fois validé, notre moteur calculera immédiatement votre niveau CECRL et émettra votre attestation.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm cursor-pointer"
              >
                Vérifier mes réponses
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmitTest();
                }}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-200 cursor-pointer"
              >
                {isSubmitting ? 'Calcul en cours...' : 'Confirmer et Calculer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
