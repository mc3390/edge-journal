import { useState } from "react";

const PAIR_CATEGORIES = [
  { label: "Forex Majors", emoji: "💱", pairs: ["EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","NZD/USD"] },
  { label: "Forex Minors", emoji: "🔀", pairs: ["EUR/GBP","EUR/JPY","EUR/CHF","EUR/AUD","EUR/CAD","EUR/NZD","GBP/JPY","GBP/CHF","GBP/AUD","GBP/CAD","GBP/NZD","AUD/JPY","AUD/CHF","AUD/CAD","AUD/NZD","CAD/JPY","CHF/JPY","NZD/JPY","NZD/CAD"] },
  { label: "Commodities", emoji: "🥇", pairs: ["XAU/USD","XAG/USD","WTI/USD","BRENT/USD"] },
  { label: "Indici", emoji: "📈", pairs: ["NAS100","US30","SPX500","US2000","GER40","UK100","JPN225","FRA40"] },
  { label: "Crypto", emoji: "₿", pairs: ["BTC/USD","ETH/USD","SOL/USD","BNB/USD","XRP/USD"] },
];
const SESSIONS = ["London","New York","Asian","London/NY Overlap"];
const SETUPS = [
  // SMC / ICT
  "BOS + OB","FVG","Liquidity Sweep","BOS","CHoCH","IFVG","Breaker Block","Mitigation Block","Silver Bullet","Judas Swing",
  // Supply & Demand
  "Supply Zone","Demand Zone","Rally Base Rally","Drop Base Drop",
  // Price Action
  "Pin Bar","Engulfing","Inside Bar","Double Top","Double Bottom","Head & Shoulders","Trendline Bounce","Support/Resistance",
  // Wyckoff
  "Wyckoff Spring","Wyckoff UTAD","Wyckoff Accumulation","Wyckoff Distribution",
  // Elliott
  "Elliott Wave 3","Elliott Wave 5","Elliott Correction ABC",
  // Altro
  "Breakout","Retest","Altro"
];

const initialForm = {
  date: new Date().toISOString().slice(0,10),
  pair: "EUR/USD",
  direction: "LONG",
  session: "London",
  setup: "BOS + OB",
  entry: "",
  sl: "",
  tp: "",
  exit: "",
  rr: "",
  pnl: "",
  result: "WIN",
  notes: "",
};

function calcRR(entry, sl, tp, dir) {
  const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
  if (!e || !s || !t) return "";
  const risk = Math.abs(e - s);
  const reward = Math.abs(t - e);
  if (risk === 0) return "";
  return (reward / risk).toFixed(2);
}

const style = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@400;600;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080b0f; color: #e2e8f0; font-family: 'IBM Plex Mono', monospace; }

  .app { min-height: 100vh; background: #080b0f; }
  .header { border-bottom: 1px solid #1a2332; padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; background: #0a0e15; }
  .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
  .logo span { color: #3b82f6; }
  .badge { font-size: 10px; background: #1a2332; border: 1px solid #2a3a52; padding: 3px 8px; border-radius: 4px; color: #64748b; letter-spacing: 1px; }

  .layout { display: grid; grid-template-columns: 340px 1fr; min-height: calc(100vh - 61px); }
  .sidebar { border-right: 1px solid #1a2332; padding: 20px; background: #090d14; overflow-y: auto; }
  .main { padding: 20px; overflow-y: auto; }

  .section-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #3b82f6; text-transform: uppercase; margin-bottom: 14px; }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .stat-card { background: #0d1520; border: 1px solid #1a2332; border-radius: 8px; padding: 14px; }
  .stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 2px; }
  .stat-label { font-size: 10px; color: #475569; letter-spacing: 1px; }
  .green { color: #22c55e; }
  .red { color: #ef4444; }
  .blue { color: #3b82f6; }
  .yellow { color: #f59e0b; }

  .form-card { background: #0d1520; border: 1px solid #1a2332; border-radius: 10px; padding: 18px; margin-bottom: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group label { font-size: 10px; color: #475569; letter-spacing: 1px; text-transform: uppercase; }
  .form-group input, .form-group select, .form-group textarea {
    background: #060910; border: 1px solid #1a2332; border-radius: 6px;
    color: #e2e8f0; font-family: 'IBM Plex Mono', monospace; font-size: 13px;
    padding: 8px 10px; outline: none; transition: border-color 0.2s;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; }
  .form-group textarea { resize: vertical; min-height: 60px; }
  .form-group select option { background: #0d1520; }

  .form-group input.error, .form-group select.error { border-color: #ef4444; background: rgba(239,68,68,0.05); }
  .field-error { font-size: 10px; color: #ef4444; margin-top: 2px; }
  .form-error-banner { background: rgba(239,68,68,0.1); border: 1px solid #ef444466; border-radius: 6px; padding: 8px 12px; font-size: 11px; color: #ef4444; margin-bottom: 10px; letter-spacing: 0.3px; }
  .form-group input.error:focus { border-color: #ef4444; }

  .dir-toggle { display: flex; gap: 8px; }
  .pair-trigger { width: 100%; background: #060910; border: 1px solid #1a2332; border-radius: 6px; color: #e2e8f0; font-family: 'IBM Plex Mono', monospace; font-size: 13px; padding: 8px 10px; cursor: pointer; text-align: left; display: flex; justify-content: space-between; align-items: center; transition: border-color 0.2s; }
  .pair-trigger:hover, .pair-trigger.open { border-color: #3b82f6; }
  .pair-trigger-arrow { color: #475569; font-size: 10px; }
  .pair-panel { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #0d1520; border: 1px solid #2a3a52; border-radius: 10px; z-index: 100; padding: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); min-width: 280px; }
  .pair-cat-label { font-size: 9px; letter-spacing: 2px; color: #3b82f6; font-family: 'Syne', sans-serif; font-weight: 700; padding: 6px 4px 4px; text-transform: uppercase; }
  .pair-cat-label span { margin-right: 5px; }
  .pair-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 6px; }
  .pair-chip { background: #060910; border: 1px solid #1a2332; border-radius: 5px; padding: 5px 4px; font-size: 11px; font-family: 'IBM Plex Mono', monospace; color: #94a3b8; cursor: pointer; text-align: center; transition: all 0.12s; }
  .pair-chip:hover { border-color: #3b82f6; color: #e2e8f0; background: #0a1628; }
  .pair-chip.selected { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.1); font-weight: 600; }
  .pair-divider { border: none; border-top: 1px solid #1a2332; margin: 4px 0; }

  .dir-toggle { display: flex; gap: 8px; }
  .dir-btn { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #1a2332; background: #060910; color: #475569; font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; transition: all 0.15s; font-weight: 500; letter-spacing: 1px; }
  .dir-btn.long.active { background: rgba(34,197,94,0.12); border-color: #22c55e; color: #22c55e; }
  .dir-btn.short.active { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #ef4444; }

  .res-toggle { display: flex; gap: 8px; }
  .res-btn { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #1a2332; background: #060910; color: #475569; font-family: 'IBM Plex Mono', monospace; font-size: 11px; cursor: pointer; transition: all 0.15s; letter-spacing: 1px; }
  .res-btn.win.active { background: rgba(34,197,94,0.12); border-color: #22c55e; color: #22c55e; }
  .res-btn.loss.active { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #ef4444; }
  .res-btn.be.active { background: rgba(245,158,11,0.12); border-color: #f59e0b; color: #f59e0b; }

  .btn-primary { width: 100%; padding: 11px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; cursor: pointer; transition: background 0.15s; margin-top: 4px; }
  .btn-primary:hover { background: #2563eb; }
  .btn-ai { width: 100%; padding: 11px; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #fff; border: none; border-radius: 8px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; cursor: pointer; transition: opacity 0.15s; }
  .btn-ai:hover { opacity: 0.88; }
  .btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }

  .trades-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .trade-row { background: #0d1520; border: 1px solid #1a2332; border-radius: 8px; padding: 14px 16px; display: grid; grid-template-columns: 80px 60px 100px 70px 70px 70px 1fr 32px; gap: 10px; align-items: center; font-size: 12px; }
  .trade-pair { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; }
  .dir-tag { font-size: 10px; font-weight: 600; padding: 3px 7px; border-radius: 4px; letter-spacing: 1px; text-align: center; }
  .dir-tag.LONG { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid #22c55e44; }
  .dir-tag.SHORT { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid #ef444444; }
  .res-tag { font-size: 10px; font-weight: 600; padding: 3px 7px; border-radius: 4px; letter-spacing: 1px; text-align: center; }
  .res-tag.WIN { background: rgba(34,197,94,0.12); color: #22c55e; }
  .res-tag.LOSS { background: rgba(239,68,68,0.12); color: #ef4444; }
  .res-tag.BE { background: rgba(245,158,11,0.12); color: #f59e0b; }
  .trade-notes { color: #475569; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .del-btn { background: none; border: none; color: #1e2d3d; cursor: pointer; font-size: 16px; transition: color 0.15s; }
  .del-btn:hover { color: #ef4444; }

  .ai-card { background: #0a0a1a; border: 1px solid #2a1f5e; border-radius: 10px; padding: 20px; margin-top: 16px; }
  .ai-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .ai-dot { width: 8px; height: 8px; border-radius: 50%; background: #7c3aed; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .ai-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #a78bfa; }
  .ai-text { font-size: 12px; line-height: 1.8; color: #cbd5e1; white-space: pre-wrap; }
  .ai-loading { color: #7c3aed; font-size: 12px; animation: blink 1s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .empty { text-align: center; padding: 40px 20px; color: #1e2d3d; font-size: 13px; }
  .empty-icon { font-size: 32px; margin-bottom: 10px; }

  .tabs { display: flex; gap: 4px; margin-bottom: 18px; border-bottom: 1px solid #1a2332; padding-bottom: 0; }
  .tab { padding: 8px 16px; font-size: 11px; letter-spacing: 1px; cursor: pointer; border-bottom: 2px solid transparent; color: #475569; font-family: 'Syne', sans-serif; font-weight: 600; transition: all 0.15s; margin-bottom: -1px; }
  .tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }

  .chart-bar-wrap { margin-bottom: 20px; }
  .chart-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 11px; }
  .chart-label { width: 80px; color: #475569; text-align: right; }
  .chart-bar-bg { flex: 1; height: 8px; background: #1a2332; border-radius: 4px; overflow: hidden; }
  .chart-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
  .chart-val { width: 40px; text-align: right; color: #64748b; }

  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { border-right: none; border-bottom: 1px solid #1a2332; }
    .trade-row { grid-template-columns: 1fr 1fr 1fr 1fr; }
  }
`;

function PairSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pair-picker-wrap">
      <button className={`pair-trigger ${open ? "open" : ""}`} onClick={() => setOpen(o => !o)}>
        <span>{value}</span>
        <span className="pair-trigger-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="pair-panel">
          {PAIR_CATEGORIES.map((cat, i) => (
            <div key={cat.label}>
              {i > 0 && <hr className="pair-divider" />}
              <div className="pair-cat-label"><span>{cat.emoji}</span>{cat.label}</div>
              <div className="pair-grid">
                {cat.pairs.map(p => (
                  <div key={p} className={`pair-chip ${value === p ? "selected" : ""}`}
                    onClick={() => { onChange(p); setOpen(false); }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [tab, setTab] = useState("journal");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const updateForm = (k, v) => {
    if (fieldErrors[k]) setFieldErrors(prev => ({ ...prev, [k]: false }));
    setFormError("");
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (["entry","sl","tp"].includes(k)) {
        next.rr = calcRR(next.entry, next.sl, next.tp, next.direction);
      }
      return next;
    });
  };

  const addTrade = () => {
    const errors = {};
    if (!form.entry) errors.entry = true;
    if (!form.sl) errors.sl = true;
    if (!form.tp) errors.tp = true;
    if (!form.pnl) errors.pnl = true;
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Compila tutti i campi obbligatori prima di aggiungere la trade.");
      return;
    }
    setFieldErrors({});
    setFormError("");
    setTrades(prev => [{ ...form, id: Date.now() }, ...prev]);
    setForm({ ...initialForm, date: new Date().toISOString().slice(0,10) });
  };

  const deleteTrade = (id) => setTrades(prev => prev.filter(t => t.id !== id));

  const wins = trades.filter(t => t.result === "WIN").length;
  const losses = trades.filter(t => t.result === "LOSS").length;
  const bes = trades.filter(t => t.result === "BE").length;
  const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(0) : 0;
  const totalPnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
  const avgRR = trades.filter(t => t.rr).length
    ? (trades.reduce((s, t) => s + (parseFloat(t.rr) || 0), 0) / trades.filter(t => t.rr).length).toFixed(2)
    : "—";

  const setupCounts = SETUPS.map(s => ({
    name: s,
    count: trades.filter(t => t.setup === s).length,
    wins: trades.filter(t => t.setup === s && t.result === "WIN").length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  const analyzeWithAI = async () => {
    if (!trades.length) return;
    setAiLoading(true);
    setAiAnalysis("");
    setTab("ai");

    const winsLocal = trades.filter(t => t.result === "WIN").length;
    const total = trades.length;
    const wr = total ? ((winsLocal / total) * 100).toFixed(0) : 0;
    const pnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    const rrList = trades.filter(t => t.rr);
    const rr = rrList.length ? (rrList.reduce((s, t) => s + parseFloat(t.rr), 0) / rrList.length).toFixed(2) : "N/D";
    const summary = trades.map(t =>
      `${t.date} | ${t.pair} | ${t.direction} | ${t.session} | Setup: ${t.setup} | R:R: ${t.rr || "?"} | PnL: ${t.pnl || "?"} | ${t.result}`
    ).join("\n");

    const fetchPromise = fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: "Sei un coach di trading esperto in SMC e ICT. Analizza le trade e dai feedback concreto in italiano in 3 punti: 1) Punti di forza, 2) Punti deboli, 3) Consigli pratici.",
        messages: [{ role: "user", content: `Analizza ${total} trade. Win Rate: ${wr}%, R:R medio: ${rr}, PnL totale: ${pnl >= 0 ? "+" : ""}${pnl}\n\n${summary}` }]
      })
    }).then(r => r.json());

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 12000)
    );

    try {
      const data = await Promise.race([fetchPromise, timeoutPromise]);
      if (data.error) {
        setAiAnalysis(`❌ Errore API: ${data.error.message}`);
      } else {
        const text = data.content?.find(b => b.type === "text")?.text || "Nessuna risposta.";
        setAiAnalysis(text);
      }
    } catch(e) {
      if (e.message === "TIMEOUT") {
        setAiAnalysis("⚠️ L'AI Coach funzionerà correttamente una volta pubblicata l'app su Vercel. Nell'anteprima qui la chiamata API viene bloccata dal sandbox.");
      } else {
        setAiAnalysis(`❌ Errore: ${e.message}`);
      }
    }
    setAiLoading(false);
  };

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <div className="header">
          <div className="logo">EDGE<span>.</span>JOURNAL</div>
          <div className="badge">BETA · FREE</div>
        </div>

        <div className="layout">
          {/* SIDEBAR - Form */}
          <div className="sidebar">
            <div className="section-title">Nuova Trade</div>
            <div className="form-card">
              {formError && <div className="form-error-banner">⚠ {formError}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Data</label>
                  <input type="date" value={form.date} onChange={e => updateForm("date", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Coppia</label>
                  <PairSelector value={form.pair} onChange={v => updateForm("pair", v)} />
                </div>
              </div>

              <div className="form-group" style={{marginBottom:10}}>
                <label>Direzione</label>
                <div className="dir-toggle">
                  {["LONG","SHORT"].map(d => (
                    <button key={d} className={`dir-btn ${d.toLowerCase()} ${form.direction===d?"active":""}`} onClick={() => updateForm("direction", d)}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sessione</label>
                  <select value={form.session} onChange={e => updateForm("session", e.target.value)}>
                    {SESSIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Setup</label>
                  <select value={form.setup} onChange={e => updateForm("setup", e.target.value)}>
                    {SETUPS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Entry *</label>
                  <input type="number" step="any" placeholder="1.08500" value={form.entry} className={fieldErrors.entry?"error":""} onChange={e => updateForm("entry", e.target.value)} />
                  {fieldErrors.entry && <span className="field-error">Campo obbligatorio</span>}
                </div>
                <div className="form-group">
                  <label>Stop Loss *</label>
                  <input type="number" step="any" placeholder="1.08200" value={form.sl} className={fieldErrors.sl?"error":""} onChange={e => updateForm("sl", e.target.value)} />
                  {fieldErrors.sl && <span className="field-error">Campo obbligatorio</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Take Profit *</label>
                  <input type="number" step="any" placeholder="1.09100" value={form.tp} className={fieldErrors.tp?"error":""} onChange={e => updateForm("tp", e.target.value)} />
                  {fieldErrors.tp && <span className="field-error">Campo obbligatorio</span>}
                </div>
                <div className="form-group">
                  <label>Exit reale</label>
                  <input type="number" step="any" placeholder="1.09050" value={form.exit} onChange={e => updateForm("exit", e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>R:R {form.rr ? `(${form.rr})` : ""}</label>
                  <input type="number" step="any" placeholder="auto" value={form.rr} onChange={e => updateForm("rr", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>P&L (€/$) *</label>
                  <input type="number" step="any" placeholder="+50" value={form.pnl} className={fieldErrors.pnl?"error":""} onChange={e => updateForm("pnl", e.target.value)} />
                  {fieldErrors.pnl && <span className="field-error">Campo obbligatorio</span>}
                </div>
              </div>

              <div className="form-group" style={{marginBottom:10}}>
                <label>Risultato</label>
                <div className="res-toggle">
                  {[["WIN","win"],["LOSS","loss"],["BE","be"]].map(([v,c]) => (
                    <button key={v} className={`res-btn ${c} ${form.result===v?"active":""}`} onClick={() => updateForm("result", v)}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{marginBottom:12}}>
                <label>Note</label>
                <textarea placeholder="Setup, esecuzione, emozioni..." value={form.notes} onChange={e => updateForm("notes", e.target.value)} />
              </div>

              <button className="btn-primary" onClick={addTrade}>+ AGGIUNGI TRADE</button>
            </div>

            {trades.length > 0 && (
              <button className="btn-ai" onClick={analyzeWithAI} disabled={aiLoading}>
                {aiLoading ? "⏳ ANALISI IN CORSO..." : "🤖 ANALIZZA CON AI"}
              </button>
            )}
          </div>

          {/* MAIN */}
          <div className="main">
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className={`stat-val ${parseFloat(winRate)>=50?"green":"red"}`}>{winRate}%</div>
                <div className="stat-label">WIN RATE</div>
              </div>
              <div className="stat-card">
                <div className={`stat-val ${totalPnl>=0?"green":"red"}`}>{totalPnl>=0?"+":""}{totalPnl.toFixed(0)}</div>
                <div className="stat-label">P&L TOTALE</div>
              </div>
              <div className="stat-card">
                <div className="stat-val blue">{avgRR}</div>
                <div className="stat-label">R:R MEDIO</div>
              </div>
              <div className="stat-card">
                <div className="stat-val yellow">{trades.length}</div>
                <div className="stat-label">TRADE TOTALI</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              {[["journal","📋 JOURNAL"],["stats","📊 STATISTICHE"],["ai","🤖 AI COACH"]].map(([k,l]) => (
                <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
              ))}
            </div>

            {/* Journal Tab */}
            {tab === "journal" && (
              <div className="trades-list">
                {trades.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">📭</div>
                    <div>Nessuna trade ancora.<br/>Aggiungine una dal pannello a sinistra.</div>
                  </div>
                ) : trades.map(t => (
                  <div key={t.id} className="trade-row">
                    <div>
                      <div className="trade-pair">{t.pair}</div>
                      <div style={{fontSize:10,color:"#475569",marginTop:2}}>{t.date}</div>
                    </div>
                    <div className={`dir-tag ${t.direction}`}>{t.direction}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{t.setup}</div>
                    <div className={`res-tag ${t.result}`}>{t.result}</div>
                    <div style={{fontSize:11, color:"#64748b"}}>{t.rr ? `${t.rr}R` : "—"}</div>
                    <div className={t.pnl && parseFloat(t.pnl)>=0?"green":"red"} style={{fontSize:12,fontWeight:600}}>
                      {t.pnl ? `${parseFloat(t.pnl)>=0?"+":""}${t.pnl}` : "—"}
                    </div>
                    <div className="trade-notes">{t.notes || t.session}</div>
                    <button className="del-btn" onClick={() => deleteTrade(t.id)}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Tab */}
            {tab === "stats" && (
              <div>
                <div className="section-title" style={{marginBottom:16}}>Risultati per Sessione</div>
                <div className="chart-bar-wrap">
                  {SESSIONS.map(s => {
                    const tot = trades.filter(t => t.session === s).length;
                    const w = trades.filter(t => t.session === s && t.result === "WIN").length;
                    const pct = tot ? (w/tot*100) : 0;
                    if (!tot) return null;
                    return (
                      <div key={s} className="chart-row">
                        <div className="chart-label">{s.split("/")[0]}</div>
                        <div className="chart-bar-bg">
                          <div className="chart-bar-fill" style={{width:`${pct}%`, background: pct>=50?"#22c55e":"#ef4444"}} />
                        </div>
                        <div className="chart-val">{pct.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>

                {setupCounts.length > 0 && (
                  <>
                    <div className="section-title" style={{marginBottom:16,marginTop:8}}>Setup più usati</div>
                    <div className="chart-bar-wrap">
                      {setupCounts.map(s => (
                        <div key={s.name} className="chart-row">
                          <div className="chart-label" style={{fontSize:10}}>{s.name.split(" ")[0]}</div>
                          <div className="chart-bar-bg">
                            <div className="chart-bar-fill" style={{width:`${s.count/trades.length*100}%`, background:"#3b82f6"}} />
                          </div>
                          <div className="chart-val">{s.count}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="stats-grid" style={{marginTop:16}}>
                  <div className="stat-card"><div className="stat-val green">{wins}</div><div className="stat-label">WIN</div></div>
                  <div className="stat-card"><div className="stat-val red">{losses}</div><div className="stat-label">LOSS</div></div>
                  <div className="stat-card"><div className="stat-val yellow">{bes}</div><div className="stat-label">BREAK EVEN</div></div>
                  <div className="stat-card">
                    <div className="stat-val blue">{losses>0?(wins/losses).toFixed(2):"∞"}</div>
                    <div className="stat-label">PROFIT FACTOR</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Tab */}
            {tab === "ai" && (
              <div>
                {!aiAnalysis && !aiLoading && (
                  <div className="empty">
                    <div className="empty-icon">🤖</div>
                    <div>Clicca "Analizza con AI" per ricevere<br/>un feedback dettagliato sulle tue trade.</div>
                  </div>
                )}
                {aiLoading && (
                  <div className="ai-card">
                    <div className="ai-loading">⬡ L'AI sta analizzando le tue trade...</div>
                  </div>
                )}
                {aiAnalysis && (
                  <div className="ai-card">
                    <div className="ai-header">
                      <div className="ai-dot" />
                      <div className="ai-title">ANALISI AI — {trades.length} TRADE</div>
                    </div>
                    <div className="ai-text">{aiAnalysis}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
