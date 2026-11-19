import React, { useState } from 'react';
import { X, User, Mail, Phone, Target, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LeadCaptureModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    learning_goal: 'Évolution Professionnelle & Carrière'
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setError('Veuillez saisir un numéro de téléphone ou WhatsApp valide.');
      return;
    }

    onSubmit(formData);
  };

  const learningGoals = [
    'Évolution Professionnelle & Carrière',
    'Préparation Examen (TOEIC, TOEFL, IELTS)',
    'Études Supérieures & Mobilité Internationale',
    'Voyage & Aisance Conversationnelle',
    'Perfectionnement Personnel & Confiance'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-indigo-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
            Étape 1 sur 2 • Identification
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Préparez votre test de niveau
          </h2>
          <p className="text-sm text-indigo-100 mt-1">
            Vos résultats et votre attestation officielle seront établis au nom saisi ci-dessous.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nom et Prénom <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ex : Sarah Traoré"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all text-slate-900"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Adresse Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex : sarah.traore@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all text-slate-900"
                required
              />
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Numéro de Téléphone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex : +33 6 12 34 56 78"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all text-slate-900"
                required
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Pour vous envoyer votre attestation par WhatsApp si vous le souhaitez.
            </p>
          </div>

          {/* Learning Goal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Votre Objectif d'Apprentissage
            </label>
            <div className="relative">
              <Target className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="learning_goal"
                value={formData.learning_goal}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all bg-white text-slate-900"
              >
                {learningGoals.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Initialisation du test...</span>
              ) : (
                <>
                  <span>Lancer mon Test de Niveau</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Données confidentielles protégées • Conformité RGPD</span>
          </div>

        </form>

      </div>
    </div>
  );
}
