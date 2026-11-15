import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { IntakeAdvice } from '../../types';
import { sound } from '../../services/sound';
import { PixelIcon } from '../../services/pixelSprites';
import {
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Send,
  ChevronLeft,
} from 'lucide-react';
import { ActionButton } from '../../components/ui/ActionButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';

interface PortalReportProps {
  onBack: () => void;
  onSubmitSuccess: (incidentId: string) => void;
}

export const PortalReport: React.FC<PortalReportProps> = ({ onBack, onSubmitSuccess }) => {
  const { showError, showSuccess } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // A24: Critical = 3, High = 2, Standard = 1, default = 1
  const [urgency, setUrgency] = useState<number>(1);
  const [serviceCode, setServiceCode] = useState<string>('');
  const [services, setServices] = useState<{ id: string; code: string; name: string; tier: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advice, setAdvice] = useState<IntakeAdvice | null>(null);
  const [deflected, setDeflected] = useState(false);
  const [touched, setTouched] = useState({ title: false, description: false });

  const debounceTimerRef = useRef<any>(null);

  // Fetch services list for dropdown
  useEffect(() => {
    api.services.list()
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch((err) => console.error('Failed to load services', err));
  }, []);

  // Sync copilot suggestion with service dropdown if not manually set
  useEffect(() => {
    if (advice?.suggestedService && !serviceCode) {
      setServiceCode(advice.suggestedService);
    }
  }, [advice?.suggestedService, serviceCode]);

  // Validation
  const isTitleValid = title.trim().length >= 5 && title.trim().length <= 200;
  const isDescriptionValid = description.trim().length >= 10 && description.trim().length <= 4000;
  const isFormValid = isTitleValid && isDescriptionValid;

  // Web Speech API Voice Recognition
  const startVoiceInput = () => {
    sound.blip();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError({ message: 'Web Speech API is not supported in this browser. Please type your issue.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      if (!title) {
        setTitle(speechText);
      } else {
        setDescription((prev) => (prev ? prev + ' ' + speechText : speechText));
      }
      setIsRecording(false);
      sound.pick();
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  // Real-time AI Copilot Advice on input change
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!title && !description) {
      setAdvice(null);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsAdviceLoading(true);
      try {
        const res = await api.intake.getAdvice({
          title: title || 'Campus IT Issue',
          description: description || title,
        });
        setAdvice(res);
      } catch {
        // No fabricated fallback per brief A6
        setAdvice(null);
      } finally {
        setIsAdviceLoading(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimerRef.current);
  }, [title, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, description: true });

    if (!isFormValid) {
      sound.err();
      showError({ message: 'Please fix validation errors before submitting.' });
      return;
    }

    sound.slot();
    try {
      setIsSubmitting(true);
      const res = await api.incidents.create({
        title: title.trim(),
        description: description.trim(),
        serviceCode: serviceCode || advice?.suggestedService || undefined,
        urgency: urgency,
      });

      if (res && res.id) {
        sound.win();
        showSuccess(`Incident ${res.number || res.id} reported successfully!`);
        onSubmitSuccess(res.id);
      }
    } catch (err) {
      console.error('Failed to submit incident', err);
      sound.err();
      showError(err, 'Error creating incident. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between">
        <ActionButton
          size="standard"
          variant="secondary"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => {
            sound.blip();
            onBack();
          }}
        >
          Back to Incident List
        </ActionButton>
        <span className="text-xs font-mono font-bold text-[var(--soft)]">
          STAGE: INTAKE COPILOT & TRIAGE
        </span>
      </div>

      {deflected ? (
        <div className="pixel-card-offset p-8 text-center max-w-xl mx-auto space-y-4" style={{ '--b': '#43D17A' } as any}>
          <div className="w-16 h-16 bg-[#43D17A] border-[3px] border-[#1B1530] text-[#1B1530] flex items-center justify-center mx-auto shadow-[4px_4px_0_#1B1530]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--fg)]">Self-Service Resolution Confirmed!</h2>
          <p className="text-sm text-[var(--soft)] font-mono">
            Awesome! The knowledge base solution resolved your issue without requiring a technician ticket.
          </p>
          <div className="pt-4">
            <ActionButton
              size="standard"
              variant="primary"
              onClick={() => {
                sound.pick();
                onBack();
              }}
            >
              Return to Campus Desk
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="pixel-panel p-4 bg-[var(--card)] border-[3px] border-[var(--line)] shadow-[4px_4px_0_var(--shadow-col)]">
              <div className="flex items-center gap-2 mb-1">
                <PixelIcon name="ticket" scale={1.8} />
                <h1 className="text-lg font-bold text-[var(--fg)]">Report a Campus IT Issue</h1>
              </div>
              <p className="text-xs text-[var(--soft)] font-mono">
                Submit an incident ticket to Campus IT. Our triage copilot will analyze duplicates and suggest instant fixes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title Field + Voice Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                    Incident Title / Summary *
                  </label>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-mono font-bold ${title.length > 200 || (title.length > 0 && title.length < 5) ? 'text-[#FF4D3D]' : 'text-[var(--soft)]'}`}>
                      {title.length}/200
                    </span>
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className={`btn sm ${isRecording ? 'r animate-pulse' : 'w'} flex items-center gap-1`}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#FF4D3D]" />}
                      <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cannot open Moodle quiz, login keeps timing out"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                  className="w-full h-11 px-3 text-xs sm:text-sm font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none"
                />
                {touched.title && !isTitleValid && (
                  <p className="text-xs font-mono font-bold text-[#FF4D3D]">
                    Title must be between 5 and 200 characters.
                  </p>
                )}
              </div>

              {/* Affected Service Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                    Affected Service
                  </label>
                  {advice?.suggestedService && (
                    <span className="text-[11px] font-mono text-[#59C9F5] font-bold">
                      Copilot suggests: {advice.suggestedService}
                    </span>
                  )}
                </div>
                <select
                  value={serviceCode}
                  onChange={(e) => {
                    sound.pick();
                    setServiceCode(e.target.value);
                  }}
                  className="w-full h-11 px-3 text-xs sm:text-sm font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none"
                >
                  <option value="">-- Auto-detect or select affected service --</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code}: {s.name} ({s.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                    Detailed Description *
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${description.length > 4000 || (description.length > 0 && description.length < 10) ? 'text-[#FF4D3D]' : 'text-[var(--soft)]'}`}>
                    {description.length}/4000
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Provide error codes, hostel room/bhawan, or steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                  className="w-full p-3 text-xs sm:text-sm font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none resize-none"
                />
                {touched.description && !isDescriptionValid && (
                  <p className="text-xs font-mono font-bold text-[#FF4D3D]">
                    Description must be between 10 and 4000 characters.
                  </p>
                )}
              </div>

              {/* Urgency Selector (A24: Critical = 3, High = 2, Standard = 1) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                  Self-Reported Urgency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { val: 1, label: 'Standard', desc: 'Routine inquiry or minor glitch', col: 'bg-[#FFD84D] text-[#1B1530]' },
                    { val: 2, label: 'High Priority', desc: 'Hostel wing or lab blocked', col: 'bg-[#FF9F43] text-[#1B1530]' },
                    { val: 3, label: 'Critical / Exam Outage', desc: 'Active test or grading impacted', col: 'bg-[#FF4D3D] text-[#FFF8DC]' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        sound.blip();
                        setUrgency(opt.val);
                      }}
                      className={`p-3 border-[3px] border-[var(--line)] text-left cursor-pointer transition-transform hover:-translate-y-0.5 ${
                        urgency === opt.val
                          ? `${opt.col} shadow-[4px_4px_0_var(--shadow-col)] -translate-y-0.5`
                          : 'bg-[var(--card)] text-[var(--fg)]'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[11px] opacity-80 mt-1 leading-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-[var(--line)]">
                <ActionButton
                  size="standard"
                  variant="outline"
                  onClick={() => {
                    sound.blip();
                    onBack();
                  }}
                  type="button"
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  size="cta"
                  variant="primary"
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Incident Report
                </ActionButton>
              </div>
            </form>
          </div>

          {/* Copilot Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="pixel-panel p-4 bg-[var(--card)] border-[3px] border-[var(--line)] shadow-[4px_4px_0_var(--shadow-col)]">
              <div className="flex items-center justify-between border-b-2 border-[var(--line)] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD84D]" />
                  <span className="font-bold font-mono text-xs uppercase tracking-wider text-[var(--fg)]">
                    Intake Copilot
                  </span>
                </div>
                {isAdviceLoading && (
                  <span className="text-[11px] font-mono text-[var(--soft)] animate-pulse">
                    Analyzing...
                  </span>
                )}
              </div>

              {!title && !description ? (
                <div className="text-center py-8 text-[var(--soft)] font-mono text-xs space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                  <p>Type a summary to activate automated duplicate triage and deflection.</p>
                </div>
              ) : advice ? (
                <div className="space-y-4">
                  {/* Category & Service Pill */}
                  <div className="p-3 bg-white/40 border-2 border-[var(--line)] space-y-2">
                    <div className="text-[11px] font-bold font-mono text-[var(--soft)] uppercase">
                      Suggested Service & Category
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#FFD84D] text-[#1B1530] font-mono text-xs font-bold border border-[#1B1530]">
                        {advice.suggestedService || 'APP-GENERAL'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#59C9F5] text-[#1B1530] font-mono text-xs font-bold border border-[#1B1530]">
                        {advice.suggestedCategory || 'INQUIRY'}
                      </span>
                    </div>
                  </div>

                  {/* Potential Duplicates */}
                  {advice.potentialDuplicates && advice.potentialDuplicates.length > 0 && (
                    <div className="p-3 bg-[#FF9F43]/10 border-2 border-[#FF9F43] space-y-2">
                      <div className="flex items-center gap-1.5 text-[#FF9F43] font-bold text-xs font-mono">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Potential Existing Outage Found</span>
                      </div>
                      <div className="space-y-2">
                        {advice.potentialDuplicates.map((dup) => (
                          <div key={dup.id} className="p-2 bg-white text-[#1B1530] border border-[#1B1530] text-xs font-mono space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span>{dup.number}</span>
                              <span className="text-[10px] text-[#FF4D3D]">{Math.round(dup.score * 100)}% Match</span>
                            </div>
                            <p className="line-clamp-2 text-[11px]">{dup.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Knowledge Base Deflection */}
                  {advice.matchedKbs && advice.matchedKbs.length > 0 && (
                    <div className="p-3 bg-[#43D17A]/10 border-2 border-[#43D17A] space-y-2">
                      <div className="flex items-center gap-1.5 text-[#43D17A] font-bold text-xs font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Instant Self-Service Solution</span>
                      </div>
                      {advice.matchedKbs.map((kb) => (
                        <div key={kb.id} className="p-2 bg-white text-[#1B1530] border border-[#1B1530] text-xs font-mono space-y-2">
                          <div className="font-bold text-xs">{kb.title}</div>
                          <p className="text-[11px] text-[var(--soft)]">{kb.solution || kb.snippet}</p>
                          <ActionButton
                            size="compact"
                            variant="ok"
                            onClick={() => {
                              sound.win();
                              setDeflected(true);
                            }}
                          >
                            This Fixed My Issue!
                          </ActionButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-[var(--soft)] font-mono text-xs">
                  No active duplicates or automated deflections found. Proceed with ticket creation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
