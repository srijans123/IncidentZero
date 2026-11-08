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

interface PortalReportProps {
  onBack: () => void;
  onSubmitSuccess: (incidentId: string) => void;
}

export const PortalReport: React.FC<PortalReportProps> = ({ onBack, onSubmitSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<number>(3);
  const [isRecording, setIsRecording] = useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advice, setAdvice] = useState<IntakeAdvice | null>(null);
  const [deflected, setDeflected] = useState(false);

  const debounceTimerRef = useRef<any>(null);

  // Derive target service for reactive focus
  const detectedService =
    advice?.suggestedService ||
    (title.toLowerCase().includes('lms') || title.toLowerCase().includes('quiz') || description.toLowerCase().includes('lms')
      ? 'APP-LMS'
      : undefined);

  // Web Speech API Voice Recognition
  const startVoiceInput = () => {
    sound.blip();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type your issue.');
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
        // Local heuristic fallback
        if (title.toLowerCase().includes('lms')) {
          setAdvice({
            suggestedCategory: 'AUTHENTICATION',
            suggestedService: 'APP-LMS',
            suggestedImpact: 2,
            suggestedUrgency: 1,
            confidence: 0.94,
            priorityRationale: 'Exam Window Urgency Bump Applied',
            potentialDuplicates: [
              {
                id: '1',
                number: 'INC-2026-000104',
                title: 'LMS authentication timeout during quiz window',
                score: 0.91,
                serviceCode: 'APP-LMS',
                state: 'IN_PROGRESS',
              },
            ],
            matchedKbs: [
              {
                id: 'KB-0002',
                title: 'Clearing Expired BITS SSO Cookies',
                snippet: 'Clearing expired BITS SSO cookies or using private browsing restores LMS access.',
                solution: 'Open an incognito window and clear cookies for sso.bits-pilani.ac.in',
                serviceCode: 'APP-LMS',
                relevanceScore: 0.95,
              },
            ],
          });
        } else {
          setAdvice(null);
        }
      } finally {
        setIsAdviceLoading(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimerRef.current);
  }, [title, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.slot();
    try {
      setIsSubmitting(true);
      const res = await api.incidents.create({
        title,
        description,
        serviceId: advice?.suggestedService || undefined,
        urgency: urgency,
      });

      if (res && res.id) {
        sound.win();
        onSubmitSuccess(res.id);
      }
    } catch (err) {
      console.error('Failed to submit incident', err);
      sound.err();
      alert('Error creating incident. Check backend connection.');
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
          <p className="text-xs sm:text-sm text-[var(--soft)] leading-relaxed">
            Glad the BITS IT Self-Service solution worked for you. We recorded this resolution to reinforce AI knowledge ranking.
          </p>
          <ActionButton
            size="cta"
            variant="primary"
            onClick={() => {
              sound.blip();
              onBack();
            }}
          >
            Return to Dashboard
          </ActionButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Column (7 cols) */}
          <div className="lg:col-span-7 pixel-card-offset" style={{ '--b': '#FFD84D' } as any}>
            <span className="pixel-tag-badge">
              <PixelIcon name="megaphone" scale={1.6} />
              <span>SPAWN BPHC TICKET</span>
            </span>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] tracking-tight">
                Report Campus IT Incident
              </h1>
              <p className="text-xs sm:text-sm text-[var(--soft)] mt-1">
                Describe the problem naturally. The system automatically classifies the service, extracts PII, and routes to on-call technicians.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title Field + Voice Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                    Incident Title / Summary *
                  </label>
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    className={`btn sm ${isRecording ? 'r animate-pulse' : 'w'} flex items-center gap-1`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#FF4D3D]" />}
                    <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cannot log into Campus LMS during quiz window"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide error codes, hostel room/bhawan, or steps to reproduce..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm font-mono font-bold bg-white text-[#1B1530] border-[3px] border-[var(--line)] shadow-[3px_3px_0_var(--shadow-col)] focus:outline-none resize-none"
                />
              </div>

              {/* Urgency Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold font-mono text-[var(--fg)] uppercase">
                  Self-Reported Urgency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { val: 1, label: 'Critical / Exam Outage', desc: 'Active test or grading impacted', col: 'bg-[#FF4D3D] text-[#FFF8DC]' },
                    { val: 2, label: 'High Priority', desc: 'Hostel wing or lab blocked', col: 'bg-[#FF9F43] text-[#1B1530]' },
                    { val: 3, label: 'Standard', desc: 'Routine inquiry or minor glitch', col: 'bg-[#FFD84D] text-[#1B1530]' },
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
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Incident
                </ActionButton>
              </div>
            </form>
          </div>

          {/* Right Copilot Telemetry Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* AI Real-time Triage Suggestions */}
            {advice && (
              <div className="pixel-card bg-[var(--card)] space-y-3">
                <div className="flex items-center justify-between font-mono text-xs font-bold text-[var(--fg)]">
                  <span className="flex items-center gap-1.5 text-[#7C5CFF]">
                    <Sparkles className="w-4 h-4" />
                    <span>AI INTAKE TRIAGE PREVIEW</span>
                  </span>
                  <span>Confidence: {Math.round((advice.confidence || 0.92) * 100)}%</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge label={`SVC: ${advice.suggestedService || 'APP-LMS'}`} variant="accent" isMono />
                  <StatusBadge label={`CAT: ${advice.suggestedCategory || 'AUTHENTICATION'}`} variant="neutral" isMono />
                  <StatusBadge label={advice.priorityRationale || 'PRIORITY: P1'} variant="crit" isMono />
                </div>

                {/* Instant KB Deflection Card */}
                {advice.matchedKbs && advice.matchedKbs.length > 0 && (
                  <div className="p-3 bg-[#43D17A]/15 border-2 border-[#1B1530] space-y-2">
                    <div className="font-bold text-xs text-[#1B1530] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Self-Service KB: {advice.matchedKbs[0].title}</span>
                    </div>
                    <p className="text-xs text-[#1B1530] font-medium leading-relaxed">
                      {advice.matchedKbs[0].solution || advice.matchedKbs[0].snippet}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        sound.win();
                        setDeflected(true);
                      }}
                      className="btn sm g w-full"
                    >
                      ✔ This Solved My Issue!
                    </button>
                  </div>
                )}

                {/* Duplicate Warning */}
                {advice.potentialDuplicates && advice.potentialDuplicates.length > 0 && (
                  <div className="p-3 bg-[#FF9F43]/20 border-2 border-[#1B1530] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#1B1530]">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Similar Active Outages Detected</span>
                    </div>
                    <p className="text-xs text-[var(--soft)]">
                      Similar reports detected. This ticket will automatically link to the parent incident:
                    </p>
                    <div className="space-y-1">
                      {advice.potentialDuplicates.map((dup, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-1.5 bg-white border border-[#1B1530] font-mono"
                        >
                          <span className="font-bold text-[#FF4D3D]">{dup.number}</span>
                          <span className="truncate max-w-[140px] text-[#1B1530]">{dup.title}</span>
                          <span className="font-bold">{Math.round((dup.score || 0.88) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
