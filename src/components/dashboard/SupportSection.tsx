import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  ShieldAlert,
  Headphones,
  RotateCw,
  Sparkles,
  CheckCheck,
  Info,
} from 'lucide-react';
import * as supportService from '../../services/supportService';
import { SupportMessage, SupportConversation } from '../../services/supportService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const SupportSection: React.FC = () => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'What payment methods are supported on AllCardStation?',
    'When will cryptocurrency payments be available?',
    'How do I validate or check the balance of a gift card?',
    'Can I save multiple recipient addresses for gifting?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMsg('');
      const res = await supportService.getOrCreateConversation();
      setConversation(res.conversation);
      setMessages(res.conversation.messages || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to customer support server.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || !conversation || isSending) return;

    setInputMessage('');
    setIsSending(true);
    setErrorMsg('');

    // Optimistically add user's message
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: SupportMessage = {
      id: tempId,
      conversationId: conversation.id,
      senderType: 'CUSTOMER',
      message: messageContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsTyping(true);

    try {
      await supportService.sendSupportMessage(conversation.id, messageContent);

      // Poll back response after simulated support agent delay
      setTimeout(async () => {
        try {
          const updated = await supportService.getOrCreateConversation();
          setMessages(updated.conversation.messages || []);
        } catch {
          // silently handle polling errors
        } finally {
          setIsTyping(false);
        }
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message.');
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[700px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Support Live Chat</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct assistance with card validation, account management & cryptocurrency payment questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => loadConversation(true)}
            title="Refresh Conversation"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strict Payment Reminder Banner */}
      <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/50 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>Notice:</strong> AllCardStation does not process credit cards or PayPal. Future digital card orders will support <strong>Cryptocurrency (BTC, ETH, LTC, SOL, USDT, USDC)</strong> exclusively.
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">Connecting to support channel...</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isCustomer = msg.senderType === 'CUSTOMER';
              const isAi = msg.senderType === 'AI_ASSISTANT';

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCustomer && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                        isAi ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}
                    >
                      {isAi ? <Bot className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                      isCustomer
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                    }`}
                  >
                    {!isCustomer && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                        {isAi ? (
                          <>
                            <Sparkles className="w-3 h-3" /> AllCardStation Assistant
                          </>
                        ) : (
                          <>
                            <Headphones className="w-3 h-3" /> Support Specialist
                          </>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                        isCustomer ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <span>{formatTimestamp(msg.createdAt)}</span>
                      {isCustomer && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>

                  {isCustomer && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl rounded-bl-xs p-3.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Info className="w-3 h-3" /> Quick FAQ:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isSending || isLoading}
            className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {errorMsg && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-2">{errorMsg}</p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading || isSending}
            placeholder="Type your message or question here..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputMessage.trim() || isSending || isLoading}
            className="rounded-2xl px-5"
            leftIcon={isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
