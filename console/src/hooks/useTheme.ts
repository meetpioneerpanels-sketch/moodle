import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'eduhub.theme';

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private mode: fall through to the system preference.
  }
  return 'system';
}

function apply(preference: ThemePreference): 'light' | 'dark' {
  const resolved = preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#09090b' : '#ffffff');
  return resolved;
}

/**
 * Light/dark theming. The preference is stored per device; "system" follows the
 * OS and keeps following it when the OS setting changes mid-session.
 * A matching inline script in index.html applies the same value before first
 * paint, so there is no flash of the wrong theme.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => apply(readPreference()));

  useEffect(() => {
    setResolved(apply(preference));
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Nothing to do - the theme still applies for this session.
    }
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setResolved(apply('system'));
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [preference]);

  const toggle = useCallback(() => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved]);

  return { preference, setPreference, resolved, toggle };
}
