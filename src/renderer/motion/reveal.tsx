import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { distance, duration, ease, stagger } from './tokens';
import { expressiveNow, useExpressiveMotion, useReducedMotion } from './profile';

gsap.registerPlugin(SplitText);

/** Dispatched by AreaStage on the incoming layer so mounted titles and rules replay when an area is re-entered. */
export const AREA_ENTER = 'nodus:area-enter';

/** Line reveal: serif titles rise through a line mask. Editorial only; other themes render plain text. */
export function LineReveal({ text, as = 'h1', className }: { text: string; as?: 'h1' | 'h2' | 'h3'; className?: string }) {
  // A new text remounts the element so React never reconciles against nodes SplitText has rewritten.
  return <LineRevealText key={text} text={text} as={as} className={className} />;
}
function LineRevealText({ text, as: Tag, className }: { text: string; as: 'h1' | 'h2' | 'h3'; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null), expressive = useExpressiveMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !expressive) return;
    let context: gsap.Context | undefined;
    const play = () => {
      context?.revert();
      context = gsap.context(() => {
        SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, onSplit: self => gsap.from(self.lines, { yPercent: 105, duration: duration.panel, ease: ease.out, stagger: stagger.lines, onComplete: () => self.revert() }) });
      }, el);
    };
    play();
    const layer = el.closest('[data-area]');
    layer?.addEventListener(AREA_ENTER, play);
    return () => { layer?.removeEventListener(AREA_ENTER, play); context?.revert(); };
  }, [expressive]);
  return <Tag ref={ref} className={className}>{text}</Tag>;
}

const LIVE = 'data-hairline-live', drawing = new WeakMap<Element, gsap.Context>();
/** Hairline draw: [data-hairline] rules scale in from the left. While live, motion.css hides the static border it replaces. */
export function drawHairlines(root: Element) {
  drawing.get(root)?.revert(); drawing.delete(root);
  if (!expressiveNow()) return;
  const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-hairline]')); if (!lines.length) return;
  const context: gsap.Context = gsap.context(() => {
    lines.forEach(line => line.setAttribute(LIVE, ''));
    gsap.fromTo(lines, { '--hairline': 0 }, { '--hairline': 1, duration: duration.panel, ease: ease.out, stagger: stagger.cards, onComplete: () => context.revert() });
    return () => lines.forEach(line => line.removeAttribute(LIVE));
  }, root);
  drawing.set(root, context);
}

/** Stagger: items matching `selector` rise in sequence whenever `key` changes. */
export function useStagger(ref: RefObject<HTMLElement | null>, selector: string, key: unknown = true, enabled = true) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const root = ref.current; if (!root || !enabled || reduced) return;
    const context = gsap.context(() => { gsap.fromTo(root.querySelectorAll(selector), { y: distance.micro, opacity: 0 }, { y: 0, opacity: 1, duration: duration.ui, ease: ease.out, stagger: stagger.list, clearProps: 'opacity,transform,willChange' }); }, root);
    return () => context.revert();
  }, [key, enabled, reduced]);
}

/** Reveal: one block settles into place (opacity and a short rise). */
export function useReveal(ref: RefObject<HTMLElement | null>, key: unknown, enabled = true) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !enabled || reduced) return;
    const context = gsap.context(() => { gsap.fromTo(el, { y: distance.ui, opacity: 0 }, { y: 0, opacity: 1, duration: duration.panel, ease: ease.out, clearProps: 'opacity,transform,willChange' }); }, el);
    return () => context.revert();
  }, [key, enabled, reduced]);
}

const entry = { left: { x: -distance.ui, from: 'inset(0 14% 0 0)' }, right: { x: distance.ui, from: 'inset(0 0 0 14%)' }, top: { y: -distance.ui, from: 'inset(0 0 14% 0)' }, bottom: { y: distance.ui, from: 'inset(14% 0 0 0)' } } as const;
/** Panel enter: a small offset plus an inset clip. Never scales, so text is not distorted. */
export function usePanelEnter(ref: RefObject<HTMLElement | null>, open = true, side: keyof typeof entry = 'right') {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !open || reduced) return;
    const { from, ...offset } = entry[side];
    const context = gsap.context(() => { gsap.fromTo(el, { ...offset, clipPath: from, opacity: 0 }, { x: 0, y: 0, clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: duration.ui, ease: ease.out, clearProps: 'opacity,transform,clipPath,willChange' }); }, el);
    return () => context.revert();
  }, [open, reduced, side]);
}

/** Spotlight: a radial highlight follows the pointer over [data-spotlight] cards through CSS variables. Editorial only. */
export function useSpotlight(ref: RefObject<HTMLElement | null>) {
  const expressive = useExpressiveMotion();
  useLayoutEffect(() => {
    const root = ref.current; if (!root || !expressive) return;
    const setters = new WeakMap<Element, { x(value: number): void; y(value: number): void }>();
    const cardOf = (event: PointerEvent) => { const card = (event.target as Element).closest<HTMLElement>('[data-spotlight]'); return card && root.contains(card) ? card : null; };
    const setup = (card: HTMLElement) => {
      let set = setters.get(card);
      if (!set) { gsap.set(card, { '--spot-a': 0 }); set = { x: gsap.quickSetter(card, '--spot-x', 'px') as (value: number) => void, y: gsap.quickSetter(card, '--spot-y', 'px') as (value: number) => void }; setters.set(card, set); }
      return set;
    };
    const move = (event: PointerEvent) => { const card = cardOf(event); if (!card) return; const set = setup(card), box = card.getBoundingClientRect(); set.x(event.clientX - box.left); set.y(event.clientY - box.top); };
    const fade = (to: number) => (event: PointerEvent) => { const card = cardOf(event); if (!card || card.contains(event.relatedTarget as Node | null)) return; setup(card); gsap.to(card, { '--spot-a': to, duration: duration.ui, ease: ease.out, overwrite: 'auto' }); };
    const over = fade(1), out = fade(0);
    root.addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerover', over); root.addEventListener('pointerout', out);
    return () => {
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerover', over); root.removeEventListener('pointerout', out);
      const cards = root.querySelectorAll('[data-spotlight]'); gsap.killTweensOf(cards); gsap.set(cards, { clearProps: '--spot-x,--spot-y,--spot-a' });
    };
  }, [expressive]);
}

/** Rail indicator: one bar slides between the selected rail items instead of each item restyling itself. */
export function useRailIndicator(host: RefObject<HTMLElement | null>, bar: RefObject<HTMLElement | null>, key: unknown) {
  const reduced = useReducedMotion(), placed = useRef(false);
  useLayoutEffect(() => {
    const root = host.current, line = bar.current; if (!root || !line) return;
    const place = (animate: boolean) => {
      const target = root.querySelector<HTMLElement>('.rail-module.selected');
      if (!target?.offsetHeight) { gsap.set(line, { autoAlpha: 0 }); placed.current = false; return; }
      gsap.killTweensOf(line);
      gsap.set(line, { height: target.offsetHeight, autoAlpha: 1 });
      if (animate && placed.current && !reduced) gsap.to(line, { x: target.offsetLeft, y: target.offsetTop, duration: duration.ui, ease: ease.out, overwrite: true });
      else gsap.set(line, { x: target.offsetLeft, y: target.offsetTop });
      placed.current = true;
    };
    place(true);
    const observer = new ResizeObserver(() => place(false)); observer.observe(root);
    return () => { observer.disconnect(); gsap.killTweensOf(line); };
  }, [key, reduced]);
}

export type Tone = 'ok' | 'info' | 'warn' | 'error';
const tones: [RegExp, Tone][] = [[/^Erro/, 'error'], [/^Conflito/, 'warn'], [/^Rascunho recuperado/, 'info']];
/** State feedback: a border pulse on the element (see [data-pulse] in motion.css) when the note status becomes saved, failed, conflicted or recovered. */
export function useStatusPulse(ref: RefObject<HTMLElement | null>, status: string) {
  const reduced = useReducedMotion(), previous = useRef(status);
  useLayoutEffect(() => {
    const el = ref.current, before = previous.current; previous.current = status;
    if (!el || reduced || before === status) return;
    const tone = tones.find(([pattern]) => pattern.test(status))?.[1] ?? (status === 'Salvo no arquivo' && before === 'Salvando…' ? 'ok' : null);
    if (!tone) return;
    el.dataset.tone = tone;
    const context = gsap.context(() => { gsap.fromTo(el, { '--pulse': 1 }, { '--pulse': 0, duration: duration.hero, ease: ease.soft }); }, el);
    return () => context.revert();
  }, [status, reduced]);
}
/** Pulse on demand: every change of `key` after the first render flashes the border once. */
export function usePulse(ref: RefObject<HTMLElement | null>, key: unknown, tone: Tone = 'ok') {
  const reduced = useReducedMotion(), first = useRef(true);
  useLayoutEffect(() => {
    const skip = first.current; first.current = false;
    const el = ref.current; if (!el || reduced || skip) return;
    el.dataset.tone = tone;
    const context = gsap.context(() => { gsap.fromTo(el, { '--pulse': 1 }, { '--pulse': 0, duration: duration.hero, ease: ease.soft }); }, el);
    return () => context.revert();
  }, [key, reduced]);
}
/** Same pulse for banners that appear already in their final state. */
export function usePulseOnMount(ref: RefObject<HTMLElement | null>, tone: Tone, enabled = true) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el || reduced || !enabled) return;
    el.dataset.tone = tone;
    const context = gsap.context(() => { gsap.fromTo(el, { '--pulse': 1 }, { '--pulse': 0, duration: duration.hero, ease: ease.soft }); }, el);
    return () => context.revert();
  }, [reduced]);
}
