import React, { useEffect, useState } from 'react';

export interface TopProgressBarProps {
  isLoading: boolean;
  className?: string;
  height?: string;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  isLoading,
  className = '',
  height = 'h-1',
}) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let finishTimer: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setProgress(15);

      // Smooth progression up to 90% while loading
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          const next = prev + Math.floor(Math.random() * 15) + 8;
          return next > 88 ? 88 : next;
        });
      }, 180);
    } else if (visible) {
      // Finish to 100% then fade out
      setProgress(100);
      finishTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 pointer-events-none ${className}`}>
      <div className={`w-full bg-slate-200/20 dark:bg-slate-800/20 overflow-hidden ${height}`}>
        <div
          className={`h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 ease-out shadow-sm shadow-indigo-500/50`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
