import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { Plus, Trash2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Create New Live Poll</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300 transition text-sm p-1"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Question / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which web framework is your team building with in 2026?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add brief context or instructions for your audience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Options (2 to 8)
              </label>
              <span className="text-xs text-slate-500">{options.length} options</span>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 text-xs text-slate-500 text-right font-mono">
                    {idx + 1}.
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition"
                      title="Remove option"
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
                className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded hover:bg-indigo-500/10 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another option</span>
              </button>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Launch Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
