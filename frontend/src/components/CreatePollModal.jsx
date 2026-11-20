import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { Plus, Trash2, Sparkles, X, Layers } from 'lucide-react';

export default function CreatePollModal({ onPollCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const removeOptionField = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedTitle = title.trim();
    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);

    if (cleanedTitle.length < 3) {
      setError('Poll question must be at least 3 characters long');
      return;
    }

    if (cleanedOptions.length < 2) {
      setError('Please provide at least 2 distinct options');
      return;
    }

    setLoading(true);

    try {
      const newPoll = await apiRequest('/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          title: cleanedTitle,
          description: description.trim(),
          options: cleanedOptions,
        }),
      });

      onPollCreated(newPoll);
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/10 rounded-[2rem] w-full max-w-lg p-8 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Poll Builder</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Launch New Live Poll
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Questions update live via Redis as your audience casts their votes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Poll Question *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which programming language is best for 2026?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Context / Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Give your audience background or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Poll Options
              </label>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                {options.length} options
              </span>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 text-xs text-slate-500 text-right font-mono font-bold">
                    {idx + 1}.
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm transition"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 8 && (
              <button
                type="button"
                onClick={addOptionField}
                className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1.5 rounded-xl hover:bg-cyan-950/40 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another option</span>
              </button>
            )}
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Launch Live Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
