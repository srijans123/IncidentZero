import React, { useState } from 'react';
import { Sliders, Clock, Calendar, CheckCircle2, Save, Cpu, Sparkles } from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';
import { sound } from '../../services/sound';

export const AdminConfig: React.FC = () => {
  const [priorityStrategy, setPriorityStrategy] = useState('ITIL_MATRIX');
  const [assignStrategy, setAssignStrategy] = useState('HUNGARIAN');

  // Hybrid weights
  const [wLoad, setWLoad] = useState(0.35);
  const [wSkill, setWSkill] = useState(0.35);
  const [wMrt, setWMrt] = useState(0.15);
  const [wPriority, setWPriority] = useState(0.15);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    sound.win();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--sky)] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 bg-[var(--sky)] border border-[var(--line)] inline-block"></span>
            <span>POLICY & ENGINE CONFIG // RULES COMPILER</span>
          </div>
          <h1 className="text-2xl font-bold font-pixel tracking-wide text-[var(--fg)]">
            SLA Matrix, Strategies & Campus Calendar
          </h1>
          <p className="text-xs font-pixel text-[var(--soft)] mt-1">
            Configure ITIL priority matrices, automated Kuhn-Munkres dispatch weights, and academic exam calendar overrides.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn g"
        >
          <Save className="w-4 h-4 inline mr-1" />
          {savedSuccess ? 'CONFIGURATION SAVED!' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-pixel">
        {/* Left Column: Engine & Dispatch Strategies */}
        <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--fg)] uppercase">
            <Cpu className="w-4 h-4 text-[var(--sky)]" />
            <span>Triage & Assignment Algorithms</span>
          </div>

          {/* Priority Strategy Selection */}
          <div className="space-y-2 text-xs">
            <label className="block text-[var(--soft)] font-mono uppercase text-[11px] font-bold">
              Priority Engine Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'ITIL_MATRIX', label: 'ITIL 3x3 Matrix', desc: 'Standard ITIL impact × urgency table' },
                { id: 'PRODUCT_SCORE', label: 'Product Score', desc: 'Normalized product scalar metric' },
                { id: 'WEIGHTED_SCORE', label: 'Weighted Score', desc: 'Custom polynomial score formula' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sound.pick();
                    setPriorityStrategy(s.id);
                  }}
                  className={`p-3 text-left transition-all cursor-pointer border-[2px] ${
                    priorityStrategy === s.id
                      ? 'bg-[var(--bg)] border-[var(--sky)] shadow-[3px_3px_0_var(--shadow-col)] scale-102'
                      : 'bg-[var(--card)] border-[var(--line)] hover:bg-[var(--bg)]/50'
                  }`}
                >
                  <div className="font-bold text-xs text-[var(--fg)]">{s.label}</div>
                  <div className="text-[10px] text-[var(--soft)] mt-0.5 leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Strategy Selection */}
          <div className="space-y-2 text-xs pt-3 border-t-2 border-[var(--line)]/30">
            <label className="block text-[var(--soft)] font-mono uppercase text-[11px] font-bold">
              Technician Assignment Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'HUNGARIAN', label: 'Hungarian Batch', desc: 'Exact Kuhn-Munkres bipartite match' },
                { id: 'LEAST_LOADED', label: 'Least Loaded', desc: 'Greedy min-point capacity reservation' },
                { id: 'ROUND_ROBIN', label: 'Round Robin', desc: 'Deterministic circular roster order' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sound.pick();
                    setAssignStrategy(s.id);
                  }}
                  className={`p-3 text-left transition-all cursor-pointer border-[2px] ${
                    assignStrategy === s.id
                      ? 'bg-[var(--bg)] border-[var(--ribbon)] shadow-[3px_3px_0_var(--shadow-col)] scale-102'
                      : 'bg-[var(--card)] border-[var(--line)] hover:bg-[var(--bg)]/50'
                  }`}
                >
                  <div className="font-bold text-xs text-[var(--fg)]">{s.label}</div>
                  <div className="text-[10px] text-[var(--soft)] mt-0.5 leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hybrid Weight Sliders */}
          <div className="space-y-4 pt-3 border-t-2 border-[var(--line)]/30 text-xs">
            <span className="block text-[var(--soft)] font-mono uppercase text-[11px] font-bold">
              Hybrid Kuhn-Munkres Dispatch Weights
            </span>
            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--fg)] font-bold">Technician Load Weight (wLoad):</span>
                  <span className="chip y text-[10px]">{wLoad.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={wLoad}
                  onChange={(e) => {
                    sound.blip();
                    setWLoad(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-[var(--bg)] border border-[var(--line)] rounded appearance-none cursor-pointer accent-[#7C5CFF]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--fg)] font-bold">Skill Category Match (wSkill):</span>
                  <span className="chip text-[10px]">{wSkill.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={wSkill}
                  onChange={(e) => {
                    sound.blip();
                    setWSkill(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-[var(--bg)] border border-[var(--line)] rounded appearance-none cursor-pointer accent-[#59C9F5]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--fg)] font-bold">Mean Resolution Time (wMrt):</span>
                  <span className="chip text-[10px]">{wMrt.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={wMrt}
                  onChange={(e) => {
                    sound.blip();
                    setWMrt(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-[var(--bg)] border border-[var(--line)] rounded appearance-none cursor-pointer accent-[#43D17A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4x4 SLA Policy Matrix & Calendar Window */}
        <div className="space-y-6">
          {/* SLA Policy Targets Matrix */}
          <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[var(--fg)] uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--ribbon)]" />
                <span>Priority SLA Hearts & Targets</span>
              </span>
              <span className="text-[11px] font-mono text-[var(--soft)]">Response / Resolution</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-pixel">
                <thead>
                  <tr className="border-b-2 border-[var(--line)] bg-[var(--bg)] text-[var(--soft)] font-mono text-[11px]">
                    <th className="py-2.5 px-3 font-bold">Priority</th>
                    <th className="py-2.5 px-3 font-bold">Response Target</th>
                    <th className="py-2.5 px-3 font-bold">Resolution Target</th>
                    <th className="py-2.5 px-3 font-bold">Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]/20 font-mono text-[11px]">
                  <tr className="hover:bg-[var(--bg)]/40">
                    <td className="py-2.5 px-3"><span className="chip r text-[10px]">P1 CRITICAL</span></td>
                    <td className="py-2.5 px-3 font-bold text-red-600">15 minutes</td>
                    <td className="py-2.5 px-3 font-bold text-red-600">4 hours</td>
                    <td className="py-2.5 px-3 text-[var(--soft)]">24x7 Continuous</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/40">
                    <td className="py-2.5 px-3"><span className="chip text-[10px] bg-amber-200">P2 HIGH</span></td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">30 minutes</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">8 hours</td>
                    <td className="py-2.5 px-3 text-[var(--soft)]">Campus (09:00 - 18:00)</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/40">
                    <td className="py-2.5 px-3"><span className="chip text-[10px]">P3 MEDIUM</span></td>
                    <td className="py-2.5 px-3 text-[var(--fg)]">2 hours</td>
                    <td className="py-2.5 px-3 text-[var(--fg)]">24 hours</td>
                    <td className="py-2.5 px-3 text-[var(--soft)]">Campus (09:00 - 18:00)</td>
                  </tr>
                  <tr className="hover:bg-[var(--bg)]/40">
                    <td className="py-2.5 px-3"><span className="chip g text-[10px]">P4 LOW</span></td>
                    <td className="py-2.5 px-3 text-emerald-700">4 hours</td>
                    <td className="py-2.5 px-3 text-emerald-700">72 hours</td>
                    <td className="py-2.5 px-3 text-[var(--soft)]">Campus (09:00 - 18:00)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Calendar Window Override Card */}
          <div className="bg-[var(--card)] border-[3px] border-[var(--line)] p-5 shadow-[5px_5px_0_var(--shadow-col)] space-y-3 font-pixel">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs font-bold text-[var(--sky)] uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Academic Calendar Urgency Overrides</span>
              </span>
              <span className="chip g text-[10px] font-mono">
                EXAM WINDOW ACTIVE (BPHC)
              </span>
            </div>

            <p className="text-xs text-[var(--soft)] leading-relaxed">
              When an academic calendar window is active (Mid-Semesters, Comprehensive Exams, or Course Registration), all Nalanda LMS and Campus SSO issues automatically receive a <strong>+1 Priority Bump</strong> (P2 → P1) in accordance with campus ITSM governance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
