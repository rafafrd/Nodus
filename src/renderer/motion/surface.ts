import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { distance, duration, ease } from './tokens';
import { useReducedMotion } from './profile';

export function useSurfaceMotion(ref: RefObject<HTMLElement | null>, identity: string, enabled = true) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const opacity = Number(gsap.getProperty(el, 'opacity')), y = Number(gsap.getProperty(el, 'y'));
    gsap.killTweensOf(el);
    if (!enabled || reduced) { gsap.set(el, { clearProps: 'opacity,transform,willChange' }); return; }
    const tween = gsap.fromTo(el, { opacity: opacity < 1 ? opacity : .72, y: opacity < 1 ? y : distance.micro }, { opacity: 1, y: 0, duration: duration.ui, ease: ease.out, overwrite: 'auto', clearProps: 'opacity,transform,willChange' });
    // Killing preserves the sampled pose for the next identity; reverting would jump.
    return () => { tween.kill(); };
  }, [identity, enabled, reduced]);
}
