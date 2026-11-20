import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import { Plus, Trash2, X, Layers } from 'lucide-react';

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
      setError('Question must be at least 3 characters long');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-[2.5rem] w-full max-w-lg p-8 sm:p-10 shadow-xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 p-1.5 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcedea] text-[#c84b31] border border-[#f5d0c8] text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Poll Builder</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight font-editorial">
            Create a Live Session
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Questions update live as your participants cast their votes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Poll Question *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which topic should we cover in depth today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#faf9f6] border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#c84b31] focus:ring-2 focus:ring-[#f5d0c8] text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Description or Context (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide background or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf9f6] border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#c84b31] focus:ring-2 focus:ring-[#f5d0c8] text-sm transition resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Poll Options
              </label>
              <span className="text-[11px] font-mono text-[#c84b31] font-bold uppercase tracking-wider">
                {options.length} options
              </span>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 text-xs text-stone-400 text-right font-mono font-bold">
                    {idx + 1}.
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#faf9f6] border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#c84b31] text-sm transition"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(idx)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition"
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
                className="mt-3 flex items-center gap-1.5 text-xs text-[#c84b31] hover:text-[#b03e26] font-bold px-3 py-1.5 rounded-xl hover:bg-[#fcedea] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another option</span>
              </button>
            )}
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#c84b31] hover:bg-[#b03e26] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Host Live Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
