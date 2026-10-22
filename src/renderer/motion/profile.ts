import { useEffect, useState } from 'react';
import { motionPreference, usePreferences } from '../preferences';

/** html[data-animations=off] combined with prefers-reduced-motion. Essential timers (focus, QTE, video) never read this. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => motionPreference().matches);
  useEffect(() => { const query = motionPreference(); const change = () => setReduced(query.matches); query.addEventListener('change', change); change(); return () => query.removeEventListener('change', change); }, []);
  return reduced;
}
/** Line reveal, hairline draw and spotlight are Editorial-only (ADR-0024); every theme keeps the sober set. */
export function useExpressiveMotion() {
  const reduced = useReducedMotion(), { value } = usePreferences();
  return !reduced && value.theme === 'editorial';
}
/** For imperative code that cannot call hooks (stage transitions). */
export function expressiveNow() {
  return !motionPreference().matches && document.documentElement.dataset.theme === 'editorial';
}
