import { useCallback, useEffect, useRef, useState } from 'react';

const PRIZES = [
  'Скидка 5% на следующий заказ',
  'Бесплатная доставка (вирт.)',
  'Стикер «Ауф!» в корзине',
  'Промокод SPORT-10 (демо)',
  '+1 к мотивации',
  'Водный баланс: выпей воды',
  'Редкий лут: улыбка тренера',
];

function playBeep(freq: number, durationMs: number, gain = 0.05) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    const t0 = ctx.currentTime;
    o.start(t0);
    o.stop(t0 + durationMs / 1000);
    window.setTimeout(() => void ctx.close(), durationMs + 80);
  } catch {
    /* без звука */
  }
}

export default function SportLootBox() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const spinEndRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (spinEndRef.current) window.clearTimeout(spinEndRef.current);
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const spin = useCallback(() => {
    if (spinning) return;
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (spinEndRef.current) window.clearTimeout(spinEndRef.current);

    setSpinning(true);
    setLabel(null);
    let tick = 0;
    tickRef.current = window.setInterval(() => {
      tick += 1;
      playBeep(320 + (tick % 5) * 40, 35, 0.035);
    }, 110);

    const duration = 2200 + Math.random() * 800;
    spinEndRef.current = window.setTimeout(() => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      const pick = PRIZES[Math.floor(Math.random() * PRIZES.length)]!;
      setLabel(pick);
      setSpinning(false);
      playBeep(880, 90, 0.06);
    }, duration);
  }, [spinning]);

  return (
    <section className="loot-section">
      <div className="loot-card">
        <div>
          <h2 className="loot-title">Sport Loot</h2>
          <p className="loot-sub">
            Демо-рулетка для sportshop: свои тексты и короткие звуки при прокрутке и выпадении (без чужих игровых ассетов).
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
          {open ? 'Свернуть' : 'Открыть'}
        </button>
      </div>
      {open && (
        <div className="loot-panel">
          <div className={`loot-reel ${spinning ? 'loot-reel--spin' : ''}`} aria-hidden>
            {PRIZES.map((p, i) => (
              <span key={`${i}-${p}`} className="loot-chip">
                {p}
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-outline loot-spin-btn" onClick={spin} disabled={spinning}>
            {spinning ? 'Крутим…' : 'Крутить'}
          </button>
          {label && !spinning && (
            <p className="loot-result" role="status">
              Выпало: <strong>{label}</strong>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
