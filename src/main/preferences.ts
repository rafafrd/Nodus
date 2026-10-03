import type { z } from 'zod';
import { Store } from './store';
import { defaultPreferences, preferenceInput, preferencesSchema, type Preferences } from '../shared/preferences';
export class UserPreferences {
  constructor(readonly store: Store) {}
  get(): Preferences {
    const raw = this.store.setting('preferences');
    if (!raw) return { ...defaultPreferences };
    try { const parsed = preferencesSchema.safeParse(JSON.parse(raw)); if (parsed.success) return parsed.data; } catch { /* Keep the stored value; defaults allow recovery without a reset. */ }
    return { ...defaultPreferences };
  }
  private save(value: Preferences, action: string) {
    return this.store.transaction(() => { const valid = preferencesSchema.parse(value); this.store.setSetting('preferences', JSON.stringify(valid)); this.store.audit(action, null, 'ok'); return valid; });
  }
  update(input: z.infer<typeof preferenceInput>) { return this.save({ ...this.get(), ...preferenceInput.parse(input) }, 'preferences.update'); }
  setPhoto(photo: string | null) { return this.save({ ...this.get(), photo }, photo ? 'profile.photo' : 'profile.photo-remove'); }
}
