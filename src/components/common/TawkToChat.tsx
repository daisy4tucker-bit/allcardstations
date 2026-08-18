import React, { useEffect } from 'react';
import { MessageSquare, Headphones } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void;
      minimize?: () => void;
      toggle?: () => void;
      popup?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      setAttributes?: (attributes: Record<string, string>, callback?: (error?: string) => void) => void;
      onLoad?: () => void;
      [key: string]: any;
    };
    Tawk_LoadStart?: Date;
  }
}

export const openTawkChat = () => {
  if (typeof window !== 'undefined' && window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
    window.Tawk_API.maximize();
  } else if (typeof window !== 'undefined' && window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
    window.Tawk_API.toggle();
  } else {
    // Scroll or trigger contact support
    const chatBtn = document.getElementById('tawk-fallback-launcher');
    if (chatBtn) chatBtn.click();
  }
};

export const TawkToChat: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Default property ID & widget ID (can be overridden via VITE_TAWKTO_PROPERTY_ID & VITE_TAWKTO_WIDGET_ID)
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID || '6a83d266cf169a34428ce96b'; // User's Tawk.to Property ID
    const widgetId = import.meta.env.VITE_TAWKTO_WIDGET_ID || 'default'; // User's Tawk.to Widget ID

    if (!propertyId || !widgetId) {
      console.warn('Tawk.to IDs not configured.');
      return;
    }

    // Avoid duplicate script insertion
    const scriptId = 'tawk-embed-script';
    if (document.getElementById(scriptId)) {
      if (user && window.Tawk_API && window.Tawk_API.setAttributes) {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
        window.Tawk_API.setAttributes({
          name: userName,
          email: user.email,
        });
      }
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Set visitor info when Tawk.to loads
    window.Tawk_API.onLoad = () => {
      if (user && window.Tawk_API?.setAttributes) {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
        window.Tawk_API.setAttributes({
          name: userName,
          email: user.email,
        });
      }
    };

    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.id = scriptId;
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }

    return () => {
      // Optional cleanup on unmount
    };
  }, [user]);

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      <button
        id="tawk-fallback-launcher"
        onClick={openTawkChat}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95 border border-indigo-400/30"
        title="Open Tawk.to 24/7 Live Support Chat"
      >
        <div className="relative">
          <Headphones className="w-4 h-4 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-700"></span>
        </div>
        <span className="hidden sm:inline">24/7 Live Support</span>
        <span className="sm:hidden">Support</span>
      </button>
    </div>
  );
};

export default TawkToChat;
