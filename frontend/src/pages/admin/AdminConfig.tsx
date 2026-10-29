import React, { useState } from 'react';
import { Sliders, Clock, Calendar, CheckCircle2, Save, Cpu, Sparkles } from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatusDot } from '../../components/ui/StatusDot';

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
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-mono font-medium tracking-wider uppercase mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Platform Policy & Engine Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F4F6]">
            SLA Matrix, Strategies & Campus Calendar
          </h1>
          <p className="text-xs text-[#9BA1AE] mt-1">
            Configure ITIL priority matrices, automated dispatch heuristics, and academic window calendar overrides.
          </p>
        </div>

        <ActionButton
          size="cta"
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          {savedSuccess ? 'Configuration Saved!' : 'Save Changes'}
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Engine & Dispatch Strategies */}
        <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#F3F4F6] uppercase">
            <Cpu className="w-4 h-4 text-[#38BDF8]" />
            <span>Triage & Assignment Algorithms</span>
          </div>

          {/* Priority Strategy Selection */}
          <div className="space-y-2 text-xs">
            <label className="block text-[#9BA1AE] font-mono uppercase text-[11px]">
              Priority Engine Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ITIL_MATRIX', label: 'ITIL 3x3 Matrix', desc: 'Standard ITIL impact × urgency table' },
                { id: 'PRODUCT_SCORE', label: 'Product Score', desc: 'Normalized product scalar metric' },
                { id: 'WEIGHTED_SCORE', label: 'Weighted Score', desc: 'Custom polynomial score formula' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPriorityStrategy(s.id)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer border ${
                    priorityStrategy === s.id
                      ? 'bg-[#1D212A] border-[#38BDF8] shadow-sm'
                      : 'bg-[#161920] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#F3F4F6]">{s.label}</div>
                  <div className="text-[11px] text-[#9BA1AE] mt-0.5 leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Strategy Selection */}
          <div className="space-y-2 text-xs pt-2 border-t border-white/[0.06]">
            <label className="block text-[#9BA1AE] font-mono uppercase text-[11px]">
              Technician Assignment Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'HUNGARIAN', label: 'Hungarian Batch', desc: 'Exact Kuhn-Munkres + multi-pass' },
                { id: 'LEAST_LOADED', label: 'Least Loaded', desc: 'Greedy min-point capacity reservation' },
                { id: 'ROUND_ROBIN', label: 'Round Robin', desc: 'Deterministic circular roster order' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAssignStrategy(s.id)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer border ${
                    assignStrategy === s.id
                      ? 'bg-[#1D212A] border-[#38BDF8] shadow-sm'
                      : 'bg-[#161920] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#F3F4F6]">{s.label}</div>
                  <div className="text-[11px] text-[#9BA1AE] mt-0.5 leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hybrid Weight Sliders */}
          <div className="space-y-3 pt-2 border-t border-white/[0.06] text-xs">
            <span className="block text-[#9BA1AE] font-mono uppercase text-[11px]">
              Hybrid Dispatch Weights
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Technician Load Weight (wLoad):</span>
                <span className="text-[#38BDF8]">{wLoad.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={wLoad}
                onChange={(e) => setWLoad(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#161920] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Skill Category Match (wSkill):</span>
                <span className="text-[#38BDF8]">{wSkill.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={wSkill}
                onChange={(e) => setWSkill(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#161920] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: 4x4 SLA Policy Matrix & Calendar Window */}
        <div className="space-y-6">
          {/* SLA Policy Targets Matrix */}
          <div className="surface-panel p-6 bg-[#101217] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#F3F4F6] uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <span>Priority SLA Targets</span>
              </span>
              <span className="text-[11px] font-mono text-[#9BA1AE]">Response / Resolution</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#8E95A5] font-mono text-[11px]">
                    <th className="py-2 px-3">Priority</th>
                    <th className="py-2 px-3">Response Target</th>
                    <th className="py-2 px-3">Resolution Target</th>
                    <th className="py-2 px-3">Calendar Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-3"><StatusBadge label="P1" variant="crit" isMono /></td>
                    <td className="py-2 px-3 text-rose-300">15 minutes</td>
                    <td className="py-2 px-3 text-rose-300 font-bold">4 hours</td>
                    <td className="py-2 px-3 text-[#9BA1AE]">24x7 Continuous</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><StatusBadge label="P2" variant="warn" isMono /></td>
                    <td className="py-2 px-3 text-amber-300">30 minutes</td>
                    <td className="py-2 px-3 text-amber-300">8 hours</td>
                    <td className="py-2 px-3 text-[#9BA1AE]">Business (09:00 - 18:00)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><StatusBadge label="P3" variant="neutral" isMono /></td>
                    <td className="py-2 px-3 text-slate-300">2 hours</td>
                    <td className="py-2 px-3 text-slate-300">24 hours</td>
                    <td className="py-2 px-3 text-[#9BA1AE]">Business (09:00 - 18:00)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><StatusBadge label="P4" variant="ok" isMono /></td>
                    <td className="py-2 px-3 text-emerald-300">4 hours</td>
                    <td className="py-2 px-3 text-emerald-300">72 hours</td>
                    <td className="py-2 px-3 text-[#9BA1AE]">Business (09:00 - 18:00)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Calendar Window Override Card */}
          <div className="surface-panel p-5 bg-[#101217] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#38BDF8] uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Academic Calendar Urgency Overrides</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                EXAM WINDOW ACTIVE
              </span>
            </div>

            <p className="text-xs text-[#9BA1AE] leading-relaxed">
              When an academic calendar window is active (Mid-Semesters, Compre Exams, or Course Registration), all Nalanda LMS and Campus SSO issues automatically receive a <strong>+1 Priority Bump</strong> (P2 → P1) in accordance with campus ITSM governance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
