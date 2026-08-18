import React, { useState, useEffect } from 'react';
import { Building2, Plus, AlertTriangle, ShieldCheck, CheckCircle2, FileText, Download, Trash2, Cpu, BarChart2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const InstitutionDashboard: React.FC = () => {
  const { user } = useAuth();

  const [certificates, setCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [grade, setGrade] = useState('');
  const [issueDate, setIssueDate] = useState('18 August 2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  // Revoke Modal
  const [revokeCertId, setRevokeCertId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const certsRes = await api.get('/certificates');
      setCertificates(certsRes.data.certificates);

      const statsRes = await api.get('/stats');
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !course) return;

    setIsSubmitting(true);
    setSuccessResult(null);

    try {
      const res = await api.post('/certificates', {
        studentName,
        studentId,
        course,
        grade,
        issueDate,
      });

      setSuccessResult(res.data);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      // Reset form & reload list
      setStudentName('');
      setStudentId('');
      setCourse('');
      setGrade('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to issue certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!revokeCertId || !revokeReason) return;
    setIsRevoking(true);

    try {
      await api.post(`/certificates/${revokeCertId}/revoke`, { reason: revokeReason });
      setRevokeCertId(null);
      setRevokeReason('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke certificate');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 sm:px-6">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-400">
            <Building2 className="w-4 h-4" />
            <span>Institution Enterprise Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            {user?.institution?.name || 'Example University'} Node Portal
          </h1>
        </div>

        <div className="flex items-center space-x-2 bg-navy-900 border border-slate-700 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>PoA Node Status: AUTHORIZED VALIDATOR</span>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">TOTAL ISSUED</div>
          <div className="text-3xl font-bold font-mono text-white mt-1">
            {stats ? stats.totalCertificates : certificates.length}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">ACTIVE CERTIFICATES</div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {stats ? stats.activeCertificates : certificates.filter(c => c.status === 'ACTIVE').length}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">REVOKED CREDENTIALS</div>
          <div className="text-3xl font-bold font-mono text-amber-400 mt-1">
            {stats ? stats.revokedCertificates : certificates.filter(c => c.status === 'REVOKED').length}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">VERIFICATION REQUESTS</div>
          <div className="text-3xl font-bold font-mono text-brand-400 mt-1">
            {stats ? stats.totalVerifications : 12}
          </div>
        </GlassCard>
      </div>

      {/* ISSUE CERTIFICATE FORM & SUCCESS DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow className="p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-brand-400" />
              <span>Issue & Anchor New Academic Certificate</span>
            </h3>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Nipun Kumar Kushwah"
                    className="w-full mt-1.5 p-3 rounded-xl bg-navy-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Student ID / Roll No</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-991"
                    className="w-full mt-1.5 p-3 rounded-xl bg-navy-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold">Degree / Qualification *</label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science & Engineering"
                    className="w-full mt-1.5 p-3 rounded-xl bg-navy-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Grade / Score / Honors</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. First Class with Distinction (9.4 CGPA)"
                    className="w-full mt-1.5 p-3 rounded-xl bg-navy-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold">Date of Issuance</label>
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-xs font-semibold"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? 'Generating SHA-256 & Mining Block...' : 'ISSUE CERTIFICATE & ANCHOR ON BLOCKCHAIN'}
                </button>
              </div>
            </form>
          </GlassCard>

          {/* SUCCESS MODAL / ANCHOR CONFIRMATION */}
          {successResult && (
            <GlassCard glow className="p-6 border-emerald-500/40 bg-emerald-950/20 space-y-4">
              <div className="flex items-center space-x-3 text-emerald-400">
                <CheckCircle2 className="w-8 h-8 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-white text-base">Certificate Successfully Anchored to Blockchain!</h4>
                  <p className="text-xs text-slate-300">Transaction verified and written into PoA Block #{successResult.blockchainRecord.blockNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <div className="text-slate-400">Certificate ID</div>
                  <div className="text-white font-bold">{successResult.certificate.certificateId}</div>
                </div>

                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                  <div className="text-slate-400">Transaction ID</div>
                  <div className="text-purple-300 truncate">{successResult.blockchainRecord.transactionId}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`/api/certificates/${successResult.certificate.certificateId}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PDF</span>
                </a>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Info Column */}
        <div>
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
              Issuance Protocol Specs
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero-Knowledge Storage:</strong> Student documents remain private. Only SHA-256 hashes are anchored on-chain.</span>
              </div>

              <div className="flex items-start space-x-2">
                <Cpu className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Ed25519 Key Signing:</strong> Payload is signed using institution's verified private key pair.</span>
              </div>

              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>QR Code Embed:</strong> Generated PDF includes embedded verification link `/verify/:id`.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* RECENT CERTIFICATES TABLE */}
      <GlassCard className="p-6">
        <h3 className="font-bold text-white text-lg mb-4">Issued Certificates Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-navy-950 text-slate-400 border-b border-slate-800 uppercase">
              <tr>
                <th className="px-4 py-3">Certificate ID</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Course / Degree</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Block #</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3.5 font-bold text-brand-400">{cert.certificateId}</td>
                  <td className="px-4 py-3.5 text-white font-semibold">{cert.studentName}</td>
                  <td className="px-4 py-3.5 text-slate-300">{cert.course}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={cert.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">#{cert.blockNumber || '1'}</td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <a
                      href={`/api/certificates/${cert.certificateId}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      PDF
                    </a>
                    {cert.status === 'ACTIVE' && (
                      <button
                        onClick={() => setRevokeCertId(cert.certificateId)}
                        className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* REVOCATION MODAL */}
      {revokeCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-navy-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Revoke Certificate ID</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Revoking credential <strong className="text-white">{revokeCertId}</strong> will anchor an immutable <code>REVOKE</code> transaction on the blockchain. Historical issuance remains on-chain for audit.
            </p>

            <div>
              <label className="text-xs text-slate-300 font-semibold">Administrative Reason *</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Administrative revocation due to academic integrity investigation"
                className="w-full mt-1.5 p-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-xs"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRevokeCertId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeCertificate}
                disabled={isRevoking || !revokeReason}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                {isRevoking ? 'Anchoring Revocation...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
