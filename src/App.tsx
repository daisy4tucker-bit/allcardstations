/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AccentThemeProvider } from './context/AccentThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/utils/ScrollToTop';

// Pages
import { Home } from './pages/Home';
import { GiftCards } from './pages/GiftCards';
import { GiftCardDetails } from './pages/GiftCardDetails';
import { ValidateCard } from './pages/ValidateCard';
import { HowItWorks } from './pages/HowItWorks';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Checkout } from './pages/Checkout';
import { AdminSystemTest } from './pages/AdminSystemTest';
import { NotFound } from './pages/NotFound';
import { LegalPlaceholder } from './pages/LegalPlaceholder';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Sitemap } from './pages/Sitemap';

export default function App() {
  return (
    <ThemeProvider>
      <AccentThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200">
            <Navbar />
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gift-cards" element={<GiftCards />} />
                <Route path="/gift-cards/:slug" element={<GiftCardDetails />} />
                <Route path="/validate" element={<ValidateCard />} />
                <Route path="/verify" element={<ValidateCard />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/checkout/:slug" element={<Checkout />} />
                
                {/* Admin Diagnostic Routes */}
                <Route path="/admin" element={<AdminSystemTest />} />
                <Route path="/admin/system-test" element={<AdminSystemTest />} />
                <Route path="/admin-system-test" element={<AdminSystemTest />} />
                
                {/* Legal / Policy routes */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<LegalPlaceholder />} />
                <Route path="/security" element={<LegalPlaceholder />} />
                <Route path="/sitemap" element={<Sitemap />} />
                
                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </AccentThemeProvider>
  </ThemeProvider>
  );
}

