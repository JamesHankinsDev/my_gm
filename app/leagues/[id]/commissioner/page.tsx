'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import type { League, LeagueSettings, DEFAULT_LEAGUE_SETTINGS } from '@/types';

export default function CommissionerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [season, setSeason] = useState(2025);
  const [maxTeams, setMaxTeams] = useState(10);
  const [capLimit, setCapLimit] = useState(20);
  const [tradeDeadline, setTradeDeadline] = useState(18);
  const [commissionerVeto, setCommissionerVeto] = useState(true);
  const [draftType, setDraftType] = useState<'snake' | 'auction'>('snake');
  const [scoringNotes, setScoringNotes] = useState('');

  useEffect(() => {
    fetch(`/api/leagues/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const l = json.data.league as League;
          setLeague(l);
          setIsCommissioner(json.data.isCommissioner);
          // Populate form
          setName(l.name);
          setSeason(l.season);
          const s = l.settings;
          if (s) {
            setMaxTeams(s.max_teams ?? 10);
            setCapLimit(s.cap_limit ?? 20);
            setTradeDeadline(s.trade_deadline_week ?? 18);
            setCommissionerVeto(s.commissioner_veto ?? true);
            setDraftType(s.draft_type ?? 'snake');
            setScoringNotes(s.scoring_notes ?? '');
          }
        }
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSaved(false);

    const res = await fetch(`/api/leagues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        season,
        settings: {
          max_teams: maxTeams,
          cap_limit: capLimit,
          trade_deadline_week: tradeDeadline,
          commissioner_veto: commissionerVeto,
          draft_type: draftType,
          scoring_notes: scoringNotes,
        },
      }),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <main className="page-container">
          <div className="card mx-5 mt-6 text-center py-12 text-slate-400">Loading...</div>
        </main>
      </>
    );
  }

  if (!isCommissioner) {
    return (
      <>
        <Nav />
        <main className="page-container">
          <div className="card mx-5 mt-6 text-center py-12">
            <span className="text-4xl block mb-3">🔒</span>
            <p className="text-slate-500 font-medium">Commissioner access only</p>
            <p className="text-xs text-slate-400 mt-1">Only the league commissioner can access this page.</p>
            <button onClick={() => router.back()} className="btn-secondary inline-block mt-4">Go Back</button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/leagues/${id}`)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="page-title">Commissioner&apos;s Office</h1>
          </div>
          <p className="page-subtitle">{league?.name} — League Settings</p>
        </div>

        <form onSubmit={handleSave} className="px-5 space-y-5">
          {/* League Info */}
          <div className="card space-y-3">
            <h2 className="font-bold text-slate-900">League Info</h2>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">League Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Season</label>
              <input type="number" value={season} onChange={(e) => setSeason(Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">League Size</label>
              <div className="grid grid-cols-4 gap-2">
                {[8, 12, 16, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setMaxTeams(size)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      maxTeams === size
                        ? 'bg-court text-white shadow-md'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{maxTeams} teams per league</p>
            </div>
          </div>

          {/* Salary & Cap */}
          <div className="card space-y-3">
            <h2 className="font-bold text-slate-900">Salary Cap</h2>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Cap Limit ($)</label>
              <input type="number" min={10} max={50} step={0.5} value={capLimit} onChange={(e) => setCapLimit(Number(e.target.value))} className="input" />
            </div>
            <p className="text-xs text-slate-400">
              Tax zone: ${capLimit}–${capLimit + 2} (5%/$ penalty). Lockout: above ${capLimit + 2}.
            </p>
          </div>

          {/* Draft & Trades */}
          <div className="card space-y-3">
            <h2 className="font-bold text-slate-900">Draft & Trades</h2>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Draft Type</label>
              <select value={draftType} onChange={(e) => setDraftType(e.target.value as 'snake' | 'auction')} className="input">
                <option value="snake">Snake Draft</option>
                <option value="auction">Auction Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Trade Deadline (Week)</label>
              <input type="number" min={1} max={25} value={tradeDeadline} onChange={(e) => setTradeDeadline(Number(e.target.value))} className="input" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={commissionerVeto}
                onChange={(e) => setCommissionerVeto(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-court focus:ring-court"
              />
              <div>
                <span className="text-sm font-medium text-slate-900">Commissioner Veto</span>
                <p className="text-xs text-slate-400">24-hour window to veto trades</p>
              </div>
            </label>
          </div>

          {/* Scoring Notes */}
          <div className="card space-y-3">
            <h2 className="font-bold text-slate-900">Scoring & Rules Notes</h2>
            <textarea
              value={scoringNotes}
              onChange={(e) => setScoringNotes(e.target.value)}
              placeholder="Custom rules, house rules, or notes for your league members..."
              className="input min-h-[120px] resize-y"
              rows={4}
            />
          </div>

          {/* Save */}
          {error && <p className="text-flame text-sm font-medium">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </form>
      </main>
    </>
  );
}
