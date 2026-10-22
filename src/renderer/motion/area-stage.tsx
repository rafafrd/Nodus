import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { workspaceRects, type WorkspaceTab } from '../../shared/workspace';
import { distance, duration, ease } from './tokens';
import { expressiveNow, useReducedMotion } from './profile';
import { AREA_ENTER, drawHairlines } from './reveal';

const ORDER = ['home', 'study', 'review', 'graph', 'explorer', 'city', 'settings'];
/** The entering layer is revealed from the side it comes from. Offset and clip only: nothing scales, so text is never distorted. */
const clipFrom = (direction: number) => direction > 0 ? 'inset(0% 0% 0% 6%)' : 'inset(0% 6% 0% 0%)';

/** Only presentation layers overlap. The leaving layer is inert immediately. */
export function AreaStage({ active, layout, children }: { active: string; layout: WorkspaceTab; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null), previous = useRef(active);
  const reduced = useReducedMotion();
  useLayoutEffect(()=>{const rectangles=workspaceRects(layout);Array.from(host.current!.children).forEach(element=>{const el=element as HTMLElement,index=layout.panes.indexOf(el.dataset.area as WorkspaceTab['focused']);if(index<0)return;const rect=rectangles[index];el.style.left=`${rect.left}%`;el.style.top=`${rect.top}%`;el.style.right='auto';el.style.bottom='auto';el.style.width=rect.width===100?'100%':`calc(${rect.width}% - ${rect.left===0?3:0}px)`;el.style.height=rect.height===100?'100%':`calc(${rect.height}% - ${rect.top===0?3:0}px)`;});},[layout.id,layout.panes.join(','),layout.columnSplit,layout.rowSplit]);
  useLayoutEffect(() => {
    const stage = host.current!;
    const layers = Array.from(stage.children) as HTMLElement[];
    const incoming = layers.find(el => el.dataset.area === active)!;
    const shown: readonly string[] = layout.panes;
    let observer: MutationObserver | null = null, timeline: gsap.core.Timeline | null = null;
    const direction = ORDER.indexOf(active) >= ORDER.indexOf(previous.current) ? 1 : -1;
    layers.forEach(el => { gsap.killTweensOf(el); el.inert = true; el.setAttribute('aria-hidden', 'true'); });
    function complete() {
      layers.forEach(el => {
        const selected = shown.includes(el.dataset.area!);
        el.dataset.present = String(selected);
        gsap.set(el, { autoAlpha: selected ? 1 : 0, clearProps: 'transform,clipPath,willChange' });
        el.inert = !selected; el.setAttribute('aria-hidden', String(!selected));
      });
      gsap.set(stage, { clearProps: '--sweep' });
      stage.dataset.motion = 'idle'; previous.current = active;
    }
    function start() {
      observer?.disconnect();
      layers.filter(el => shown.includes(el.dataset.area!)).forEach(el => { el.dataset.present = 'true'; });
      if (reduced || layers.length === 1 || layers.every(el => shown.includes(el.dataset.area!) ? Number(gsap.getProperty(el, 'opacity')) === 1 : Number(gsap.getProperty(el, 'opacity')) === 0)) { complete(); return; }
      stage.dataset.motion = 'transitioning';
      if (Number(gsap.getProperty(incoming, 'opacity')) === 0) gsap.set(incoming, { x: distance.panel * direction, clipPath: clipFrom(direction) });
      gsap.set(incoming, { visibility: 'visible', willChange: 'transform,opacity' });
      timeline = gsap.timeline({ onComplete: complete });
      layers.filter(el => !shown.includes(el.dataset.area!)).forEach(el => timeline!.to(el, { autoAlpha: 0, x: -distance.ui * direction, duration: duration.ui, ease: ease.in, overwrite: 'auto' }, 0));
      layers.filter(el => el !== incoming && shown.includes(el.dataset.area!)).forEach(el => gsap.set(el, { autoAlpha: 1, clearProps: 'transform,clipPath' }));
      timeline.to(incoming, { autoAlpha: 1, x: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: duration.panel, ease: ease.out, overwrite: 'auto' }, .045);
      if (expressiveNow()) {
        timeline.fromTo(stage, { '--sweep': 0 }, { '--sweep': 1, duration: duration.panel, ease: ease.out }, 0);
        incoming.dispatchEvent(new Event(AREA_ENTER)); drawHairlines(incoming);
      }
    }
    const ready = () => incoming.querySelector('[data-area-ready="true"]');
    if (ready() || ['study', 'pdf', 'video'].includes(active)) start();
    else { stage.dataset.motion = 'loading'; observer = new MutationObserver(() => { if (ready()) start(); }); observer.observe(incoming, { subtree: true, attributes: true, childList: true }); }
    return () => { observer?.disconnect(); timeline?.kill(); layers.forEach(el => gsap.killTweensOf(el)); };
  }, [active, reduced, layout.id, layout.panes.join(',')]);
  return <div className="area-stage" ref={host} data-testid="area-stage">{children}</div>;
}
