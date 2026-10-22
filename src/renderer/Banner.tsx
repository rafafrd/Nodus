import { useRef, type HTMLAttributes } from 'react';
import { usePulseOnMount, type Tone } from './motion';

/** A message box (error, conflict, recovered draft) that pulses its border once when it appears. */
export function Banner({ tone, pulse = true, children, ...rest }: { tone: Tone; pulse?: boolean } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  usePulseOnMount(ref, tone, pulse);
  return <div ref={ref} data-pulse {...rest}>{children}</div>;
}
