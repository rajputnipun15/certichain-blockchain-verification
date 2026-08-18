import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Cpu, Lock, GitCommit, FileCheck, CheckCircle2, Award, Zap, Building2, UserCheck, Eye } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/stats');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load stats');
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Institutional Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/30 text-xs font-mono text-brand-300 mb-8 shadow-lg shadow-brand-500/10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Proof of Authority Institutional Blockchain Engine</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.15]"
          >
            CERTICHAIN <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              "Trust Every Credential."
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Blockchain-powered academic certificate issuance and instant tamper-evident public verification. Eliminating diploma fraud through SHA-256 hash anchoring and Merkle tree proofs.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/verify"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 transition-all flex items-center justify-center space-x-2 text-base group"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>VERIFY A CERTIFICATE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard/institution"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700/80 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <Building2 className="w-5 h-5 text-brand-400" />
              <span>ISSUE A CERTIFICATE</span>
            </Link>

            <Link
              to="/demo"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>3-Min Interview Demo</span>
            </Link>
          </motion.div>

          {/* ANIMATED PIPELINE VISUALIZATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <GlassCard glow className="p-8 border-brand-500/40">
              <div className="text-left text-xs font-mono text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                <span>Cryptographic Verification Pipeline</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ledger Active</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800">
                  <Award className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">1. Certificate</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">PDF & Metadata</div>
                </div>

                <div className="hidden md:flex justify-center text-slate-600">→</div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800">
                  <Lock className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">2. SHA-256 Hash</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">`a665a4592...`</div>
                </div>

                <div className="hidden md:flex justify-center text-slate-600">→</div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800">
                  <GitCommit className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">3. Merkle Anchor</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">PoA Block Node</div>
                </div>
              </div>

              {/* Status Output */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Instant Verification Result</div>
                    <div className="text-xs text-slate-400">Authentic, Immutable, Digital Signature Verified</div>
                  </div>
                </div>

                <Link
                  to="/security-lab"
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition-colors flex items-center space-x-1"
                >
                  <span>Test Tamper Detection Lab →</span>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* LIVE STATS COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <GlassCard className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {stats ? stats.totalCertificates : '3'}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-2">Certificates Anchored</div>
          </GlassCard>

          <GlassCard className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-400 font-mono">
              {stats ? stats.totalBlocks : '4'}
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-2">Blockchain Height</div>
          </GlassCard>

          <GlassCard className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
              100%
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-2">Chain Integrity</div>
          </GlassCard>

          <GlassCard className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono">
              0.00s
            </div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-2">Verification Latency</div>
          </GlassCard>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono text-brand-400 uppercase tracking-widest mb-3">Institutional Ledger Architecture</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">How CertiChain Guarantees Authenticity</h3>
          <p className="text-slate-400 mt-4">
            Traditional paper degrees and PDF files can be edited in seconds. CertiChain creates an immutable cryptographic anchor on a Proof of Authority blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xl font-mono">
              01
            </div>
            <h4 className="text-xl font-bold text-white">Document Hashing</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              When an institution issues a degree, CertiChain computes a SHA-256 cryptographic hash of the raw certificate document bytes and student metadata.
            </p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xl font-mono">
              02
            </div>
            <h4 className="text-xl font-bold text-white">Digital Ed25519 Signature</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              The university signs the certificate record using its verified private key. The payload is aggregated into a Merkle Tree and anchored into a new PoA block.
            </p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold text-xl font-mono">
              03
            </div>
            <h4 className="text-xl font-bold text-white">Instant Verification</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Recruiters or public verifiers enter the Certificate ID or upload the PDF. CertiChain recalculates the hash and checks it against the block ledger in real-time.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* WHY BLOCKCHAIN COMPARISON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard glow className="p-8 sm:p-12 border-brand-500/30">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Why Blockchain for Credentials?</h3>
            <p className="text-slate-400 text-sm mt-2">
              Comparing legacy credential verification vs CertiChain cryptographic ledger.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-navy-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Feature</th>
                  <th className="px-6 py-4 text-rose-400">Traditional PDF / Paper</th>
                  <th className="px-6 py-4 text-emerald-400">CertiChain PoA Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Tamper Protection</td>
                  <td className="px-6 py-4 text-slate-400">❌ Easy to Photoshop or alter text</td>
                  <td className="px-6 py-4 text-emerald-300 font-semibold">✓ Impossible (Hash mismatch instantly detected)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Verification Speed</td>
                  <td className="px-6 py-4 text-slate-400">❌ Weeks via manual university phone/email</td>
                  <td className="px-6 py-4 text-emerald-300 font-semibold">✓ Instant (&lt; 100ms algorithmic verification)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Revocation Auditing</td>
                  <td className="px-6 py-4 text-slate-400">❌ Paper degrees cannot be recalled</td>
                  <td className="px-6 py-4 text-emerald-300 font-semibold">✓ Immutable revocation record anchored on-chain</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Cryptographic Proof</td>
                  <td className="px-6 py-4 text-slate-400">❌ None (Visual seals only)</td>
                  <td className="px-6 py-4 text-emerald-300 font-semibold">✓ Ed25519 Signatures & Merkle Tree Inclusion Proofs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-navy-900 to-indigo-950 p-12 border border-brand-500/30 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl font-extrabold text-white">Ready to test credential verification?</h3>
            <p className="text-slate-300 text-sm">
              Try verifying our sample certificates (`CERT-2026-000001` or `CERT-2026-000003`) or run the live Tamper Detection Laboratory.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                to="/verify/CERT-2026-000001"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors text-sm shadow-lg shadow-brand-600/30"
              >
                Verify Sample Cert #1
              </Link>
              <Link
                to="/security-lab"
                className="px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 transition-colors text-sm"
              >
                Open Tamper Detection Lab
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
