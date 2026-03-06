'use client';

import { useState } from 'react';
import { X, Send, FileText, MessageSquare, Users, Loader2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userGender: string;
  verificationStatus: string;
}

export default function CreatePostModal({
  isOpen, onClose, userId, userGender, verificationStatus,
}: CreatePostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGender, setSelectedGender] = useState<'boy' | 'girl' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');

    if (verificationStatus !== 'verified') {
      setError('Only verified users can create posts'); return;
    }
    if (!title.trim() || !content.trim() || !selectedGender) {
      setError('All fields are required'); return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notice-board/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: title.trim(), content: content.trim(), category: selectedGender }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Post submitted for approval.');
        setTitle(''); setContent(''); setSelectedGender('');
        setTimeout(() => { onClose(); setSuccess(''); }, 2000);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) { setError('Failed. Please try again.'); } 
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-lg font-bold text-primary">Create Anonymous Post</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Your identity will remain hidden.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg text-center font-medium">
              {success}
            </div>
          )}
          {error && (
             <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Section Select */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target Section</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGender('boy')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedGender === 'boy' 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                      : 'bg-background border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  Male Section
                </button>
                <button
                   type="button"
                   onClick={() => setSelectedGender('girl')}
                   className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedGender === 'girl' 
                      ? 'bg-pink-500/10 border-pink-500 text-pink-400' 
                      : 'bg-background border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  Female Section
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Topic</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is this about?"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-primary placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message here..."
                rows={5}
                className="w-full p-4 bg-background border border-border rounded-xl text-primary placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-white/90 transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Posting...' : 'Submit Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}