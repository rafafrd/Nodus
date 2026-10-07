import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PreferencesProvider } from './preferences';
import { DesktopFrame } from './DesktopFrame';
createRoot(document.getElementById('root')!).render(<DesktopFrame><PreferencesProvider><App /></PreferencesProvider></DesktopFrame>);
