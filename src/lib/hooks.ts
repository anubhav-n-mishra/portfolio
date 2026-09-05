'use client';

import { useSyncExternalStore } from 'react';

// Three components each ran their own `useEffect(() => setIsMobile(...))` plus a resize
// listener. That duplicated the logic, and setting state synchronously inside an effect
// causes an extra render pass on every mount. useSyncExternalStore subscribes to the
// media query directly and gives a correct server snapshot, so there is no second pass
// and no hydration mismatch.

const MOBILE_QUERY = '(max-width: 767px)';

function subscribeToMobile(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getMobileSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

/** Server always renders the desktop layout; the client corrects on first paint. */
function getMobileServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeToMobile, getMobileSnapshot, getMobileServerSnapshot);
}

// A store that never changes, so the snapshot is simply "are we on the client".
const noopSubscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * True once the component has hydrated. Replaces the `useState(false)` +
 * `useEffect(() => setMounted(true))` pattern, which renders twice by construction.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, clientSnapshot, serverSnapshot);
}
