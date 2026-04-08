'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import type {
  League,
  ScoringWeights,
  SlotRules,
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_SLOT_RULES,
} from '@/types';

// Labels for the scoring weight fields
const STAT_FIELDS: { key: keyof ScoringWeights; label: string; group: string }[] = [
  { key: 'pts', label: 'Points', group: 'Scoring' },
  { key: 'fg3m', label: '3PM Bonus', group: 'Scoring' },
  { key: 'fgMissed', label: 'FG Missed', group: 'Scoring' },
  { key: 'ast', label: 'Assists', group: 'Playmaking' },
  { key: 'to', label: 'Turnovers', group: 'Playmaking' },
  { key: 'dreb', label: 'Def Rebounds', group: 'Rebounding' },
  { key: 'oreb', label: 'Off Rebounds', group: 'Rebounding' },
  { key: 'stl', label: 'Steals', group: 'Defense' },
  { key: 'blk', label: 'Blocks', group: 'Defense' },
  { key: 'pf', label: 'Personal Fouls', group: 'Penalties' },
  { key: 'tf', label: 'Technical Fouls', group: 'Penalties' },
  { key: 'ff', label: 'Flagrant Fouls', group: 'Penalties' },
  { key: 'doubleDouble', label: 'Double-Double', group: 'Milestones' },
  { key: 'tripleDouble', label: 'Triple-Double', group: 'Milestones' },
  { key: 'assists15', label: '15+ Assists', group: 'Milestones' },
  { key: 'rebounds20', label: '20+ Rebounds', group: 'Milestones' },
];

const SLOT_FIELDS: { key: keyof SlotRules; label: string; slot: string }[] = [
  { key: 'sixth_man_sim_min', label: 'Sim Target', slot: '6th Man' },
  { key: 'sixth_man_floor_min', label: 'Min Floor', slot: '6th Man' },
  { key: 'sixth_man_breakout_min', label: 'Breakout', slot: '6th Man' },
  { key: 'rotation_sim_min', label: 'Sim Target', slot: 'Rotation' },
  { key: 'rotation_floor_min', label: 'Min Floor', slot: 'Rotation' },
  { key: 'rotation_breakout_min', label: 'Breakout', slot: 'Rotation' },
];

export default function CommissionerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'general' | 'scoring' | 'slots'>('general');

  // General settings
  const [name, setName] = useState('');
  const [season, setSeason] = useState(2025);
  const [maxTeams, setMaxTeams] = useState(10);
  const [capLimit, setCapLimit] = useState(20);
  const [tradeDeadline, setTradeDeadline] = useState(18);
  const [commissionerVeto, setCommissionerVeto] = useState(true);
  const [draftType, setDraftType] = useState<'snake' | 'auction'>('snake');
  const [scoringNotes, setScoringNotes] = useState('');

  // Scoring weights
  const [weights, setWeights] = useState<ScoringWeights>({
    pts: 1, fg3m: 0.1, fgMissed: -0.1, ast: 1, to: -0.25,
    dreb: 1, oreb: 0.1, stl: 1.25, blk: 1.25,
    pf: -0.1, tf: -0.25, ff: -0.5,
    doubleDouble: 1, tripleDouble: 2, assists15: 2, rebounds20: 2,
  });

  // Slot rules
  const [slotRules, setSlotRules] = useState<SlotRules>({
    sixth_man_sim_min: 20, sixth_man_floor_min: 15, sixth_man_breakout_min: 25,
    rotation_sim_min: 10, rotation_floor_min: 8, rotation_breakout_min: 20,
  });

  useEffect(() => {
    fetch(`/api/leagues/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const l = json.data.league as League;
          setLeague(l);
          setIsCommissioner(json.data.isCommissioner);
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
            if (s.scoring_weights) setWeights(s.scoring_weights);
            if (s.slot_rules) setSlotRules(s.slot_rules);
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
          scoring_weights: weights,
          slot_rules: slotRules,
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

  const updateWeight = (key: keyof ScoringWeights, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) setWeights((w) => ({ ...w, [key]: num }));
  };

  const updateSlotRule = (key: keyof SlotRules, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num)) setSlotRules((r) => ({ ...r, [key]: num }));
  };

  if (loading) {
    return (<><Nav /><main className="page-container"><div className="card mx-5 mt-6 text-center py-12 text-slate-400">Loading...</div></main></>);
  }

  if (!isCommissioner) {
    return (
      <><Nav /><main className="page-container"><div className="card mx-5 mt-6 text-center py-12">
        <span className="text-4xl block mb-3">🔒</span>
        <p className="text-slate-500 font-medium">Commissioner access only</p>
        <button onClick={() => router.back()} className="btn-secondary inline-block mt-4">Go Back</button>
      </div></main></>
    );
  }

  const tabs = [
    { key: 'general' as const, label: 'General' },
    { key: 'scoring' as const, label: 'Scoring' },
    { key: 'slots' as const, label: 'Slots' },
  ];

  // Group scoring fields
  const groups = STAT_FIELDS.reduce<Record<string, typeof STAT_FIELDS>>((acc, f) => {
    (acc[f.group] ??= []).push(f);
    return acc;
  }, {});

  // Group slot fields
  const slotGroups = SLOT_FIELDS.reduce<Record<string, typeof SLOT_FIELDS>>((acc, f) => {
    (acc[f.slot] ??= []).push(f);
    return acc;
  }, {});

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
          <p className="page-subtitle">{league?.name}</p>
        </div>

        {/* Tab bar */}
        <div className="px-5 mb-4">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-white text-court shadow-sm'
                    : 'text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} className="px-5 space-y-5">

          {/* ===== GENERAL TAB ===== */}
          {tab === 'general' && (
            <>
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
                      <button key={size} type="button" onClick={() => setMaxTeams(size)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${maxTeams === size ? 'bg-court text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >{size}</button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{maxTeams} teams per league</p>
                </div>
              </div>

              <div className="card space-y-3">
                <h2 className="font-bold text-slate-900">Salary Cap</h2>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Cap Limit ($)</label>
                  <input type="number" min={10} max={50} step={0.5} value={capLimit} onChange={(e) => setCapLimit(Number(e.target.value))} className="input" />
                </div>
                <p className="text-xs text-slate-400">Tax: ${capLimit}–${capLimit + 2} (5%/$ penalty). Lockout: &gt;${capLimit + 2}.</p>
              </div>

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
                  <input type="checkbox" checked={commissionerVeto} onChange={(e) => setCommissionerVeto(e.target.checked)} className="w-5 h-5 rounded border-slate-300" />
                  <div>
                    <span className="text-sm font-medium text-slate-900">Commissioner Veto</span>
                    <p className="text-xs text-slate-400">24-hour window to veto trades</p>
                  </div>
                </label>
              </div>

              <div className="card space-y-3">
                <h2 className="font-bold text-slate-900">House Rules</h2>
                <textarea value={scoringNotes} onChange={(e) => setScoringNotes(e.target.value)} placeholder="Custom rules or notes for league members..." className="input min-h-[100px] resize-y" rows={3} />
              </div>
            </>
          )}

          {/* ===== SCORING TAB ===== */}
          {tab === 'scoring' && (
            <>
              <p className="text-xs text-slate-400">Set the point value for each stat category. Negative values are penalties.</p>
              {Object.entries(groups).map(([group, fields]) => (
                <div key={group} className="card space-y-2">
                  <h2 className="font-bold text-slate-900">{group}</h2>
                  {fields.map((f) => (
                    <div key={f.key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{f.label}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => updateWeight(f.key, String(weights[f.key] - 0.25))}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all">-</button>
                        <input type="number" step={0.05} value={weights[f.key]}
                          onChange={(e) => updateWeight(f.key, e.target.value)}
                          className="w-16 text-center text-sm font-bold border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:ring-1 focus:ring-court/30" />
                        <button type="button" onClick={() => updateWeight(f.key, String(weights[f.key] + 0.25))}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* ===== SLOTS TAB ===== */}
          {tab === 'slots' && (
            <>
              <p className="text-xs text-slate-400">
                Configure minute thresholds for simulation slots. Below floor = 0 pts. Above breakout = actual stats with milestones.
              </p>
              {Object.entries(slotGroups).map(([slot, fields]) => (
                <div key={slot} className="card space-y-3">
                  <h2 className="font-bold text-slate-900">{slot}</h2>
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{f.label} (minutes)</label>
                      <input type="number" min={0} max={48} value={slotRules[f.key]}
                        onChange={(e) => updateSlotRule(f.key, e.target.value)} className="input" />
                    </div>
                  ))}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                    {slot === '6th Man' ? (
                      <>&lt;{slotRules.sixth_man_floor_min} min = 0 pts &middot; {slotRules.sixth_man_floor_min}–{slotRules.sixth_man_breakout_min - 1} min = sim to {slotRules.sixth_man_sim_min} &middot; &ge;{slotRules.sixth_man_breakout_min} min = breakout</>
                    ) : (
                      <>&lt;{slotRules.rotation_floor_min} min = 0 pts &middot; {slotRules.rotation_floor_min}–{slotRules.rotation_breakout_min - 1} min = sim to {slotRules.rotation_sim_min} &middot; &ge;{slotRules.rotation_breakout_min} min = breakout</>
                    )}
                  </div>
                </div>
              ))}

              <div className="card space-y-2">
                <h2 className="font-bold text-slate-900">Coaching Bonus</h2>
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
                  <p>Within 2 min: <span className="font-bold text-emerald-600">+2.0</span></p>
                  <p>Within 5 min: <span className="font-bold text-emerald-600">+1.0</span></p>
                  <p>Within 10 min: <span className="font-bold text-slate-600">0.0</span></p>
                  <p>Over 10 min: <span className="font-bold text-flame">-1.0</span></p>
                  <p>Correct DNP: <span className="font-bold text-emerald-600">+2.0</span></p>
                  <p>Wrong DNP: <span className="font-bold text-flame">-3.0</span></p>
                </div>
              </div>
            </>
          )}

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
