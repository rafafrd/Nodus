import { useEffect, useState } from 'react';
import { usePreferences } from './preferences';
export function EditorialBackdrop() {
  const { value } = usePreferences(), [hidden, setHidden] = useState(document.hidden), [minimized,setMinimized]=useState(false);
  useEffect(() => { const change = () => setHidden(document.hidden); document.addEventListener('visibilitychange', change); return () => document.removeEventListener('visibilitychange', change); }, []);
  useEffect(()=>{const remove=window.desktop.onWindowState(state=>setMinimized(state.minimized));void window.desktop.getWindowState().then(r=>{if(r.ok)setMinimized(r.value.minimized);});return remove;},[]);
  return value.theme === 'editorial' ? <div className="editorial-backdrop" data-testid="editorial-background" data-running={value.editorialBackground && value.animations && !hidden && !minimized ? 'true' : 'false'} aria-hidden="true"/> : null;
}
