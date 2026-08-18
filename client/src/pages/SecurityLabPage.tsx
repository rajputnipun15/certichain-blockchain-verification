import React, { useState, useEffect } from 'react';
import { FlaskConical, AlertTriangle, ShieldCheck, RefreshCw, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { computeStringSHA256 } from '../services/api';

export const SecurityLabPage: React.FC = () => {
  const [studentName, setStudentName] = useState('Nipun Kumar Kushwah');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [institution, setInstitution] = useState('Example University');
  const [issueDate, setIssueDate] = useState('18 August 2026');
  const [certificateId] = useState('CERT-2026-000001');

  // Baseline original payload
  const originalRaw = `${certificateId}:Nipun Kumar Kushwah:B.Tech Computer Science & Engineering:Example University:18 August 2026`;
  const [originalHash, setOriginalHash] = useState('');

  // Modified state hash
  const [currentRaw, setCurrentRaw] = useState('');
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    async function calcHashes() {
      const orig = await computeStringSHA256(originalRaw);
      setOriginalHash(orig);

      const raw = `${certificateId}:${studentName}:${course}:${institution}:${issueDate}`;
      setCurrentRaw(raw);
      const curr = await computeStringSHA256(raw);
      setCurrentHash(curr);
    }
    calcHashes();
  }, [studentName, course, institution, issueDate, certificateId]);

  const isTampered = originalHash !== currentHash;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
          <FlaskConical className="w-4 h-4" />
          <span>Educational Cryptographic Laboratory</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">
          Tamper Detection Security Lab
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Edit certificate parameters in real-time to see how SHA-256 cryptographic hashing immediately exposes document alteration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Interactive Field Manipulator */}
        <GlassCard glow className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Modify Certificate Metadata</h3>
            <button
              onClick={() => {
                setStudentName('Nipun Kumar Kushwah');
                setCourse('B.Tech Computer Science & Engineering');
                setInstitution('Example University');
                setIssueDate('18 August 2026');
              }}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Original</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400">Certificate ID (Immutable Anchor)</label>
              <input
                type="text"
                disabled
                value={certificateId}
                className="w-full mt-1 p-3 rounded-xl bg-navy-950/80 border border-slate-800 font-mono text-slate-400"
              />
            </div>

            <div>
              <label className="text-slate-200 font-semibold">Student Name (Try changing a character)</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-brand-500/40 text-white font-semibold focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-slate-200 font-semibold">Degree / Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-brand-500/40 text-white font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-200 font-semibold">Institution Name</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-brand-500/40 text-white font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-200 font-semibold">Issue Date</label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-brand-500/40 text-white font-semibold"
              />
            </div>
          </div>
        </GlassCard>

        {/* Right: Real-time SHA-256 Hash Comparison */}
        <GlassCard className="space-y-6">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
            SHA-256 Cryptographic Hash Comparison
          </h3>

          {/* Original Hash */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Anchored Blockchain Hash</div>
            <div className="font-mono text-xs text-emerald-400 bg-black/40 p-2.5 rounded-lg break-all">
              {originalHash}
            </div>
          </div>

          {/* Current Calculated Hash */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Recalculated Hash from Modified Input</div>
            <div className={`font-mono text-xs p-2.5 rounded-lg break-all ${isTampered ? 'text-rose-400 bg-rose-950/20 border border-rose-500/30' : 'text-emerald-400 bg-black/40'}`}>
              {currentHash}
            </div>
          </div>

          {/* VERIFICATION FEEDBACK BOX */}
          <div className="pt-4">
            {!isTampered ? (
              <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-lg font-bold text-white">✓ HASHES MATCH EXACTLY</div>
                <div className="text-xs text-slate-300">Document data is identical to the blockchain anchor.</div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-center space-y-2">
                <XCircle className="w-10 h-10 text-rose-400 mx-auto animate-pulse" />
                <div className="text-lg font-bold text-rose-300">❌ HASH MISMATCH DETECTED</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  "The uploaded document content no longer matches the hash anchored to the blockchain ledger. Verification strictly fails."
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
