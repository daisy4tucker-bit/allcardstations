import React, { useState, useEffect } from 'react';
import {
  Headphones,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Send,
  Loader2,
  RefreshCw,
  User,
  Shield,
  Bot,
  Database,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import * as supportService from '../../services/supportService';
import { SupportConversation, SupportMessage } from '../../services/supportService';
import { Button } from '../ui/Button';

export const AdminSupportSection: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<SupportConversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'WAITING' | 'CLOSED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const [convRes, statsRes] = await Promise.all([
        supportService.listAdminConversations(statusFilter),
        supportService.getAdminStats(),
      ]);
      setConversations(convRes.conversations || []);
      setStats(statsRes.stats);

      if (selectedConv) {
        const refreshed = await supportService.getAdminConversation(selectedConv.id);
        setSelectedConv(refreshed.conversation);
      } else if (convRes.conversations?.length > 0) {
        const first = await supportService.getAdminConversation(convRes.conversations[0].id);
        setSelectedConv(first.conversation);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load support console data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSelectConversation = async (id: string) => {
    try {
      const res = await supportService.getAdminConversation(id);
      setSelectedConv(res.conversation);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load conversation details.');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim() || isSending) return;

    try {
      setIsSending(true);
      await supportService.sendAdminReply(selectedConv.id, replyText.trim());
      setReplyText('');
      const refreshed = await supportService.getAdminConversation(selectedConv.id);
      setSelectedConv(refreshed.conversation);
      // Refresh list in background
      const convRes = await supportService.listAdminConversations(statusFilter);
      setConversations(convRes.conversations || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send agent reply.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: 'OPEN' | 'WAITING' | 'CLOSED') => {
    if (!selectedConv) return;
    try {
      const res = await supportService.updateAdminConversationStatus(selectedConv.id, newStatus);
      setSelectedConv(res.conversation);
      const convRes = await supportService.listAdminConversations(statusFilter);
      setConversations(convRes.conversations || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update ticket status.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Support Agent Console</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold uppercase">
                  Staff Access
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time customer conversation queue connected to Supabase PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Database & System Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Users</span>
              <Database className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              {stats.usersCount}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Gift Cards</span>
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              {stats.cardsCount}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Conversations</span>
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              {stats.conversationsCount}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Messages Logged</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              {stats.messagesCount}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-5 flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
          {/* Status Filter Tabs */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex gap-1 bg-white dark:bg-slate-900">
            {(['ALL', 'OPEN', 'WAITING', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading && conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span>Loading tickets...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations found under '{statusFilter}'.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {conv.user ? `${conv.user.firstName} ${conv.user.lastName}` : `Visitor (${conv.visitorId.substring(0, 10)})`}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                          conv.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : conv.status === 'WAITING'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {conv.status}
                      </span>
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {conv.lastMessage.senderType === 'CUSTOMER' ? 'User: ' : 'Staff: '}
                        </span>
                        {conv.lastMessage.message}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Conversation Chat & Reply */}
        <div className="lg:col-span-7 flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          {selectedConv ? (
            <>
              {/* Conversation Action Bar */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    Conversation: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedConv.id}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Visitor ID: {selectedConv.visitorId}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                  <select
                    value={selectedConv.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="WAITING">WAITING</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px] min-h-[260px] bg-slate-50/40 dark:bg-slate-950/20">
                {selectedConv.messages?.map((msg) => {
                  const isAgent = msg.senderType === 'SUPPORT_AGENT';
                  const isAi = msg.senderType === 'AI_ASSISTANT';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        {isAgent ? (
                          <>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Support Staff</span>
                            <Shield className="w-3 h-3 text-indigo-600" />
                          </>
                        ) : isAi ? (
                          <>
                            <Bot className="w-3 h-3 text-amber-500" />
                            <span className="font-bold text-amber-600 dark:text-amber-400">Automated Bot</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="font-bold text-slate-600 dark:text-slate-300">Customer</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : isAi
                            ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 rounded-tl-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Staff Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official support response..."
                  disabled={isSending}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSending || !replyText.trim()}
                  leftIcon={isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                >
                  Reply
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a conversation from the queue to view messages and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
