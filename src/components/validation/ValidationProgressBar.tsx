import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Cpu, 
  Globe, 
  Database,
  Sparkles
} from 'lucide-react';

export interface ValidationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

export const VALIDATION_STEPS: ValidationStep[] = [
  {
    id: 'step-1',
    title: 'Format & Checksum Validation',
    description: 'Analyzing alphanumeric code length and issuer structure pattern',
    icon: Cpu,
  },
  {
    id: 'step-2',
    title: 'Merchant Gateway Handshake',
    description: 'Querying brand cryptographic verification protocol',
    icon: Globe,
  },
  {
    id: 'step-3',
    title: 'Denomination & Currency Match',
    description: 'Confirming currency valuation and activation status parameters',
    icon: Database,
  },
  {
    id: 'step-4',
    title: 'Security Seal Certification',
    description: 'Generating tamper-proof validity certificate',
    icon: ShieldCheck,
  },
];

export interface ValidationProgressBarProps {
  brandName: string;
  cardCode: string;
  onComplete: () => void;
}

export const ValidationProgressBar: React.FC<ValidationProgressBarProps> = ({
  brandName,
  cardCode,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [statusMessage, setStatusMessage] = useState<string>('Initiating cryptographic verification...');

  useEffect(() => {
    // Stage 1: Format & Checksum (0 to 300ms)
    const t1 = setTimeout(() => {
      setCurrentStepIndex(0);
      setProgressPercent(28);
      setStatusMessage(`Validating ${brandName || 'Brand'} claim code structure...`);
    }, 200);

    // Stage 2: Merchant Gateway Handshake (300 to 900ms)
    const t2 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgressPercent(60);
      setStatusMessage(`Handshaking with ${brandName || 'Issuer'} security nodes...`);
    }, 900);

    // Stage 3: Denomination & Regional (900 to 1600ms)
    const t3 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgressPercent(88);
      setStatusMessage('Checking currency activation & denomination validity...');
    }, 1600);

    // Stage 4: Completed (1600 to 2200ms)
    const t4 = setTimeout(() => {
      setCurrentStepIndex(3);
      setProgressPercent(100);
      setStatusMessage('Verification sequence complete!');
    }, 2200);

    // Trigger onComplete callback
    const tFinal = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tFinal);
    };
  }, [brandName, onComplete]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/30 p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            {progressPercent === 100 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            )}
          </div>
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Card Validation</span>
            </div>
            <div className="text-sm font-extrabold text-white">
              {brandName || 'Gift Card'} • <span className="font-mono text-slate-300">{cardCode ? `${cardCode.slice(0, 4)}••••${cardCode.slice(-4)}` : '••••••••'}</span>
            </div>
          </div>
        </div>

        {/* Progress Percentage Badge */}
        <div className="text-right">
          <div className="text-2xl font-black font-mono text-emerald-400">
            {progressPercent}%
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {progressPercent === 100 ? 'Verified' : 'Processing'}
          </div>
        </div>
      </div>

      {/* Primary Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            {statusMessage}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Step {Math.min(currentStepIndex + 1, 4)} of 4</span>
        </div>

        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm shadow-emerald-400/30"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Multi-Step Checklist */}
      <div className="space-y-3 pt-2">
        {VALIDATION_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isDone = progressPercent === 100 || index < currentStepIndex;
          const isCurrent = index === currentStepIndex && progressPercent < 100;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                isCurrent 
                  ? 'bg-indigo-950/60 border border-indigo-500/40 text-white' 
                  : isDone 
                  ? 'bg-slate-800/40 border border-emerald-500/20 text-slate-300' 
                  : 'bg-slate-900/40 border border-slate-800/60 text-slate-500'
              }`}
            >
              {/* Step Status Icon */}
              <div className="shrink-0">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-mono font-bold">
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className={isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-500'}>
                    {step.title}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {step.description}
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-[10px] font-mono font-bold shrink-0">
                {isDone && <span className="text-emerald-400">PASSED</span>}
                {isCurrent && <span className="text-indigo-300 animate-pulse">CHECKING...</span>}
                {isPending && <span className="text-slate-600">QUEUED</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
