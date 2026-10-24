import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { distance, duration, ease, useReducedMotion } from './motion';
import { Icon } from './Icon';

export function MotionDialog({ title, children, close, beforeClose }: { title: string; children(requestClose: () => void): ReactNode; close(): void; beforeClose?():boolean|Promise<boolean> }) {
  const element = useRef<HTMLDialogElement>(null), closing = useRef(false), callback = useRef(close);
  callback.current = close;
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const el = element.current!;
    if (!el.open) el.showModal();
    gsap.killTweensOf(el);
    if (reduced) { gsap.set(el, { clearProps: 'opacity,transform', '--dialog-shade': .77 }); if (closing.current) callback.current(); }
    else gsap.fromTo(el, { opacity: 0, y: distance.ui, '--dialog-shade': 0 }, { opacity: 1, y: 0, '--dialog-shade': .77, duration: duration.ui, ease: ease.out, clearProps: 'transform,opacity' });
    return () => { gsap.killTweensOf(el); };
  }, [reduced]);
  // Leaving is faster than entering: the dialog is already dismissed in the user's mind.
  const checking = useRef(false);
  async function requestClose() {
    if (closing.current || checking.current) return;
    if (beforeClose) { checking.current = true; try { if (!await beforeClose()) return; } finally { checking.current = false; } }
    closing.current = true;
    const el = element.current!; gsap.killTweensOf(el);
    if (reduced) callback.current();
    else gsap.to(el, { opacity: 0, y: distance.micro, '--dialog-shade': 0, duration: duration.micro, ease: ease.in, onComplete: () => callback.current() });
  }
  return <dialog className="motion-dialog" ref={element} onCancel={event => { event.preventDefault(); requestClose(); }} aria-label={title}><div className="dialog-title"><h2>{title}</h2><button onClick={requestClose} aria-label="Fechar diálogo"><Icon kind="close"/></button></div>{children(requestClose)}</dialog>;
}
