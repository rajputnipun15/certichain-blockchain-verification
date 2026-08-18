import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Cpu, Lock, GitCommit, FileText, Zap } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const DemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoCertId, setDemoCertId] = useState('CERT-DEMO-2026-99');
  const [studentName, setStudentName] = useState('Nipun Kumar Kushwah');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [hash, setHash] = useState('a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');
  const [tamperedHash, setTamperedHash] = useState('f999999990422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27xyz');
  const [signature, setSignature] = useState('SIG-ED25519-92ab837f190248a82f019a823');
  const [blockIndex, setBlockIndex] = useState(1);
  const [merkleRoot, setMerkleRoot] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [txId, setTxId] = useState('TX-8921A-DEMO');
  const [status, setStatus] = useState<'IDLE' | 'VALID' | 'TAMPERED' | 'REVOKED'>('IDLE');
  const [loading, setLoading] = useState(false);

  const steps = [
    { title: '1. Authenticate Institution Node', desc: 'Login as Example University Admin' },
    { title: '2. Generate Certificate Data', desc: 'Create degree details for student Nipun' },
    { title: '3. Calculate SHA-256 Hash', desc: 'Compute zero-knowledge document hash' },
    { title: '4. Digital Ed25519 Signature', desc: 'Sign hash with university private key' },
    { title: '5. Anchor to PoA Block', desc: 'Mine transaction into new block & calculate Merkle Root' },
    { title: '6. Public Verification', desc: 'Verify valid certificate against blockchain ledger' },
    { title: '7. Tamper Detection Test', desc: 'Simulate altered PDF byte hash and observe failure' },
    { title: '8. Revocation Audit', desc: 'Anchor revocation transaction on-chain & check status' },
  ];

  const handleNextStep = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (currentStep < steps.length - 1) {
        const next = currentStep + 1;
        setCurrentStep(next);

        if (next === 5) {
          setStatus('VALID');
          confetti({ particleCount: 60, spread: 60 });
        } else if (next === 6) {
          setStatus('TAMPERED');
        } else if (next === 7) {
          setStatus('REVOKED');
        }
      }
    }, 400);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setStatus('IDLE');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <Zap className="w-4 h-4" />
          <span>Interactive Live System Demonstration</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">
          CertiChain Live Demonstration
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Walk through the full end-to-end lifecycle of certificate creation, cryptographic hashing, block mining, public verification, tamper detection, and revocation.
        </p>
      </div>

      {/* STEPPER NAVIGATION */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentStep(idx);
              if (idx < 5) setStatus('IDLE');
              else if (idx === 5) setStatus('VALID');
              else if (idx === 6) setStatus('TAMPERED');
              else if (idx === 7) setStatus('REVOKED');
            }}
            className={`p-2.5 rounded-xl text-left border transition-all ${
              currentStep === idx
                ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-md shadow-brand-500/10'
                : idx < currentStep
                ? 'bg-navy-950 border-emerald-500/40 text-emerald-400'
                : 'bg-navy-950/50 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider">Step 0{idx + 1}</div>
            <div className="text-xs font-semibold truncate mt-0.5">{step.title.split('. ')[1]}</div>
          </button>
        ))}
      </div>

      {/* MAIN DEMO BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Step Execution Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow className="p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold font-mono">
                  0{currentStep + 1}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">{steps[currentStep].title}</h3>
                  <p className="text-xs text-slate-400">{steps[currentStep].desc}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>
              </div>
            </div>

            {/* STEP 1 & 2: Certificate Form */}
            {currentStep <= 1 && (
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-mono text-brand-400">INSTITUTION AUTHENTICATED: Example University (UNIV-01)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400">Student Name</label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg bg-navy-900 border border-slate-700 text-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Degree / Course</label>
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg bg-navy-900 border border-slate-700 text-white text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 & 4: Cryptographic Hashing */}
            {currentStep >= 2 && currentStep <= 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Calculated SHA-256 Document Hash</div>
                  <div className="font-mono text-xs text-emerald-400 bg-black/40 p-2.5 rounded-lg break-all">
                    {hash}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Digital Ed25519 Signature (Signed by University Key)</div>
                  <div className="font-mono text-xs text-purple-300 bg-black/40 p-2.5 rounded-lg break-all">
                    {signature}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Block Anchoring */}
            {currentStep >= 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Anchored Block Index</div>
                    <div className="text-xl font-bold font-mono text-brand-400">Block #{blockIndex}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Merkle Root</div>
                    <div className="text-xs font-mono text-teal-400 truncate mt-1">{merkleRoot}</div>
                  </div>
                </div>
              </div>
            )}

            {/* DEMO VERIFICATION DISPLAY */}
            {currentStep >= 5 && (
              <div className="pt-4 border-t border-slate-800">
                {status === 'VALID' && (
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                    <div className="text-xl font-extrabold text-white">✓ CERTIFICATE VERIFIED & AUTHENTIC</div>
                    <div className="text-xs text-slate-300">
                      Document hash matches blockchain record exactly. Ed25519 signature verified.
                    </div>
                  </div>
                )}

                {status === 'TAMPERED' && (
                  <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/40 text-center space-y-3">
                    <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                    <div className="text-xl font-extrabold text-rose-300">❌ CERTIFICATE INVALID / TAMPERED</div>
                    <div className="text-xs text-slate-300">
                      Hash Mismatch! Uploaded document hash (`{tamperedHash.substring(0, 16)}...`) does not match block anchor.
                    </div>
                  </div>
                )}

                {status === 'REVOKED' && (
                  <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-center space-y-3">
                    <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
                    <div className="text-xl font-extrabold text-amber-300">⚠ CERTIFICATE REVOKED</div>
                    <div className="text-xs text-slate-300">
                      Administrative Revocation Transaction anchored in Block #4. Degree is invalid.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={loading || currentStep >= steps.length - 1}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{currentStep >= steps.length - 1 ? 'Demo Completed' : 'Proceed to Next Demo Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Col: Live Blockchain Ledger Panel */}
        <div>
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center justify-between pb-3 border-b border-slate-800">
              <span>Live Ledger Node State</span>
              <Cpu className="w-4 h-4 text-brand-400" />
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">CONSENSUS MODEL</div>
                <div className="text-brand-300 font-bold">Proof of Authority (PoA)</div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">VALIDATOR NODE</div>
                <div className="text-slate-200">Example University (UNIV-01)</div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">CURRENT BLOCK HASH</div>
                <div className="text-purple-300 truncate">92ab837f190248a82f019a823...</div>
              </div>

              <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">MERKLE ROOT</div>
                <div className="text-teal-400 truncate">{merkleRoot}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
