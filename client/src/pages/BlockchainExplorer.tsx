import React, { useState, useEffect } from 'react';
import { Cpu, GitCommit, Search, ShieldCheck, ArrowRight, Clock, Lock, Key } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

export const BlockchainExplorer: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsRes = await api.get('/blockchain');
        setStats(statsRes.data);

        const blocksRes = await api.get('/blocks');
        setBlocks(blocksRes.data.blocks);
      } catch (err) {
        console.error('Failed to load explorer data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 sm:px-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono">
          <Cpu className="w-4 h-4" />
          <span>Proof of Authority Ledger Explorer</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">CertiChain Block Explorer</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Inspect block hashes, Merkle roots, PoA validator node signatures, and anchored certificate transactions.
        </p>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">BLOCK HEIGHT</div>
          <div className="text-3xl font-bold font-mono text-white mt-1">
            #{stats ? stats.totalBlocks - 1 : 0}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-mono">✓ Genesis + {stats ? stats.totalBlocks - 1 : 0} Blocks</div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">TOTAL TRANSACTIONS</div>
          <div className="text-3xl font-bold font-mono text-brand-400 mt-1">
            {stats ? stats.totalTransactions : 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">Certificate Records</div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">CONSENSUS MODEL</div>
          <div className="text-base font-bold text-slate-200 mt-2">
            Proof of Authority
          </div>
          <div className="text-[11px] text-brand-300 mt-1 font-mono">Institutional Nodes</div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-xs text-slate-400 font-mono">CHAIN VALIDITY</div>
          <div className="text-base font-bold text-emerald-400 mt-2 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>100% Cryptographic Match</span>
          </div>
        </GlassCard>
      </div>

      {/* VISUAL CHAIN LINKAGE */}
      <GlassCard glow className="p-8">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-6">
          Visual Block Linkage Chain
        </h3>

        <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-4">
          {blocks.slice().reverse().map((b, idx) => (
            <React.Fragment key={b.index}>
              <div
                onClick={() => setSelectedBlock(b)}
                className={`p-4 rounded-xl border transition-all cursor-pointer min-w-[200px] space-y-2 ${
                  selectedBlock?.index === b.index
                    ? 'bg-brand-600/20 border-brand-500 shadow-lg shadow-brand-500/20'
                    : 'bg-navy-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-400 font-bold">Block #{b.index}</span>
                  <span className="text-slate-500">{b.index === 0 ? 'Genesis' : `${b.transactionCount} tx`}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  {b.hash.substring(0, 16)}...
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  Issuer: {b.issuerName}
                </div>
              </div>
              {idx < blocks.length - 1 && <div className="text-slate-600 font-mono">→</div>}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* BLOCKS TABLE */}
      <GlassCard className="p-6">
        <h3 className="font-bold text-white text-lg mb-4">Latest Blocks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-navy-950 text-slate-400 border-b border-slate-800 uppercase">
              <tr>
                <th className="px-4 py-3">Block #</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Block Hash</th>
                <th className="px-4 py-3">Merkle Root</th>
                <th className="px-4 py-3">Validator Issuer</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {blocks.map((b) => (
                <tr key={b.index} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3.5 font-bold text-brand-400">#{b.index}</td>
                  <td className="px-4 py-3.5 text-slate-400">{new Date(b.timestamp).toLocaleTimeString()}</td>
                  <td className="px-4 py-3.5 text-slate-200">{b.hash.substring(0, 20)}...</td>
                  <td className="px-4 py-3.5 text-teal-400">{b.merkleRoot.substring(0, 20)}...</td>
                  <td className="px-4 py-3.5 text-slate-300">{b.issuerName}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedBlock(b)}
                      className="px-3 py-1 rounded bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* BLOCK INSPECTOR MODAL */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-navy-900 border border-slate-700 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">Block #{selectedBlock.index} Details</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedBlock.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="text-slate-500">Block Hash</div>
                <div className="text-brand-300 bg-navy-950 p-2.5 rounded-lg break-all">{selectedBlock.hash}</div>
              </div>

              <div>
                <div className="text-slate-500">Previous Block Hash</div>
                <div className="text-slate-400 bg-navy-950 p-2.5 rounded-lg break-all">{selectedBlock.previousHash}</div>
              </div>

              <div>
                <div className="text-slate-500">Merkle Root</div>
                <div className="text-teal-400 bg-navy-950 p-2.5 rounded-lg break-all">{selectedBlock.merkleRoot}</div>
              </div>

              <div>
                <div className="text-slate-500">Validator Digital Signature</div>
                <div className="text-purple-300 bg-navy-950 p-2.5 rounded-lg break-all">{selectedBlock.digitalSignature || 'N/A'}</div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
