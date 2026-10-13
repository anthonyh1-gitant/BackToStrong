import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight, Leaf, ShieldCheck, X } from 'lucide-react'

export function Logo() {
  return <span className="brand"><span className="brand-mark"><Leaf size={23} strokeWidth={1.7} /></span><span>back to <strong>strong</strong><small>ONE SESSION AT A TIME</small></span></span>
}
export function SampleNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`sample-notice ${compact ? 'compact' : ''}`}><ShieldCheck size={18} /><p><strong>Sample routine · trainer review pending</strong>{!compact && <span>These beginner-oriented templates have not been professionally reviewed. They are not rehabilitation programmes. Stop if movement causes pain, and seek qualified guidance if you have a concern.</span>}</p></div>
}
export function PageHeader({ eyebrow, title, children, action }: { eyebrow: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children && <p className="page-description">{children}</p>}</div>{action}</header>
}
export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null)
  const callback = useRef(onClose)
  useEffect(() => { callback.current = onClose }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const root = container.current!
    const getControls = () => Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea, select, a[href], [tabindex="0"]')).filter(el => el.getClientRects().length)
    getControls()[0]?.focus()
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') callback.current()
      if (event.key === 'Tab') {
        const controls = getControls(), first = controls[0], last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handle)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handle); previous?.focus() }
  }, [])
  return <div className="dialog-backdrop"><div ref={container} className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={21} /></button></div>{children}</div></div>
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="text-link" onClick={onClick}>{children}<ArrowUpRight size={16} /></button>
}
export type Commit = (update: (state: import('./model').AppState) => import('./model').AppState) => boolean
