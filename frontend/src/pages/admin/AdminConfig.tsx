import React, { useState } from 'react';
import { Sliders, Clock, Calendar, CheckCircle2, Save, Cpu, Sparkles } from 'lucide-react';

export const AdminConfig: React.FC = () => {
  const [priorityStrategy, setPriorityStrategy] = useState('ITIL_MATRIX');
  const [assignStrategy, setAssignStrategy] = useState('HYBRID_WEIGHTED');

  // Hybrid weights
  const [wLoad, setWLoad] = useState(0.35);
  const [wSkill, setWSkill] = useState(0.35);
  const [wMrt, setWMrt] = useState(0.15);
  const [wPriority, setWPriority] = useState(0.15);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            SLA Matrix, Strategies & Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fine-tune ITIL policy targets, dispatch algorithms, and academic exam window overrides.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{savedSuccess ? 'Changes Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Selectors & Weight Sliders */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Triage & Assignment Strategies</span>
          </h2>

          {/* Priority Strategy */}
          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              Priority Calculation Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ITIL_MATRIX', name: 'ITIL Matrix (Default)' },
                { id: 'PRODUCT_SCORE', name: 'Product Score (I × U)' },
                { id: 'WEIGHTED_SCORE', name: 'Weighted Composite' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPriorityStrategy(s.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                    priorityStrategy === s.id
                      ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Strategy */}
          <div className="space-y-2 text-xs pt-2">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              Technician Assignment Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'HYBRID_WEIGHTED', name: 'Hybrid Weighted (Recommended)' },
                { id: 'HUNGARIAN_BATCH', name: 'Hungarian Batch (Exact B&B)' },
                { id: 'LEAST_LOADED', name: 'Least Loaded Ratio' },
                { id: 'ROUND_ROBIN', name: 'Round Robin Shift' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAssignStrategy(s.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                    assignStrategy === s.id
                      ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders for Hybrid Weighted */}
          {assignStrategy === 'HYBRID_WEIGHTED' && (
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs animate-fadeIn">
              <div className="font-semibold text-slate-300">
                Hybrid Composite Weight Tuner (Must sum to 1.0)
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">w_load (Workload Capacity):</span>
                  <span className="font-mono text-cyan-300 font-bold">{wLoad.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wLoad}
                  onChange={(e) => setWLoad(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">w_skill (Skill Match Coverage):</span>
                  <span className="font-mono text-cyan-300 font-bold">{wSkill.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wSkill}
                  onChange={(e) => setWSkill(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">w_mrt (Mean Resolution Time):</span>
                  <span className="font-mono text-cyan-300 font-bold">{wMrt.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wMrt}
                  onChange={(e) => setWMrt(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4x4 SLA Policy Matrix */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>4×4 SLA Policy Matrix (Section 7)</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">16 Active Rules</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-[11px]">
                  <th className="p-2 text-left">Tier / Priority</th>
                  <th className="p-2">P1 Critical</th>
                  <th className="p-2">P2 High</th>
                  <th className="p-2">P3 Medium</th>
                  <th className="p-2">P4 Low</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                <tr>
                  <td className="p-2 text-left font-bold text-rose-300">T0 Core</td>
                  <td className="p-2 text-emerald-400">5m / 30m (24x7)</td>
                  <td className="p-2 text-slate-300">15m / 2h (24x7)</td>
                  <td className="p-2 text-slate-400">1h / 4h</td>
                  <td className="p-2 text-slate-500">4h / 12h</td>
                </tr>
                <tr>
                  <td className="p-2 text-left font-bold text-indigo-300">T1 Academic</td>
                  <td className="p-2 text-emerald-400">5m / 30m (24x7)</td>
                  <td className="p-2 text-slate-300">15m / 2h (24x7)</td>
                  <td className="p-2 text-slate-400">1h / 8h</td>
                  <td className="p-2 text-slate-500">4h / 24h</td>
                </tr>
                <tr>
                  <td className="p-2 text-left font-bold text-cyan-300">T2 Auxiliary</td>
                  <td className="p-2 text-emerald-400">10m / 1h</td>
                  <td className="p-2 text-slate-300">30m / 4h</td>
                  <td className="p-2 text-slate-400">2h / 16h</td>
                  <td className="p-2 text-slate-500">8h / 48h</td>
                </tr>
                <tr>
                  <td className="p-2 text-left font-bold text-slate-400">T3 Facilities</td>
                  <td className="p-2 text-emerald-400">15m / 2h</td>
                  <td className="p-2 text-slate-300">1h / 8h</td>
                  <td className="p-2 text-slate-400">4h / 24h</td>
                  <td className="p-2 text-slate-500">12h / 72h</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Academic Calendar / Exam Window Override */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-300 font-semibold">
              <Calendar className="w-4 h-4" />
              <span>Active Academic Calendar Window</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Exam Period Override Active: <code className="text-amber-200">MID-SEM-2026-OCT</code> applies $+1$ priority modifier to Nalanda LMS and AUGSD ERP incidents automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
