/**
 * Haptic feedback utility for mobile tactile immersion.
 * Uses the Vibration API safely with fallbacks.
 */

export const hapticEngine = {
  /**
   * Subtle tick for normal UI interactions (tabs, toggles)
   */
  light: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(12);
      }
    } catch {
      // Ignore if not supported or restricted by browser policy
    }
  },

  /**
   * Medium bump for card selections, placing markers, opening envelopes
   */
  medium: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(28);
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Heavy thud for wax seal breakage, accusations, voting
   */
  heavy: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([45, 20, 25]);
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Triumphant harmonic pulse on victory or finding the crime solution
   */
  success: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 40, 30, 40, 60]);
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Dramatic warning or defeat pulse when murder happens or accusation is wrong
   */
  dramatic: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 50, 120]);
      }
    } catch {
      // Ignore
    }
  },
};
