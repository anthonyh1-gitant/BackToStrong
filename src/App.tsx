import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, Check, ChevronRight, CircleHelp, Dumbbell, House, Leaf, LockKeyhole, Menu, Moon, Play, Settings2, ShieldCheck, Sun, TrendingUp, WifiOff, X } from 'lucide-react'
import { addEvent, createWorkout, defaultPreferences, finishWorkout, loadState, localDate, loggedSets, newState, stateSchema, STORAGE_KEY } from './model'
import type { AppState, Preferences } from './model'
import { Onboarding } from './Onboarding'
import { WorkoutPlayer } from './WorkoutPlayer'
import { Completion, ExercisePreview, Plan, Progress, Today } from './Dashboard'
import { ResearchDialog, Settings } from './Settings'
import { Dialog, Logo } from './ui'
import type { Commit } from './ui'
import { useNow } from './useNow'
import './App.css'

type View = 'welcome' | 'onboarding' | 'today' | 'plan' | 'progress' | 'settings' | 'workout' | 'completion'
const routes: View[] = ['welcome', 'onboarding', 'today', 'plan', 'progress', 'settings', 'workout', 'completion']
const navigation = [{ view: 'today', name: 'Today', icon: House }, { view: 'plan', name: 'Plan', icon: CalendarDays }, { view: 'progress', name: 'Progress', icon: TrendingUp }, { view: 'settings', name: 'Settings', icon: Settings2 }] as const

function Welcome({ onBuild, onSample }: { onBuild: () => void; onSample: () => void }) {
  return <section className="welcome-page"><div className="welcome-top"><span className="pill beta-pill"><span />A GENTLER WAY BACK</span><span className="muted small">FREE EARLY BETA</span></div><div className="welcome-grid"><div className="welcome-copy"><p className="eyebrow">IT STARTS WITH A SMALL STEP</p><h1>Your first step<br />back to feeling<br /><em>strong.</em></h1><p>A manageable strength routine for adults returning to the gym. Know what to do, take it at your pace, and notice your progress.</p><div className="welcome-actions"><button className="button primary" onClick={onBuild}>Build my plan<ArrowRight size={19} /></button><button className="text-link" onClick={onSample}><Play size={16} />Explore a sample workout</button></div><p className="welcome-trust"><LockKeyhole size={14} />No account. No payment. Your progress stays with you.</p></div><div className="welcome-art"><div className="welcome-art-orbit" /><div className="welcome-art-symbol"><Dumbbell size={88} strokeWidth={1} /></div><div className="welcome-art-caption"><span>LESS PRESSURE. MORE POSSIBILITY.</span><h2>Start where<br />you are.</h2><p>One session at a time.</p></div><span className="floating-note"><Leaf size={19} />A little is a good start.</span></div></div><div className="welcome-steps">{[['01', 'Choose your routine.', 'A few questions. A plan that fits your week.'], ['02', 'Follow your session.', 'Clear steps and a comfortable pace.'], ['03', 'Build consistency.', 'Log your sets. See your own small wins.']].map(([n, title, description]) => <article key={n}><span>{n}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div><div className="early-version"><ShieldCheck size={23} /><div><strong>A small, honest first version.</strong><p>Includes sample routines, workout logging, and progress on this device. Templates need qualified trainer review before a public training launch. No cloud syncing, coaching, or technique videos yet.</p></div></div></section>
}

function App() {
  const [loaded] = useState(loadState)
  const [state, setState] = useState<AppState>(loaded.state)
  const current = useRef(state)
  const unreadable = useRef(Boolean(loaded.error))
  const [storageUnreadable, setStorageUnreadable] = useState(Boolean(loaded.error))
  const now = useNow()
  const pending = useRef<AppState | null>(null)
  const [error, setError] = useState(loaded.error)
  const [message, setMessage] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [menu, setMenu] = useState(false)
  const [view, setView] = useState<View>(() => {
    const hash = location.hash.slice(1) as View
    if (hash === 'settings') return 'settings'
    if (!loaded.state.preferences) return 'welcome'
    if (hash === 'workout' && loaded.state.active) return 'workout'
    return ['today', 'plan', 'progress'].includes(hash) ? hash : 'today'
  })
  const [modal, setModal] = useState<'help' | 'walkthrough' | 'reschedule' | 'research' | null>(null)
  const [preview, setPreview] = useState<{ index: number; short: boolean } | null>(null)
  const [completedId, setCompletedId] = useState<string | null>(null)
  const [reschedule, setReschedule] = useState(() => localDate(new Date()))

  const commit: Commit = fn => {
    if (unreadable.current) { setError('Your original saved data is unreadable and has been preserved. Export or reset it in Settings before making changes.'); return false }
    const next = fn(current.current)
    try {
      const verified = stateSchema.parse(next)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verified))
      current.current = verified; setState(verified); pending.current = null; setError('')
      return true
    } catch {
      pending.current = next
      setError('This change could not be saved. Your previous records are safe. Check browser storage or available space, then retry this change.')
      return false
    }
  }
  const navigate = (next: View) => {
    if (!current.current.preferences && ['today', 'plan', 'progress', 'workout'].includes(next)) { next = 'welcome'; setMessage('Build a plan or explore a sample to get started.') }
    setView(next); setMenu(false); location.hash = next
  }
  useEffect(() => {
    const handle = () => {
      const next = location.hash.slice(1) as View
      if (!routes.includes(next)) return
      if (next === 'settings' || next === 'welcome' || next === 'onboarding') setView(next)
      else if (current.current.preferences && next !== 'completion' && (next !== 'workout' || current.current.active)) setView(next)
    }
    window.addEventListener('hashchange', handle)
    return () => window.removeEventListener('hashchange', handle)
  }, [])
  useEffect(() => { document.getElementById('page-content')?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) }, [view])
  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.dataset.theme = state.theme === 'system' ? query.matches ? 'dark' : 'light' : state.theme }
    apply(); query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [state.theme])
  useEffect(() => {
    const handle = () => setOnline(navigator.onLine)
    window.addEventListener('online', handle); window.addEventListener('offline', handle)
    if (import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => setMessage('Offline support is unavailable in this browser. Your local records are still saved.'))
    return () => { window.removeEventListener('online', handle); window.removeEventListener('offline', handle) }
  }, [])
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(''), 7000); return () => clearTimeout(timer) }, [message])
  const beginOnboarding = () => {
    if (current.current.active) { setMessage('Finish or discard your saved workout before changing your plan.'); return }
    if (commit(s => addEvent(s, 'onboarding_started'))) navigate('onboarding')
  }
  const completeOnboarding = (preferences: Preferences) => {
    if (commit(s => addEvent(addEvent({ ...s, preferences, rescheduledDate: null, safetyHold: false }, 'onboarding_completed'), 'plan_created'))) { navigate('today'); if (!state.walkthroughDone) setModal('walkthrough'); setMessage('Your plan is saved on this device.') }
  }
  const startWorkout = (index?: number, short = false) => {
    if (current.current.safetyHold) { setPreview(null); setMessage('Please seek qualified guidance before following a routine. Review your answers when exercise is appropriate.'); setModal('help'); return }
    if (current.current.active) { setPreview(null); navigate('workout'); return }
    if (commit(s => { const p = s.preferences || defaultPreferences; if (p.concern !== 'none') return s; let next = { ...s, preferences: p, active: createWorkout(p, index ?? s.history.length % p.frequency, short) }; if (!s.preferences) next = addEvent(next, 'plan_created') as typeof next; return addEvent(next, 'workout_started') })) { setPreview(null); navigate('workout') }
  }
  const finish = (early: boolean) => {
    const active = current.current.active
    if (!active) return
    if (loggedSets(active) === 0) { if (commit(s => ({ ...s, active: null }))) { navigate('today'); setMessage('Session discarded. No activity was added to your history.') } return }
    if (commit(s => finishWorkout(s, early))) { setCompletedId(active.id); navigate('completion') }
  }
  const reset = () => {
    try { localStorage.removeItem(STORAGE_KEY); const fresh = newState(); current.current = fresh; setState(fresh); unreadable.current = false; setStorageUnreadable(false); pending.current = null; setError(''); setPreview(null); setModal(null); navigate('welcome'); setMessage('All Back to Strong data on this device has been deleted.'); return true }
    catch { setError('The browser blocked deletion. Your data has not been removed. Check browser storage permissions and try again.'); return false }
  }
  const finishWalkthrough = () => { if (commit(s => ({ ...s, walkthroughDone: true }))) setModal(null) }
  const openPreview = (index: number, short = false) => setPreview({ index, short })

  return <div className="app-shell"><a className="skip-link" href="#page-content">Skip to content</a><aside className={`sidebar ${menu ? 'open' : ''}`}><button className="brand-button" aria-label="Back to Strong home" onClick={() => navigate(state.preferences ? 'today' : 'welcome')}><Logo /></button><p className="sidebar-label">YOUR SPACE TO START</p><nav aria-label="Main navigation">{navigation.map(item => <button key={item.view} onClick={() => navigate(item.view)} className={`nav-item ${view === item.view || item.view === 'today' && ['welcome', 'onboarding', 'workout', 'completion'].includes(view) ? 'active' : ''}`} aria-current={view === item.view ? 'page' : undefined}><item.icon size={21} strokeWidth={1.7} /><span>{item.name}</span>{item.view === 'today' && <span className="nav-dot" />}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><Leaf size={23} /><p>Strong starts<br />with showing up.</p><span>AT YOUR OWN PACE.</span></div><button className="sidebar-help" onClick={() => setModal('help')}><CircleHelp size={19} />A little guidance<ChevronRight size={15} /></button><div className="sidebar-version"><span className="beta-dot" />EARLY BETA<span>v0.1</span></div></div></aside>{menu && <button className="sidebar-scrim" onClick={() => setMenu(false)} aria-label="Close navigation menu" />}
    <div className="main-shell"><header className="topbar"><button className="mobile-logo brand-button" onClick={() => navigate(state.preferences ? 'today' : 'welcome')} aria-label="Back to Strong home"><Logo /></button><span className="topbar-context">A little structure. A little confidence.</span><div className="topbar-right"><span className="beta-label">EARLY BETA</span><button className="icon-button" aria-label={state.theme === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'} onClick={() => commit(s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}>{state.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><span className="guest-avatar" role="img" aria-label="Guest, no account">G</span><button className="icon-button menu-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} onClick={() => setMenu(!menu)}>{menu ? <X size={21} /> : <Menu size={21} />}</button></div></header>
    <main id="page-content" tabIndex={-1} className="page-content">{!online && <div className="offline-banner"><WifiOff size={17} />You’re offline. Your plan and logs stay on this device.</div>}{error && <div className="save-error" role="alert"><p>{error}</p><div><button className="button secondary" onClick={() => pending.current ? commit(() => pending.current!) : location.reload()}>Retry</button><button className="button secondary" onClick={() => navigate('settings')}>Storage settings</button></div></div>}
    {view === 'welcome' && <Welcome onBuild={beginOnboarding} onSample={() => openPreview(0)} />}
    {view === 'onboarding' && <Onboarding onSafetyStop={() => commit(s => ({ ...s, safetyHold: true, active: null }))} initial={state.safetyHold ? { ...(state.preferences || defaultPreferences), concern: 'restriction' } : state.preferences} onComplete={completeOnboarding} onCancel={() => navigate(state.preferences ? 'today' : 'welcome')} />}
    {view === 'today' && state.preferences && <Today state={state} onPreview={openPreview} onStart={short => startWorkout(undefined, short)} onResume={() => navigate('workout')} onHelp={() => setModal('help')} onPlan={() => navigate('plan')} onReschedule={() => { setReschedule(state.rescheduledDate || localDate(new Date())); setModal('reschedule') }} />}
    {view === 'plan' && state.preferences && <Plan state={state} commit={commit} onPreferences={beginOnboarding} onPreview={openPreview} />}
    {view === 'progress' && state.preferences && <Progress state={state} />}
    {view === 'settings' && <Settings state={state} commit={commit} onPreferences={beginOnboarding} onHelp={() => setModal('help')} onFeedback={() => setModal('research')} onReset={reset} storageError={storageUnreadable} />}
    {view === 'workout' && state.active && <WorkoutPlayer state={state} commit={commit} onLeave={() => navigate('today')} onFinish={finish} />}
    {view === 'completion' && completedId && state.history.some(w => w.id === completedId) && <Completion state={state} id={completedId} commit={commit} onToday={() => navigate('today')} onProgress={() => navigate('progress')} onResearch={() => setModal('research')} />}
    </main><footer className="app-footer"><span>BACK TO STRONG</span><p>Your first step back to feeling strong.</p><span><LockKeyhole size={12} />Private to this device</span></footer></div>
    <nav className="bottom-nav" aria-label="Mobile navigation">{navigation.map(item => <button key={item.view} className={view === item.view || item.view === 'today' && ['welcome', 'workout', 'completion', 'onboarding'].includes(view) ? 'active' : ''} aria-current={view === item.view ? 'page' : undefined} onClick={() => navigate(item.view)}><item.icon size={22} strokeWidth={1.7} /><span>{item.name}</span></button>)}</nav>{message && <div className="toast" role="status"><Check size={17} /><span>{message}</span><button className="icon-button" aria-label="Dismiss message" onClick={() => setMessage('')}><X size={16} /></button></div>}
    {preview && <ExercisePreview preferences={state.preferences || defaultPreferences} index={preview.index} short={preview.short} onClose={() => setPreview(null)} onStart={() => startWorkout(preview.index, preview.short)} />}
    {modal === 'research' && <ResearchDialog state={state} commit={commit} onClose={() => setModal(null)} />}
    {(modal === 'help' || modal === 'walkthrough') && <Dialog title={modal === 'walkthrough' ? 'Your first session, made simple.' : 'A little guidance.'} onClose={modal === 'walkthrough' ? finishWalkthrough : () => setModal(null)}><div className="help-steps"><div><span>01</span><section><h3>Choose your routine.</h3><p>Pick equipment, time, and days that fit. Preview your sample session from Today or Plan. These templates still need qualified trainer review.</p></section></div><div><span>02</span><section><h3>Follow your session.</h3><p>Start with easy movement. A rep is one repetition; a set is a group of reps. Enter what you actually do, then tap the check to log each set. Take breaks, swap using preset options, or skip when needed.</p></section></div><div><span>03</span><section><h3>Build consistency.</h3><p>Your logs save as you go. Come back to resume, or finish early. Progress uses only your logged activity. There’s no automatic increase in weights.</p></section></div></div><div className="soft-callout"><ShieldCheck size={23} /><p>For pain, an injury, a medical restriction, or uncertainty about exercise, seek qualified professional guidance before following a routine. This app cannot assess those situations.</p></div><p className="muted small">Everything is saved on this device. No cloud syncing or account is included. Core features are free during this beta.</p><div className="button-row">{modal === 'walkthrough' && <button className="button secondary" onClick={finishWalkthrough}>Skip walkthrough</button>}<button className="button primary" onClick={modal === 'walkthrough' ? finishWalkthrough : () => setModal(null)}>Got it<Check size={17} /></button></div></Dialog>}
    {modal === 'reschedule' && <Dialog title="Plans can move. That’s okay." onClose={() => setModal(null)}><p>Choose another day for your next session. Your regular training days stay the same.</p><form onSubmit={e => { e.preventDefault(); if (reschedule < localDate(new Date()) || !reschedule) return; if (commit(s => ({ ...s, rescheduledDate: reschedule }))) { setModal(null); setMessage('Your next session has been moved.') } }}><label htmlFor="new-session-date">New session date</label><input id="new-session-date" required type="date" value={reschedule} min={localDate(now)} onChange={e => setReschedule(e.target.value)} /><button className="button primary full-width">Move session<ArrowRight size={17} /></button></form></Dialog>}
  </div>
}
export default App
