import { useEffect, useMemo, useRef, useState } from 'react';

type AppId = 'classic' | 'redux' | 'mobx' | 'mfe';

interface Props {
  label: string;
  current: AppId;
}

const apps: Array<{ id: AppId; title: string; port: string }> = [
  { id: 'classic', title: 'Classic', port: '80' },
  { id: 'redux', title: 'Redux', port: '8081' },
  { id: 'mobx', title: 'MobX', port: '8082' },
  { id: 'mfe', title: 'MFE', port: '8083' },
];

export default function FloatingAppTag({ label, current }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const originBase = useMemo(() => {
    if (typeof window === 'undefined') return 'http://localhost';
    return `${window.location.protocol}//${window.location.hostname}`;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const tick = () => {
      velocityRef.current *= 0.84;
      offsetRef.current += velocityRef.current;
      offsetRef.current *= 0.92;
      const clamped = Math.max(-12, Math.min(12, offsetRef.current));
      el.style.setProperty('--tag-scroll-offset', `${clamped.toFixed(2)}px`);

      if (Math.abs(velocityRef.current) > 0.05 || Math.abs(offsetRef.current) > 0.05) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        offsetRef.current = 0;
        velocityRef.current = 0;
        el.style.setProperty('--tag-scroll-offset', '0px');
        rafRef.current = null;
      }
    };

    const kick = (delta: number) => {
      velocityRef.current += delta * -0.02;
      velocityRef.current = Math.max(-2.2, Math.min(2.2, velocityRef.current));
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => kick(e.deltaY);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') kick(90);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') kick(-90);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) setOpen(false);
    };
    window.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClickOutside);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function targetUrl(port: string): string {
    return port === '80' ? `${originBase}/` : `${originBase}:${port}/`;
  }

  function openHere(port: string) {
    window.location.href = targetUrl(port);
  }

  function openInNewTab(port: string) {
    window.open(targetUrl(port), '_blank', 'noopener,noreferrer');
  }

  return (
    <div ref={rootRef} className="floating-app-tag" aria-hidden>
      <button
        type="button"
        className="floating-app-tag__chip"
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть меню приложений"
      >
        {label}
      </button>
      {open && (
        <div className="floating-app-tag__menu" role="menu">
          {apps.map((app) => (
            <div key={app.id} className="floating-app-tag__row">
              <button
                type="button"
                className="floating-app-tag__action"
                disabled={app.id === current}
                onClick={() => openHere(app.port)}
              >
                {app.title}
              </button>
              <button
                type="button"
                className="floating-app-tag__new-window"
                title="Открыть в новой вкладке"
                onClick={() => openInNewTab(app.port)}
              >
                ↗
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
