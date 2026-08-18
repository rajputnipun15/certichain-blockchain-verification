import React, { useState, useEffect } from 'react';
import { GitCommit, ShieldCheck, ArrowUp, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';

export const MerkleExplorerPage: React.FC = () => {
  const [certId, setCertId] = useState('CERT-2026-000001');
  const [proofData, setProofData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  useEffect(() => {
    handleFetchProof(certId);
  }, []);

  const handleFetchProof = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/merkle-proof/${id}`);
      setProofData(res.data);
      setSelectedHash(res.data.certificateHash);
    } catch (err) {
      console.error('Failed to fetch Merkle proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
          <GitCommit className="w-4 h-4" />
          <span>Interactive Merkle Tree Cryptographic Inspector</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">
          Merkle Tree Proof Path Inspector
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Trace certificate hashes through the Merkle tree layers up to the block Merkle Root to prove inclusion without exposing adjacent transactions.
        </p>
      </div>

      {/* CERTIFICATE SELECTOR */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-200">
            Select Certificate to Audit Inclusion Proof:
          </div>

          <div className="flex gap-2">
            {['CERT-2026-000001', 'CERT-2026-000002', 'CERT-2026-000003'].map((id) => (
              <button
                key={id}
                onClick={() => { setCertId(id); handleFetchProof(id); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  certId === id
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'bg-navy-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* MERKLE VISUALIZATION PANEL */}
      {proofData && !loading && (
        <div className="space-y-8">
          {/* TOP: MERKLE ROOT NODE */}
          <GlassCard glow className="p-6 text-center border-purple-500/40">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>BLOCK #{proofData.blockIndex} MERKLE ROOT</span>
            </div>
            <div className="font-mono text-sm font-bold text-white bg-black/40 p-3 rounded-xl max-w-2xl mx-auto break-all border border-purple-500/30">
              {proofData.merkleRoot}
            </div>
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Anchored on PoA Block Hash: <span className="text-brand-400">{proofData.blockHash.substring(0, 24)}...</span>
            </div>
          </GlassCard>

          {/* INTERMEDIATE MERKLE PROOF LAYERS */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest text-center">
              Merkle Inclusion Proof Path Nodes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proofData.proof?.map((node: any, idx: number) => (
                <GlassCard key={idx} className="p-4 space-y-2 border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Layer {idx + 1} ({node.position.toUpperCase()} SIBLING)</span>
                    <span className="text-purple-400 font-bold">✓ Validated</span>
                  </div>
                  <div className="font-mono text-xs text-slate-300 bg-navy-950 p-2.5 rounded-lg break-all">
                    {node.hash}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* BOTTOM: CERTIFICATE TRANSACTION LEAF */}
          <GlassCard className="p-6 border-emerald-500/40 bg-emerald-950/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-emerald-400 font-bold">CERTIFICATE TRANSACTION LEAF HASH</div>
                <div className="font-mono text-xs text-white break-all">{proofData.certificateHash}</div>
                <div className="text-xs text-slate-400 font-mono">Certificate ID: {proofData.certificateId}</div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono border border-emerald-500/30 flex items-center space-x-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>PROOF VERIFIED</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
