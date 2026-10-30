import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window {
    __tawkUserClicked?: boolean;
    Tawk_API?: {
      maximize?: () => void;
      minimize?: () => void;
      toggle?: () => void;
      popup?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      setAttributes?: (attributes: Record<string, string>, callback?: (error?: string) => void) => void;
      onLoad?: () => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
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
 * Marks the open action as user-initiated so suppression guards allow the chatbox to expand.
 */
export const openTawkChat = () => {
  if (typeof window !== 'undefined') {
    window.__tawkUserClicked = true;

    if (window.Tawk_API) {
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
  }
};

export const TawkToChat: React.FC = () => {
  const { user } = useAuth();
  const [, setIsTawkLoaded] = useState(false);

  useEffect(() => {
    // Active Tawk.to Property and Widget ID
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID || '6a82f33c5981892f72dde871';
    const widgetId = import.meta.env.VITE_TAWKTO_WIDGET_ID || 'default';

    if (!propertyId || !widgetId) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();
    if (typeof window.__tawkUserClicked === 'undefined') {
      window.__tawkUserClicked = false;
    }

    // Track mouse coordinates to detect direct clicks on the Tawk bottom-right launcher iframe
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isHoveringTawkWidget = false;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      // Bottom-right corner zone where the Tawk launcher bubble sits (typically within 120px from right & bottom)
      const isNearCorner = 
        lastMouseX >= window.innerWidth - 130 && 
        lastMouseY >= window.innerHeight - 130;
      isHoveringTawkWidget = isNearCorner;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;

      if (
        clientX >= window.innerWidth - 130 &&
        clientY >= window.innerHeight - 130
      ) {
        // User intentionally clicked/tapped the Tawk launcher bubble
        window.__tawkUserClicked = true;
      }
    };

    // When clicking inside an iframe (like Tawk's widget iframe), the main window loses focus (blur event)
    const handleWindowBlur = () => {
      if (isHoveringTawkWidget) {
        window.__tawkUserClicked = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('blur', handleWindowBlur);

    const configureTawk = () => {
      setIsTawkLoaded(true);
      if (!window.Tawk_API) return;

      // Ensure widget bubble is visible in bottom corner
      if (typeof window.Tawk_API.showWidget === 'function') {
        window.Tawk_API.showWidget();
      }

      // Sync authenticated user info if available
      if (user && typeof window.Tawk_API.setAttributes === 'function') {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
        window.Tawk_API.setAttributes({
          name: userName,
          email: user.email,
        });
      }

      // Enforce: chatbox only pops up if user clicked
      window.Tawk_API.onChatMaximized = () => {
        if (!window.__tawkUserClicked) {
          // Automatic trigger/popup attempted without user click — minimize immediately
          if (typeof window.Tawk_API?.minimize === 'function') {
            window.Tawk_API.minimize();
          }
        }
      };

      window.Tawk_API.onChatMinimized = () => {
        // Reset user click state so future triggers don't auto-maximize
        window.__tawkUserClicked = false;
      };

      // Handle pending open request if user clicked a link before load completed
      if (pendingOpenRequest) {
        pendingOpenRequest = false;
        window.__tawkUserClicked = true;
        if (typeof window.Tawk_API.maximize === 'function') {
          window.Tawk_API.maximize();
        } else if (typeof window.Tawk_API.popup === 'function') {
          window.Tawk_API.popup();
        }
      } else {
        // Ensure widget starts minimized (only the round bubble launcher visible)
        if (typeof window.Tawk_API.minimize === 'function') {
          window.Tawk_API.minimize();
        }
      }
    };

    // Keep guarding against delayed automated triggers on page mount
    const checkMinimizationTimer = setTimeout(() => {
      if (!window.__tawkUserClicked && window.Tawk_API?.isChatMaximized?.()) {
        window.Tawk_API.minimize?.();
      }
    }, 1200);

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
    } else {
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
    }

    return () => {
      clearTimeout(checkMinimizationTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [user]);

  return null;
};

export default TawkToChat;
