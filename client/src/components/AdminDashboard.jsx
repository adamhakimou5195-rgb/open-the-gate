import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  BarChart2, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  CheckCircle, 
  BookOpen, 
  Headphones, 
  Sparkles, 
  FileText, 
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  getAdminAnalytics, 
  getAdminSessions, 
  getAdminQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  getCertificatePdfUrl,
  getExportCsvUrl
} from '../services/api';

export default function AdminDashboard({ adminToken }) {
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'questions'
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Leads
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Filters for Questions
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [qLevelFilter, setQLevelFilter] = useState('ALL');

  // Question Modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    skill_type: 'GRAMMAR',
    cefr_level: 'B1',
    question_text: '',
    context_text: '',
    audio_text: '',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' }
    ],
    correct_option_id: 'a',
    points: 1
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, sessionsData, questionsData] = await Promise.all([
        getAdminAnalytics(adminToken),
        getAdminSessions(adminToken, { level: levelFilter, search: searchQuery }),
        getAdminQuestions(adminToken, { skill: skillFilter, level: qLevelFilter })
      ]);
      setAnalytics(analyticsData);
      setSessions(sessionsData.sessions || []);
      setQuestions(questionsData.questions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [levelFilter, skillFilter, qLevelFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    getAdminSessions(adminToken, { level: levelFilter, search: searchQuery })
      .then(res => setSessions(res.sessions || []));
  };

  // Open modal for creating or editing
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      skill_type: 'GRAMMAR',
      cefr_level: 'B1',
      question_text: '',
      context_text: '',
      audio_text: '',
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' }
      ],
      correct_option_id: 'a',
      points: 2
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionFormData({
      skill_type: q.skill_type,
      cefr_level: q.cefr_level,
      question_text: q.question_text,
      context_text: q.context_text || '',
      audio_text: q.audio_text || '',
      options: q.options || [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' }
      ],
      correct_option_id: q.correct_option_id,
      points: q.points || 1
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await updateQuestion(adminToken, editingQuestion.id, questionFormData);
      } else {
        await createQuestion(adminToken, questionFormData);
      }
      setIsQuestionModalOpen(false);
      // Reload questions
      const qRes = await getAdminQuestions(adminToken, { skill: skillFilter, level: qLevelFilter });
      setQuestions(qRes.questions || []);
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;
    try {
      await deleteQuestion(adminToken, id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  const handleExportCSV = () => {
    const url = getExportCsvUrl(adminToken);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Dashboard Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Tableau de Bord Pédagogique
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Supervision des tests de niveau, qualification des leads et gestion de la banque de questions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-100 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter les Leads (CSV)</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Candidats</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics.totalStudents}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tests Complétés</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics.completedSessions}</h3>
                <span className="text-xs font-semibold text-emerald-700">Taux : {analytics.completionRate}%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Score Moyen</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics.averageScore} pts</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions Actives</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{questions.length}</h3>
              </div>
            </div>

          </div>
        )}

        {/* Level Distribution Bar Chart */}
        {analytics && analytics.levelDistribution && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
              Répartition des Niveaux CECRL Obtenus
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => {
                const count = analytics.levelDistribution[lvl] || 0;
                return (
                  <div key={lvl} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="font-extrabold text-indigo-700 text-lg">{lvl}</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{count}</p>
                    <span className="text-xs text-slate-600 font-medium">candidat{count > 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="border-b border-slate-200 flex gap-6">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 font-bold text-sm tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Candidats & Résultats ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 font-bold text-sm tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Banque de Questions ({questions.length})
          </button>
        </div>

        {/* TAB 1: LEADS & RESULTS */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher nom, email, téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </form>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Niveau :</span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Tous les niveaux</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-4 px-6">Candidat</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6">Objectif</th>
                      <th className="py-4 px-6">Niveau CECRL</th>
                      <th className="py-4 px-6">Score</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Attestation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                          Aucun test enregistré pour l'instant.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {s.full_name}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            <div>{s.email}</div>
                            <div className="text-xs text-slate-600 font-mono">{s.phone}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-700 text-xs max-w-xs truncate">
                            {s.learning_goal || 'Perfectionnement'}
                          </td>
                          <td className="py-4 px-6">
                            {s.assigned_cefr_level ? (
                              <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-indigo-100 text-indigo-800 border border-indigo-200">
                                {s.assigned_cefr_level}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-amber-100 text-amber-800">
                                En cours
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-slate-800">
                            {s.total_score} pts
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-600">
                            {new Date(s.started_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {s.certificate_id ? (
                              <a
                                href={getCertificatePdfUrl(s.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                              >
                                <span>PDF</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: QUESTIONS BANK (CRUD) */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Toutes les compétences</option>
                  <option value="GRAMMAR">Grammaire</option>
                  <option value="VOCABULARY">Vocabulaire</option>
                  <option value="READING">Reading</option>
                  <option value="LISTENING">Listening</option>
                </select>

                <select
                  value={qLevelFilter}
                  onChange={(e) => setQLevelFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white"
                >
                  <option value="ALL">Tous les paliers CECRL</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Question</span>
              </button>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-4 px-6">Compétence</th>
                      <th className="py-4 px-6">Palier</th>
                      <th className="py-4 px-6">Énoncé de la question</th>
                      <th className="py-4 px-6">Bonne Réponse</th>
                      <th className="py-4 px-6">Points</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => {
                      const correctOpt = q.options?.find(o => o.id === q.correct_option_id);
                      return (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                              {q.skill_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold font-mono text-indigo-700">
                            {q.cefr_level}
                          </td>
                          <td className="py-4 px-6 max-w-md font-medium text-slate-900">
                            <div className="truncate">{q.question_text}</div>
                            {q.context_text && (
                              <div className="text-xs text-amber-700 italic truncate mt-0.5">
                                [Reading passage associé]
                              </div>
                            )}
                            {q.audio_text && (
                              <div className="text-xs text-violet-700 italic truncate mt-0.5">
                                [Listening script audio associé]
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-emerald-700 font-semibold text-xs">
                            {correctOpt?.text || q.correct_option_id}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-slate-700">
                            {q.points} pt{q.points > 1 ? 's' : ''}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* QUESTION MODAL (CREATE / EDIT) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            <div className="bg-indigo-700 p-6 text-white flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-xl font-bold">
                {editingQuestion ? 'Modifier la question' : 'Créer une nouvelle question'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Compétence
                  </label>
                  <select
                    value={questionFormData.skill_type}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, skill_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                  >
                    <option value="GRAMMAR">GRAMMAR</option>
                    <option value="VOCABULARY">VOCABULARY</option>
                    <option value="READING">READING</option>
                    <option value="LISTENING">LISTENING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Palier CECRL
                  </label>
                  <select
                    value={questionFormData.cefr_level}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, cefr_level: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Énoncé de la question
                </label>
                <textarea
                  rows="2"
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                  placeholder="Ex : Choose the correct preposition..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {questionFormData.skill_type === 'READING' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                    Texte de Lecture (Reading Passage)
                  </label>
                  <textarea
                    rows="3"
                    value={questionFormData.context_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, context_text: e.target.value })}
                    placeholder="Collez ici l'article ou le texte court à analyser..."
                    className="w-full p-3 rounded-xl border border-amber-300 bg-amber-50/50 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {questionFormData.skill_type === 'LISTENING' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-violet-800 mb-1">
                    Script Audio de l'Extrait (Listening)
                  </label>
                  <textarea
                    rows="3"
                    value={questionFormData.audio_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, audio_text: e.target.value })}
                    placeholder="Dialogue ou annonce lue par le player audio..."
                    className="w-full p-3 rounded-xl border border-violet-300 bg-violet-50/50 text-sm focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Options de Réponses (Cochez la bonne réponse)
                </label>
                {questionFormData.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={questionFormData.correct_option_id === opt.id}
                      onChange={() => setQuestionFormData({ ...questionFormData, correct_option_id: opt.id })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-slate-500 w-4">
                      {String.fromCharCode(65 + idx)}:
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...questionFormData.options];
                        newOpts[idx].text = e.target.value;
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }}
                      placeholder={`Texte de l'option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 cursor-pointer"
                >
                  Enregistrer la Question
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
