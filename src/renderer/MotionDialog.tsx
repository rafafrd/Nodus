import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from './motion';
import { Icon } from './Icon';

export function MotionDialog({ title, children, close }: { title: string; children(requestClose: () => void): ReactNode; close(): void }) {
  const element = useRef<HTMLDialogElement>(null), closing = useRef(false), callback = useRef(close);
  callback.current = close;
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = element.current!;
    if (!el.open) el.showModal();
    gsap.killTweensOf(el);
    if (reduced) { gsap.set(el, { clearProps: 'opacity,transform', '--dialog-shade': .77 }); if (closing.current) callback.current(); }
    else gsap.fromTo(el, { opacity: 0, y: 12, '--dialog-shade': 0 }, { opacity: 1, y: 0, '--dialog-shade': .77, duration: .26, ease: 'power3.out', clearProps: 'transform,opacity' });
    return () => { gsap.killTweensOf(el); };
  }, [reduced]);
  function requestClose() {
    if (closing.current) return;
    closing.current = true;
    const el = element.current!; gsap.killTweensOf(el);
    if (reduced) callback.current();
    else gsap.to(el, { opacity: 0, y: 6, '--dialog-shade': 0, duration: .16, ease: 'power2.in', onComplete: () => callback.current() });
  }
  return <dialog className="motion-dialog" ref={element} onCancel={event => { event.preventDefault(); requestClose(); }} aria-label={title}><div className="dialog-title"><h2>{title}</h2><button onClick={requestClose} aria-label="Fechar diálogo"><Icon kind="close"/></button></div>{children(requestClose)}</dialog>;
}
