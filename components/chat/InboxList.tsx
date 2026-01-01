'use client';

import { Check, X, Lock, MoreVertical, User, MessageSquare, ShieldCheck, Ban, ChevronRight, Clock } from 'lucide-react';
import { ChatRequest } from '@/app/inbox/page';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InboxListProps {
  requests: ChatRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
  onOpenChat: (id: string) => void;
}

export function InboxList({ requests, onAccept, onReject, onBlock, onOpenChat }: InboxListProps) {
  const router = useRouter();
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGenderIcon = (gender: string) => {
    const g = gender?.toLowerCase();
    if (g === 'male') return <User className="w-full h-full text-blue-400" />;
    if (g === 'female') return <User className="w-full h-full text-pink-400" />;
    return <User className="w-full h-full text-purple-400" />;
  };

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div
          key={request.id}
          className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] rounded-2xl p-3 sm:p-4 transition-all duration-200"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div 
              className="relative shrink-0 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => router.push(`/profile/${request.from.id}`)}
              title="View Profile"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                {getGenderIcon(request.from.gender)}
              </div>
              {/* Status indicator */}
              {request.isBlocked ? (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <Ban className="w-2 h-2 text-white" />
                </div>
              ) : request.status === 'pending' ? (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
              ) : request.status === 'accepted' ? (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
              ) : null}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                    {request.from.anonymousName}
                  </h3>
                  {request.from.verified && (
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>

                {/* Timestamp & Menu */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-white/30">
                    {getTimeAgo(request.timestamp)}
                  </span>
                  {request.status === 'accepted' && !request.isBlocked && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMenuId(showMenuId === request.id ? null : request.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-white/40" />
                      </button>
                      
                      {showMenuId === request.id && (
                        <>
                          {/* Backdrop */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowMenuId(null)}
                          />
                          {/* Menu */}
                          <div className="absolute right-0 top-8 bg-slate-800 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-1 min-w-[140px] z-20">
                            <button
                              onClick={() => {
                                onBlock(request.id);
                                setShowMenuId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            >
                              <Ban className="w-4 h-4" />
                              Block User
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Age & Gender Tag */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/30">
                  {request.from.age} · {request.from.gender}
                </span>
              </div>

              {/* Message Preview */}
              <div className="mb-3">
                {request.status === 'pending' && !request.isBlocked ? (
                  <div className="flex items-center gap-2 text-white/30 text-xs sm:text-sm">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="italic">Accept to view message</span>
                  </div>
                ) : request.isBlocked ? (
                  <div className="flex items-center gap-2 text-red-400/70 text-xs sm:text-sm">
                    <Ban className="w-3.5 h-3.5" />
                    <span>User blocked</span>
                  </div>
                ) : (
                  <p className="text-sm text-white/50 line-clamp-2">
                    {request.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {request.status === 'pending' && !request.isBlocked && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(request.id)}
                    className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {request.status === 'accepted' && !request.isBlocked && (
                <button
                  onClick={() => onOpenChat(request.id)}
                  className="w-full py-2.5 px-4 bg-purple-500 hover:bg-purple-600 active:scale-95 text-white rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </button>
              )}

              {request.status === 'rejected' && !request.isBlocked && (
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <X className="w-3.5 h-3.5" />
                  <span>Request rejected</span>
                </div>
              )}

              {request.isBlocked && (
                <div className="flex items-center gap-2 py-2 px-3 bg-red-500/10 rounded-xl text-red-400 text-xs">
                  <Ban className="w-3.5 h-3.5" />
                  <span className="font-medium">This user has been blocked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
