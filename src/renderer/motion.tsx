import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { motionPreference } from './preferences';

export const motion = { enter: .46, exit: .24, panel: .32, ease: 'power3.out' };
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => motionPreference().matches);
  useEffect(() => { const query = motionPreference(); const change = () => setReduced(query.matches); query.addEventListener('change', change); change(); return () => query.removeEventListener('change', change); }, []);
  return reduced;
}

/** Only presentation layers overlap. The leaving layer is inert immediately. */
export function AreaStage({ active, visible, sizes, children }: { active: string; visible?:readonly string[];sizes?:readonly number[];children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null), previous = useRef(active);
  const reduced = useReducedMotion();
  useLayoutEffect(()=>{const panes=visible??[active],weights=sizes??[100];Array.from(host.current!.children).forEach(element=>{const el=element as HTMLElement,index=panes.indexOf(el.dataset.area??'');if(index<0)return;el.style.left=`${weights.slice(0,index).reduce((a,b)=>a+b,0)}%`;el.style.right='auto';el.style.width=panes.length===1?'100%':`calc(${weights[index]}% - ${index===panes.length-1?0:6}px)`;});},[active,visible?.join(','),sizes?.join(',')]);
  useLayoutEffect(() => {
    const stage = host.current!;
    const layers = Array.from(stage.children) as HTMLElement[];
    const incoming = layers.find(el => el.dataset.area === active)!;
    const shown=visible??[active];
    let observer: MutationObserver | null = null, timeline: gsap.core.Timeline | null = null;
    const direction = ['home', 'study', 'review', 'graph', 'explorer', 'city', 'settings'].indexOf(active) >= ['home', 'study', 'review', 'graph', 'explorer', 'city', 'settings'].indexOf(previous.current) ? 1 : -1;
    layers.forEach(el => { gsap.killTweensOf(el); el.inert = true; el.setAttribute('aria-hidden', 'true'); });
    function complete() {
      layers.forEach(el => {
        const selected = shown.includes(el.dataset.area!);
        gsap.set(el, { autoAlpha: selected ? 1 : 0, x: 0, scale: 1, clearProps: 'willChange' });
        el.inert = !selected; el.setAttribute('aria-hidden', String(!selected));
      });
      stage.dataset.motion = 'idle'; previous.current = active;
    }
    function start() {
      observer?.disconnect();
      if (reduced || layers.length === 1 || layers.every(el => shown.includes(el.dataset.area!) ? Number(gsap.getProperty(el, 'opacity')) === 1 : Number(gsap.getProperty(el, 'opacity')) === 0)) { complete(); return; }
      stage.dataset.motion = 'transitioning';
      if (Number(gsap.getProperty(incoming, 'opacity')) === 0) gsap.set(incoming, { x: 18 * direction, scale: .995 });
      gsap.set(incoming, { visibility: 'visible', willChange: 'transform,opacity' });
      timeline = gsap.timeline({ onComplete: complete });
      layers.filter(el => !shown.includes(el.dataset.area!)).forEach(el => timeline!.to(el, { autoAlpha: 0, x: -12 * direction, duration: motion.exit, ease: 'power2.inOut', overwrite: 'auto' }, 0));
      layers.filter(el=>el!==incoming&&shown.includes(el.dataset.area!)).forEach(el=>gsap.set(el,{autoAlpha:1,x:0,scale:1}));
      timeline.to(incoming, { autoAlpha: 1, x: 0, scale: 1, duration: motion.enter, ease: motion.ease, overwrite: 'auto' }, .045);
    }
    const ready = () => incoming.querySelector('[data-area-ready="true"]');
    if (ready() || ['study','pdf','video'].includes(active)) start();
    else { stage.dataset.motion = 'loading'; observer = new MutationObserver(() => { if (ready()) start(); }); observer.observe(incoming, { subtree: true, attributes: true, childList: true }); }
    return () => { observer?.disconnect(); timeline?.kill(); layers.forEach(el => gsap.killTweensOf(el)); };
  }, [active, reduced,visible?.join(',')]);
  return <div className="area-stage" ref={host} data-testid="area-stage">{children}</div>;
}

export function useSurfaceMotion(ref: RefObject<HTMLElement | null>, identity: string, enabled = true) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const opacity = Number(gsap.getProperty(el, 'opacity')), y = Number(gsap.getProperty(el, 'y'));
    gsap.killTweensOf(el);
    if (!enabled || reduced) { gsap.set(el, { clearProps: 'opacity,transform,willChange' }); return; }
    const tween = gsap.fromTo(el, { opacity: opacity < 1 ? opacity : .72, y: opacity < 1 ? y : 6 }, { opacity: 1, y: 0, duration: motion.panel, ease: motion.ease, overwrite: 'auto', clearProps: 'opacity,transform,willChange' });
    // Killing preserves the sampled pose for the next identity; reverting would jump.
    return () => { tween.kill(); };
  }, [identity, enabled, reduced]);
}

/** Capture the painted pose before React changes the grid. Only transforms animate;
 * editor/PDF dimensions settle once and their DOM is never cloned. */
export function usePanelLayout(ref: RefObject<HTMLElement | null>, identity: string, enabled: boolean) {
  const reduced = useReducedMotion();
  const previous = useRef(new Map<string, DOMRect>()), timeline = useRef<gsap.core.Timeline | null>(null);
  function capture() {
    const panels = ref.current?.querySelectorAll<HTMLElement>('[data-motion-panel]');
    previous.current.clear();
    panels?.forEach(el => { const rect = el.getBoundingClientRect(); if (rect.width && rect.height) previous.current.set(el.dataset.motionPanel!, rect); });
    timeline.current?.kill();
  }
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-motion-panel]'));
    timeline.current?.kill();
    gsap.set(panels, { clearProps: 'transform,opacity,willChange' });
    root.dataset.layoutMotion = 'idle';
    if (!enabled || reduced || !previous.current.size) { previous.current.clear(); return; }
    const old = previous.current; previous.current = new Map();
    root.dataset.layoutMotion = 'moving';
    const finish = () => { gsap.set(panels, { clearProps: 'transform,opacity,willChange' }); root.dataset.layoutMotion = 'idle'; };
    timeline.current = gsap.timeline({ onComplete: finish });
    panels.forEach((el, index) => {
      const next = el.getBoundingClientRect(); if (!next.width || !next.height) return;
      const before = old.get(el.dataset.motionPanel!);
      gsap.set(el, { transformOrigin: 'top left', willChange: 'transform,opacity' });
      timeline.current!.fromTo(el, before ? { x: before.x - next.x, y: before.y - next.y, scaleX: before.width / next.width, scaleY: before.height / next.height, opacity: 1 } : { y: 8, opacity: 0 }, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: .42, ease: motion.ease, overwrite: 'auto' }, index * .025);
    });
    // A second layout captures the current pose before cancelling this timeline.
    return () => { timeline.current?.kill(); };
  }, [identity, reduced, enabled]);
  useEffect(() => () => { timeline.current?.kill(); }, []);
  return capture;
}

export function AnimatedNumber({ value, testId }: { value: number | undefined; testId: string }) {
  const element = useRef<HTMLElement>(null), amount = useRef({ value: value ?? 0 });
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    gsap.killTweensOf(amount.current);
    if (value === undefined) return;
    const update = () => { if (element.current) element.current.textContent = Math.round(amount.current.value).toLocaleString('pt-BR'); };
    if (reduced) { amount.current.value = value; update(); return; }
    // React has written the destination text; restore the sampled value before paint.
    update();
    const tween = gsap.to(amount.current, { value, duration: .42, ease: motion.ease, onUpdate: update, onComplete: update });
    return () => { tween.kill(); };
  }, [value, reduced]);
  return <strong ref={element} data-testid={testId} data-value={value}>{value === undefined ? '—' : value.toLocaleString('pt-BR')}</strong>;
}

export function MotorGain({ id, coins }: { id: number; coins: number }) {
  const ref = useRef<HTMLSpanElement>(null), reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !id) return;
    if (reduced) { gsap.set(el, { autoAlpha: 1, y: 0 }); const timer = setTimeout(() => gsap.set(el, { autoAlpha: 0 }), 900); return () => { clearTimeout(timer); gsap.set(el, { autoAlpha: 0 }); }; }
    const context = gsap.context(() => gsap.fromTo(el, { autoAlpha: 1, y: reduced ? 0 : 8 }, { autoAlpha: 0, y: reduced ? 0 : -22, duration: reduced ? .8 : .95, ease: 'power2.out', delay: reduced ? .3 : .08 }));
    return () => context.revert();
  }, [id, reduced]);
  return <span ref={ref} className="engine-gain" data-testid="engine-gain" aria-hidden="true">{id ? `+${coins}` : ''}</span>;
}
