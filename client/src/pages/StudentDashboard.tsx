import React, { useState, useEffect } from 'react';
import { Award, Download, Share2, QrCode, ExternalLink, ShieldCheck, Check, Copy } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudentCerts() {
      try {
        const res = await api.get('/certificates');
        setCertificates(res.data.certificates);
      } catch (err) {
        console.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    }
    loadStudentCerts();
  }, []);

  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-400">
            <Award className="w-4 h-4" />
            <span>Student Digital Credential Wallet</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Welcome, {user?.name || 'Nipun Kumar Kushwah'}
          </h1>
        </div>
      </div>

      {/* CERTIFICATES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <GlassCard key={cert.id} glow className="p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={cert.status} size="sm" />
                <span className="font-mono text-xs text-brand-400 font-bold">{cert.certificateId}</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{cert.course}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{cert.institution?.name || 'Example University'}</p>
              </div>

              {cert.grade && (
                <div className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 inline-block font-mono">
                  Honors: {cert.grade}
                </div>
              )}

              <div className="space-y-1 pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                <div>Issue Date: {cert.issueDate}</div>
                <div className="truncate">Blockchain Block: #{cert.blockNumber || 1}</div>
                <div className="truncate text-slate-500">SHA-256: {cert.certificateHash.substring(0, 24)}...</div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <a
                href={`/api/certificates/${cert.certificateId}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>

              <button
                onClick={() => handleCopyLink(cert.certificateId)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center space-x-1.5"
              >
                {copiedId === cert.certificateId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedId === cert.certificateId ? 'Link Copied!' : 'Share Link'}</span>
              </button>

              <button
                onClick={() => setSelectedQr(cert.certificateId)}
                className="px-3 py-2 rounded-lg bg-navy-950 hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1 border border-slate-800"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* QR MODAL */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-navy-900 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Verification QR Code</h3>
            <p className="text-xs text-slate-400 font-mono">{selectedQr}</p>

            <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-xl">
              <QRCodeSVG
                value={`${window.location.origin}/verify/${selectedQr}`}
                size={180}
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedQr(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
