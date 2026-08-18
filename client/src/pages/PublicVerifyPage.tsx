import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Upload, Search, FileText, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Download, ExternalLink, Cpu, GitCommit, Copy, Check } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { api, computeSHA256 } from '../services/api';
import confetti from 'canvas-confetti';

export const PublicVerifyPage: React.FC = () => {
  const { certificateId: urlCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();

  const [inputCertId, setInputCertId] = useState(urlCertId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlCertId) {
      handleVerifyById(urlCertId);
    }
  }, [urlCertId]);

  const handleVerifyById = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const res = await api.get(`/verify/${idToVerify.trim()}`);
      setVerificationResult(res.data);

      if (res.data?.verification?.isValid) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify certificate ID');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const computedHash = await computeSHA256(file);
      const formData = new FormData();
      formData.append('file', file);
      if (inputCertId) formData.append('certificateId', inputCertId);

      const res = await api.post('/verify/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVerificationResult(res.data);

      if (res.data?.verification?.isValid) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze uploaded certificate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Public Cryptographic Verification Portal</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Verify Certificate Authenticity
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Enter a Certificate ID or upload the official PDF document to perform real-time SHA-256 blockchain verification.
        </p>
      </div>

      {/* SEARCH / INPUT CARD */}
      <GlassCard glow className="p-8">
        <div className="space-y-6">
          {/* Option 1: Search by Certificate ID */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Option 1: Search by Certificate ID
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={inputCertId}
                  onChange={(e) => setInputCertId(e.target.value)}
                  placeholder="e.g. CERT-2026-000001"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyById(inputCertId)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-navy-950/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm font-mono"
                />
              </div>
              <button
                onClick={() => {
                  if (inputCertId.trim()) {
                    navigate(`/verify/${inputCertId.trim()}`);
                    handleVerifyById(inputCertId.trim());
                  }
                }}
                disabled={loading}
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-600/30 text-sm flex items-center space-x-2"
              >
                <span>VERIFY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-navy-900 px-3 text-xs text-slate-500 uppercase font-mono absolute">OR</span>
          </div>

          {/* Option 2: Upload Certificate PDF */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-slate-300">
              Option 2: Upload Certificate PDF File for Hash Audit
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700/80 hover:border-brand-500/60 rounded-2xl p-8 text-center bg-navy-950/50 hover:bg-navy-950/80 transition-all cursor-pointer group"
            >
              <input
                type="file"
                accept=".pdf"
                id="pdf-upload-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  {selectedFile ? selectedFile.name : 'Drag & drop certificate PDF here, or click to browse'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Browser calculates SHA-256 hash locally before sending to ledger
                </div>
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* SAMPLE QUICK LINKS */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <span className="text-slate-400">Try sample certificates:</span>
        <button
          onClick={() => { setInputCertId('CERT-2026-000001'); navigate('/verify/CERT-2026-000001'); handleVerifyById('CERT-2026-000001'); }}
          className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-mono"
        >
          CERT-2026-000001 (Valid)
        </button>
        <button
          onClick={() => { setInputCertId('CERT-2026-000003'); navigate('/verify/CERT-2026-000003'); handleVerifyById('CERT-2026-000003'); }}
          className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-mono"
        >
          CERT-2026-000003 (Revoked)
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-base font-bold text-white">Querying PoA Blockchain Ledger...</div>
          <div className="text-xs text-slate-400 font-mono">Calculating SHA-256 & auditing Merkle proof path</div>
        </GlassCard>
      )}

      {/* ERROR MSG */}
      {error && (
        <GlassCard className="border-rose-500/30 bg-rose-950/20 p-6 text-rose-300 text-sm">
          {error}
        </GlassCard>
      )}

      {/* VERIFICATION RESULT UI DISPLAY */}
      {verificationResult && !loading && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* SUCCESS / VALID BANNER */}
            {verificationResult.verification?.status === 'VALID' && (
              <GlassCard glow className="p-8 border-emerald-500/40 bg-emerald-950/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-extrabold text-white">CERTIFICATE AUTHENTIC</h2>
                        <StatusBadge status="VALID" size="sm" />
                      </div>
                      <p className="text-slate-300 text-sm mt-1">
                        {verificationResult.verification.reason}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/api/certificates/${verificationResult.certificateDetails?.certificateId || urlCertId}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center space-x-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </GlassCard>
            )}

            {/* REVOKED BANNER */}
            {verificationResult.verification?.status === 'REVOKED' && (
              <GlassCard className="p-8 border-amber-500/40 bg-amber-950/20">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-extrabold text-amber-300">CERTIFICATE REVOKED</h2>
                      <StatusBadge status="REVOKED" size="sm" />
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      {verificationResult.verification.reason}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* INVALID BANNER */}
            {(verificationResult.verification?.status === 'INVALID' || verificationResult.verification?.status === 'NOT_FOUND') && (
              <GlassCard className="p-8 border-rose-500/40 bg-rose-950/20">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl font-extrabold text-rose-300">VERIFICATION FAILED</h2>
                      <StatusBadge status="INVALID" size="sm" />
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      {verificationResult.verification.reason}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* AUDIT CHECKS ITEMIZATION */}
            <GlassCard className="p-6">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
                Cryptographic Integrity Checks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Document Hash</div>
                  <div className={`text-sm font-bold mt-1 ${verificationResult.verification?.auditChecks?.documentIntegrity ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verificationResult.verification?.auditChecks?.documentIntegrity ? '✓ Matches Blockchain' : '✕ Mismatch / Corrupted'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Digital Signature</div>
                  <div className={`text-sm font-bold mt-1 ${verificationResult.verification?.auditChecks?.digitalSignatureValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verificationResult.verification?.auditChecks?.digitalSignatureValid ? '✓ Ed25519 Verified' : '✕ Invalid Signature'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Blockchain Block</div>
                  <div className={`text-sm font-bold mt-1 ${verificationResult.verification?.auditChecks?.blockchainAnchored ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {verificationResult.verification?.auditChecks?.blockchainAnchored ? `✓ Block #${verificationResult.verification?.block?.index || '0'}` : '✕ Unanchored'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                  <div className="text-xs text-slate-400">Revocation Status</div>
                  <div className={`text-sm font-bold mt-1 ${verificationResult.verification?.auditChecks?.notRevoked ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {verificationResult.verification?.auditChecks?.notRevoked ? '✓ Active / Clean' : '⚠ REVOKED'}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* CERTIFICATE & BLOCKCHAIN DETAILS TABLE */}
            {verificationResult.certificateDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificate Credentials */}
                <GlassCard className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-white text-base">Credential Metadata</h3>
                    <FileText className="w-5 h-5 text-brand-400" />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-400">Student Holder</div>
                      <div className="text-base font-bold text-white">{verificationResult.certificateDetails.studentName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Degree / Qualification</div>
                      <div className="font-semibold text-brand-300">{verificationResult.certificateDetails.course}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Issuing Institution</div>
                      <div className="font-semibold text-slate-200">{verificationResult.certificateDetails.institutionName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Date of Issuance</div>
                      <div className="text-slate-300 font-mono text-xs">{verificationResult.certificateDetails.issueDate}</div>
                    </div>
                  </div>
                </GlassCard>

                {/* Blockchain Proof Data */}
                <GlassCard className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-white text-base">Blockchain Ledger Proof</h3>
                    <Cpu className="w-5 h-5 text-indigo-400" />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-400">Block Height & Hash</div>
                      <div className="font-mono text-xs text-brand-400 truncate">
                        Block #{verificationResult.verification?.block?.index} ({verificationResult.verification?.block?.hash})
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Transaction ID</div>
                      <div className="font-mono text-xs text-purple-300 truncate">
                        {verificationResult.verification?.certificateRecord?.transactionId || 'TX-ANCHORED'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Certificate SHA-256 Hash</div>
                      <div className="flex items-center space-x-2">
                        <div className="font-mono text-xs text-slate-300 truncate">
                          {verificationResult.verification?.certificateRecord?.certificateHash || verificationResult.computedHash}
                        </div>
                        <button
                          onClick={() => handleCopy(verificationResult.verification?.certificateRecord?.certificateHash || verificationResult.computedHash)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Merkle Root</div>
                      <div className="font-mono text-xs text-teal-400 truncate">
                        {verificationResult.verification?.block?.merkleRoot || 'N/A'}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/merkle-tree`}
                        className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                      >
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>Inspect Interactive Merkle Path Proof →</span>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
