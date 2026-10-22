import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { dec, formatAmount, type Amount } from '../../shared/amount';
import { duration, ease } from './tokens';
import { useReducedMotion } from './profile';

/** Mono, tabular digits that count to the value the main process confirmed (see .num in motion.css). */
export function AnimatedNumber({ value, testId, as: Tag = 'strong', firstInstant = false }: { value: Amount | undefined; testId?: string; as?: 'strong' | 'span'; firstInstant?: boolean }) {
  const element = useRef<HTMLElement>(null), amount = useRef({ value: typeof value === 'number' ? value : 0 }), shown = useRef(typeof value === 'number');
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    gsap.killTweensOf(amount.current);
    if (value === undefined) return;
    if (typeof value === 'string') { if (element.current) element.current.textContent = formatAmount(value); return; }
    const update = () => { if (element.current) element.current.textContent = formatAmount(Math.round(amount.current.value)); };
    const first = !shown.current; shown.current = true;
    if (reduced || (first && firstInstant)) { amount.current.value = value; update(); return; }
    // React has written the destination text; restore the sampled value before paint.
    update();
    const tween = gsap.to(amount.current, { value, duration: duration.panel, ease: ease.out, onUpdate: update, onComplete: update });
    return () => { tween.kill(); };
  }, [value, reduced]);
  return <Tag ref={element as never} className="num" data-testid={testId} data-value={value}>{value === undefined ? '—' : formatAmount(value)}</Tag>;
}

export function MotorGain({ id, coins }: { id: number; coins: Amount }) {
  const ref = useRef<HTMLSpanElement>(null), reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !id) return;
    if (reduced) { gsap.set(el, { autoAlpha: 1, y: 0 }); const timer = setTimeout(() => gsap.set(el, { autoAlpha: 0 }), 900); return () => { clearTimeout(timer); gsap.set(el, { autoAlpha: 0 }); }; }
    const context = gsap.context(() => gsap.fromTo(el, { autoAlpha: 1, y: 8 }, { autoAlpha: 0, y: -22, duration: duration.hero, ease: ease.soft, delay: .08 }));
    return () => context.revert();
  }, [id, reduced]);
  return <span ref={ref} className="engine-gain num" data-testid="engine-gain" aria-hidden="true">{id && dec(coins).gt(0) ? `+${formatAmount(coins)}` : ''}</span>;
}
