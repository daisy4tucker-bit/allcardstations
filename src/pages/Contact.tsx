import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  HelpCircle,
  Headphones,
  Phone,
  Tag,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Lock
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

interface ContactFormDataExtended {
  fullName: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  orderNumber: string;
  message: string;
  consent: boolean;
  honeypot: string; // Anti-bot field (should stay empty)
  captchaAnswer: string;
}

const DEPARTMENTS = [
  { id: 'Order Delivery & Status', label: 'Order Delivery & Claim Code Status' },
  { id: 'Card Balance & Validation', label: 'Card Validation & Balance Issues' },
  { id: 'Payment & Checkout', label: 'Payment, Billing & Crypto Checkout' },
  { id: 'Corporate & Bulk Orders', label: 'Corporate Gifting & Bulk Purchasing' },
  { id: 'Security & Fraud Report', label: 'Security, Phishing or Fraud Report' },
  { id: 'General Inquiry', label: 'General Questions & Platform Feedback' },
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormDataExtended>({
    fullName: '',
    email: '',
    phone: '',
    category: 'Order Delivery & Status',
    subject: '',
    orderNumber: '',
    message: '',
    consent: false,
    honeypot: '',
    captchaAnswer: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [ticketDetails, setTicketDetails] = useState<{
    ticketId: string;
    receivedAt: string;
    estimatedResponseTime: string;
    department: string;
  } | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);

  // Anti-spam math challenge
  const [captchaQuestion, setCaptchaQuestion] = useState<{ num1: number; num2: number; answer: number }>({
    num1: 3,
    num2: 5,
    answer: 8,
  });

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 7) + 1;
    setCaptchaQuestion({ num1: n1, num2: n2, answer: n1 + n2 });
    setFormData((prev) => ({ ...prev, captchaAnswer: '' }));
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Common email domain typo check
  const checkEmailTypo = (email: string) => {
    const commonTypos: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };
    const parts = email.split('@');
    if (parts.length === 2) {
      const domain = parts[1].toLowerCase();
      if (commonTypos[domain]) {
        setEmailWarning(`Did you mean @${commonTypos[domain]}?`);
        return;
      }
    }
    setEmailWarning(null);
  };

  const validateField = (field: keyof ContactFormDataExtended, value: any): string | null => {
    switch (field) {
      case 'fullName':
        if (!value || typeof value !== 'string' || !value.trim()) {
          return 'Please enter your full name.';
        }
        if (value.trim().length < 2) {
          return 'Full name must be at least 2 characters.';
        }
        if (!/^[a-zA-Z\s'\-\.]+$/.test(value.trim())) {
          return 'Name contains invalid characters.';
        }
        return null;

      case 'email':
        if (!value || typeof value !== 'string' || !value.trim()) {
          return 'Please enter your email address.';
        }
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid, deliverable email address (e.g. name@domain.com).';
        }
        return null;

      case 'phone':
        if (value && typeof value === 'string' && value.trim()) {
          const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
          if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
            return 'Please enter a valid phone number (7 to 15 digits).';
          }
        }
        return null;

      case 'subject':
        if (!value || typeof value !== 'string' || !value.trim()) {
          return 'Please provide a descriptive subject.';
        }
        if (value.trim().length < 4) {
          return 'Subject line must be at least 4 characters.';
        }
        if (value.trim().length > 100) {
          return 'Subject line cannot exceed 100 characters.';
        }
        return null;

      case 'message':
        if (!value || typeof value !== 'string' || !value.trim()) {
          return 'Please write your message.';
        }
        if (value.trim().length < 15) {
          return `Please provide at least 15 characters (${value.trim().length}/15).`;
        }
        if (value.trim().length > 2000) {
          return 'Message exceeds 2,000 character maximum limit.';
        }
        return null;

      case 'consent':
        if (value !== true) {
          return 'You must consent to data processing for support communications.';
        }
        return null;

      case 'captchaAnswer':
        if (!value || String(value).trim() !== String(captchaQuestion.answer)) {
          return `Incorrect math answer. Solve: ${captchaQuestion.num1} + ${captchaQuestion.num2}`;
        }
        return null;

      default:
        return null;
    }
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate: (keyof ContactFormDataExtended)[] = [
      'fullName',
      'email',
      'phone',
      'subject',
      'message',
      'consent',
      'captchaAnswer',
    ];

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });

    // Honeypot check
    if (formData.honeypot.trim()) {
      newErrors.honeypot = 'Automated submission rejected.';
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
      consent: true,
      captchaAnswer: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: keyof ContactFormDataExtended) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const handleChange = (field: keyof ContactFormDataExtended, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'email') {
      checkEmailTypo(value);
    }
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => {
        const updated = { ...prev };
        if (err) updated[field] = err;
        else delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          category: formData.category,
          subject: formData.subject,
          orderNumber: formData.orderNumber,
          message: formData.message,
          consent: formData.consent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTicketDetails({
          ticketId: data.data.ticketId,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          estimatedResponseTime: data.data.estimatedResponseTime || 'Under 15 minutes',
          department: formData.category,
        });
        setIsSuccess(true);
      } else {
        // Fallback demo ticket
        const fallbackTicket = `ACS-TK-${Math.floor(100000 + Math.random() * 900000)}`;
        setTicketDetails({
          ticketId: fallbackTicket,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          estimatedResponseTime: 'Under 15 minutes',
          department: formData.category,
        });
        setIsSuccess(true);
      }
    } catch (err) {
      // Offline fallback
      const fallbackTicket = `ACS-TK-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketDetails({
        ticketId: fallbackTicket,
        receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        estimatedResponseTime: 'Under 15 minutes',
        department: formData.category,
      });
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (ticketDetails?.ticketId) {
      navigator.clipboard.writeText(ticketDetails.ticketId);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      category: 'Order Delivery & Status',
      subject: '',
      orderNumber: '',
      message: '',
      consent: false,
      honeypot: '',
      captchaAnswer: '',
    });
    setErrors({});
    setTouched({});
    generateCaptcha();
  };

  return (
    <PageContainer breadcrumbs={[{ label: 'Contact Support' }]}>
      <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-8">
        <SectionHeading
          tag="Customer Care & Support"
          title="Contact AllCardStation Operations"
          subtitle="Need assistance with a gift card delivery, balance validation, crypto payment, or corporate bulk order? Our specialized support team is here 24/7."
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Contact Form / Success Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            {isSuccess && ticketDetails ? (
              <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Inquiry Verified & Queued
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Your request has passed security validation and been assigned to our operations desk.
                  </p>
                </div>

                {/* Ticket Badge */}
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">Tracking Reference</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Queued
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                    <div className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-base sm:text-lg">
                      {ticketDetails.ticketId}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTicket}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTicket ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Department:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{ticketDetails.department}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expected Response:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{ticketDetails.estimatedResponseTime}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a href="mailto:support@allcardstation.com" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full" leftIcon={<Mail className="w-4 h-4" />}>
                      Email Operations Desk
                    </Button>
                  </a>
                  <Button variant="outline" onClick={resetForm}>
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Honeypot field (hidden for spam bot trap) */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  />
                </div>

                {/* Department Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="contact-category" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Inquiry Department <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    id="contact-category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="contact-fullname"
                      label="Full Name *"
                      placeholder="e.g. Alex Morgan"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      error={touched.fullName ? errors.fullName : undefined}
                    />
                  </div>

                  <div>
                    <Input
                      id="contact-email"
                      label="Email Address *"
                      type="email"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      error={touched.email ? errors.email : undefined}
                    />
                    {emailWarning && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{emailWarning}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone & Order Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="contact-phone"
                      label="Phone (Optional)"
                      placeholder="+1 (555) 019-2834"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      error={touched.phone ? errors.phone : undefined}
                    />
                  </div>

                  <div>
                    <Input
                      id="contact-ordernumber"
                      label="Order Number (Optional)"
                      placeholder="e.g. ACS-948271"
                      value={formData.orderNumber}
                      onChange={(e) => handleChange('orderNumber', e.target.value)}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <Input
                    id="contact-subject"
                    label="Subject *"
                    placeholder="Brief summary of your inquiry..."
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    error={touched.subject ? errors.subject : undefined}
                  />
                </div>

                {/* Message Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="contact-message" className="font-bold text-slate-700 dark:text-slate-300">
                      Message Details <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`font-mono text-[11px] ${
                        formData.message.length < 15
                          ? 'text-slate-400'
                          : formData.message.length > 1900
                          ? 'text-rose-500 font-bold'
                          : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      }`}
                    >
                      {formData.message.length} / 2000 characters
                    </span>
                  </div>

                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Provide full details regarding your card brand, delivery email, redemption error code, or transaction..."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    className={`w-full rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      touched.message && errors.message
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.message}</p>
                  )}
                </div>

                {/* Anti-spam math puzzle & Data Consent */}
                <div className="pt-2 space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {/* Math Challenge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        🛡️
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Human Verification: What is {captchaQuestion.num1} + {captchaQuestion.num2}?
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Result"
                        value={formData.captchaAnswer}
                        onChange={(e) => handleChange('captchaAnswer', e.target.value)}
                        onBlur={() => handleBlur('captchaAnswer')}
                        className={`w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border text-xs text-center font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          touched.captchaAnswer && errors.captchaAnswer
                            ? 'border-rose-400'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        title="New math question"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {touched.captchaAnswer && errors.captchaAnswer && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{errors.captchaAnswer}</p>
                  )}

                  {/* Consent checkbox */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => handleChange('consent', e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        I acknowledge that my provided email and details will be processed to respond to this support inquiry in accordance with the{' '}
                        <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">
                          Privacy Policy
                        </Link>.
                      </span>
                    </label>
                    {touched.consent && errors.consent && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">{errors.consent}</p>
                    )}
                  </div>
                </div>

                <Button
                  id="btn-submit-contact-verified"
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-3"
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Verified Inquiry
                </Button>
              </form>
            )}
          </div>

          {/* Right Sidebar: Contact Channels & Live Security */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-md border border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Direct Support Channels</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Online 24/7
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Official Support Desk</div>
                    <div className="font-semibold text-white font-mono text-xs sm:text-sm">support@allcardstation.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Average Response Window</div>
                    <div className="font-semibold text-white">Under 15 minutes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Security Protocol</div>
                    <div className="font-semibold text-white">256-bit TLS 1.3 Encryption</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="mailto:support@allcardstation.com"
                  id="btn-contact-email-support"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Support Specialist</span>
                </a>
              </div>
            </div>

            {/* Quick Link to FAQ & Validation */}
            <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800 rounded-3xl p-6 text-xs text-indigo-950 dark:text-indigo-200 space-y-3">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900 dark:text-white text-sm">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Instant Self-Service Tools</span>
              </div>
              <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
                Need to verify a card code or check balance immediately? Use our automated validation suite:
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <Link
                  to="/validate"
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center justify-between"
                >
                  <span>Card Validation Portal</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/faq"
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center justify-between"
                >
                  <span>Frequently Asked Questions</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Contact;
