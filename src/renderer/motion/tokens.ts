/** Single source of truth for UI motion. motion.css mirrors it as --motion-* / --ease-*; tests/motion-tokens.test.ts keeps both equal. */
export const duration = { micro: .16, ui: .28, panel: .5, scene: .8, hero: 1 } as const;
/** GSAP easings: long deceleration, no bounce and no elastic overshoot. */
export const ease = { out: 'expo.out', soft: 'quart.out', in: 'power2.in', inOut: 'power3.inOut' } as const;
/** CSS equivalents of `ease`. */
export const cubic = { out: 'cubic-bezier(.16,1,.3,1)', soft: 'cubic-bezier(.25,1,.5,1)', in: 'cubic-bezier(.55,.085,.68,.53)', inOut: 'cubic-bezier(.65,0,.35,1)' } as const;
export const stagger = { list: .015, lines: .07, cards: .06 } as const;
export const distance = { micro: 6, ui: 12, panel: 18 } as const;
