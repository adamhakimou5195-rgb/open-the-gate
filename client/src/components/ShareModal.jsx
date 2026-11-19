import React, { useState } from 'react';
import { X, Smartphone, Wifi, Copy, Check, QrCode, Globe, ShieldCheck } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, localIp = '192.168.100.40', port = 5000 }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = `http://${localIp}:${port}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(mobileUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Connecter d'autres appareils
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Faites passer le test à des candidats sur smartphone, tablette ou autre ordinateur.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center mb-6 flex flex-col items-center justify-center">
          <img
            src={qrCodeUrl}
            alt="QR Code d'accès au test"
            className="w-48 h-48 rounded-xl shadow-md bg-white p-2"
          />
          <span className="text-xs font-semibold text-slate-600 mt-3 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-indigo-600" />
            Scannez ce QR Code avec l'appareil photo du téléphone
          </span>
        </div>

        {/* URL Link Box */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Ou tapez directement ce lien dans le navigateur mobile :
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-indigo-700 select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prerequisite reminder */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>Condition requise :</span>
          </div>
          <p className="leading-relaxed">
            Les smartphones ou tablettes doivent être connectés au <strong>même réseau Wi-Fi</strong> que cet ordinateur (ou au partage de connexion du téléphone).
          </p>
        </div>

      </div>
    </div>
  );
}
