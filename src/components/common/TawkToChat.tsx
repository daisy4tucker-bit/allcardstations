import React, { useEffect, useState } from 'react';
import { Headphones } from 'lucide-react';
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
      onStatusChange?: (status: string) => void;
      isChatMaximized?: () => boolean;
      getStatus?: () => string;
      [key: string]: any;
    };
    Tawk_LoadStart?: Date;
  }
}

let pendingOpenRequest = false;

/**
 * Global function to trigger and maximize Tawk.to live chatbox from any button or link.
 */
export const openTawkChat = () => {
  if (typeof window !== 'undefined' && window.Tawk_API) {
    if (typeof window.Tawk_API.showWidget === 'function') {
      window.Tawk_API.showWidget();
    }
    if (typeof window.Tawk_API.maximize === 'function') {
      window.Tawk_API.maximize();
    } else if (typeof window.Tawk_API.popup === 'function') {
      window.Tawk_API.popup();
    } else if (typeof window.Tawk_API.toggle === 'function') {
      window.Tawk_API.toggle();
    } else {
      pendingOpenRequest = true;
    }
  } else {
    pendingOpenRequest = true;
  }
};

export const TawkToChat: React.FC = () => {
  const { user } = useAuth();
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);

  useEffect(() => {
    // Active Tawk.to Property and Widget ID
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID || '6a82f33c5981892f72dde871';
    const widgetId = import.meta.env.VITE_TAWKTO_WIDGET_ID || 'default';

    if (!propertyId || !widgetId) {
      return;
    }

    const configureTawk = () => {
      setIsTawkLoaded(true);
      if (!window.Tawk_API) return;

      // Ensure widget is visible
      if (typeof window.Tawk_API.showWidget === 'function') {
        window.Tawk_API.showWidget();
      }

      // Sync authenticated user info
      if (user && typeof window.Tawk_API.setAttributes === 'function') {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
        window.Tawk_API.setAttributes({
          name: userName,
          email: user.email,
        });
      }

      // Handle pending open request if user clicked; otherwise ensure it stays minimized
      if (pendingOpenRequest) {
        pendingOpenRequest = false;
        if (typeof window.Tawk_API.maximize === 'function') {
          window.Tawk_API.maximize();
        } else if (typeof window.Tawk_API.popup === 'function') {
          window.Tawk_API.popup();
        }
      } else {
        if (typeof window.Tawk_API.minimize === 'function') {
          window.Tawk_API.minimize();
        }
      }
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();

    const existingScript = document.getElementById('tawk-embed-script') || 
      document.querySelector(`script[src*="embed.tawk.to"]`);

    if (existingScript) {
      if (window.Tawk_API.getStatus) {
        configureTawk();
      } else {
        const prevOnLoad = window.Tawk_API.onLoad;
        window.Tawk_API.onLoad = () => {
          if (typeof prevOnLoad === 'function') prevOnLoad();
          configureTawk();
        };
      }
      return;
    }

    // Register onLoad handler
    window.Tawk_API.onLoad = configureTawk;

    // Dynamically insert Tawk.to script
    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.id = 'tawk-embed-script';
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, [user]);

  // If Tawk.to widget is loaded natively, Tawk provides its own bottom-right widget bubble.
  // We keep a lightweight accessible floating button fallback if Tawk is still initializing.
  return null;
};

export default TawkToChat;
