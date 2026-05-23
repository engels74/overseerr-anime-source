import { useLockBodyScroll } from '@app/hooks/useLockBodyScroll';
import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const DISMISSAL_KEY = 'overseerr-anime-deprecation-warning-dismissed-until';
const CLOSE_COUNT_KEY = 'overseerr-anime-deprecation-warning-close-count';
const DISMISSAL_DURATION_MS = 48 * 60 * 60 * 1000;
const CLOSES_REQUIRED_FOR_SNOOZE = 5;

const linkClassName =
  'inline-flex items-center gap-1 font-semibold text-red-100 underline decoration-red-200 decoration-2 underline-offset-2 transition hover:text-white hover:decoration-white';

type DeprecationWarningProps = {
  allowSnooze?: boolean;
  ignoreSnooze?: boolean;
  surface?: 'standard' | 'setup';
};

const getCloseCount = () => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const storedValue = window.localStorage.getItem(CLOSE_COUNT_KEY);
  const closeCount = storedValue ? Number(storedValue) : 0;

  if (!Number.isFinite(closeCount) || closeCount < 0) {
    window.localStorage.removeItem(CLOSE_COUNT_KEY);
    return 0;
  }

  return Math.floor(closeCount);
};

const storeCloseCount = (closeCount: number) => {
  try {
    window.localStorage.setItem(CLOSE_COUNT_KEY, String(closeCount));
  } catch {
    // Ignore localStorage failures; the close still applies to this view.
  }
};

const getDismissedUntil = () => {
  if (typeof window === 'undefined') {
    return 0;
  }

  if (getCloseCount() < CLOSES_REQUIRED_FOR_SNOOZE) {
    window.localStorage.removeItem(DISMISSAL_KEY);
    return 0;
  }

  const storedValue = window.localStorage.getItem(DISMISSAL_KEY);
  const dismissedUntil = storedValue ? Number(storedValue) : 0;

  if (!Number.isFinite(dismissedUntil)) {
    window.localStorage.removeItem(DISMISSAL_KEY);
    return 0;
  }

  return dismissedUntil;
};

const DeprecationWarning = ({
  allowSnooze = true,
  ignoreSnooze = false,
  surface = 'standard',
}: DeprecationWarningProps) => {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  const dismissalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissalTimer = useCallback(() => {
    if (dismissalTimerRef.current) {
      clearTimeout(dismissalTimerRef.current);
      dismissalTimerRef.current = null;
    }
  }, []);

  const scheduleReappearance = useCallback(
    (delayMs: number) => {
      clearDismissalTimer();
      dismissalTimerRef.current = setTimeout(() => {
        setIsVisible(true);
        dismissalTimerRef.current = null;
      }, delayMs);
    },
    [clearDismissalTimer]
  );

  useEffect(() => {
    setHasMounted(true);
    setCloseCount(getCloseCount());
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    const remainingDismissalMs = ignoreSnooze
      ? 0
      : getDismissedUntil() - Date.now();

    if (remainingDismissalMs > 0) {
      setIsVisible(false);
      scheduleReappearance(remainingDismissalMs);
    } else {
      clearDismissalTimer();
      setIsVisible(true);
    }
  }, [
    clearDismissalTimer,
    hasMounted,
    ignoreSnooze,
    router.asPath,
    scheduleReappearance,
  ]);

  useEffect(() => clearDismissalTimer, [clearDismissalTimer]);

  useLockBodyScroll(isVisible, !hasMounted);

  const closeWarning = () => {
    const nextCloseCount = getCloseCount() + 1;

    storeCloseCount(nextCloseCount);
    setCloseCount(nextCloseCount);
    clearDismissalTimer();
    setIsVisible(false);
  };

  const snoozeWarning = () => {
    if (closeCount < CLOSES_REQUIRED_FOR_SNOOZE || !allowSnooze) {
      return;
    }

    const dismissedUntil = Date.now() + DISMISSAL_DURATION_MS;

    try {
      window.localStorage.setItem(DISMISSAL_KEY, String(dismissedUntil));
    } catch {
      // Ignore localStorage failures; the current view can still be dismissed.
    }

    setIsVisible(false);
    scheduleReappearance(DISMISSAL_DURATION_MS);
  };

  if (!hasMounted || !isVisible) {
    return null;
  }

  const snoozeUnlocked = closeCount >= CLOSES_REQUIRED_FOR_SNOOZE;
  const remainingCloses = Math.max(CLOSES_REQUIRED_FOR_SNOOZE - closeCount, 0);
  const closeProgress = Math.min(closeCount, CLOSES_REQUIRED_FOR_SNOOZE);
  const setupOnly = surface === 'setup' || !allowSnooze;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] flex min-h-screen items-center justify-center overflow-y-auto bg-black/80 px-3 py-6 backdrop-blur-md sm:px-6"
      data-testid="deprecation-warning"
      role="presentation"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deprecation-warning-title"
        aria-describedby="deprecation-warning-description"
        className="bg-slate-950 shadow-red-950/70 relative w-full max-w-5xl overflow-hidden rounded-3xl border border-red-200/40 text-red-50 shadow-2xl ring-1 ring-white/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.2),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-400 via-orange-300 to-red-600" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-red-300/20" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-red-300/20" />

        <div className="relative grid gap-0 lg:grid-cols-[0.9fr_1.35fr]">
          <aside className="bg-red-950/70 border-b border-red-200/20 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center rounded-full border border-red-200/40 bg-black/30 px-3 py-1 text-xs font-black uppercase tracking-[0.28em] text-red-100 shadow-inner">
              Critical legacy risk
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-xl shadow-black/50 ring-4 ring-red-200/20">
                <ShieldExclamationIcon className="h-10 w-10" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
                  Overseerr Anime
                </p>
                <p className="text-3xl font-black leading-none text-white sm:text-4xl">
                  Deprecated
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-red-200/30 bg-black/30 p-4">
              <div className="flex items-center justify-between text-sm font-semibold text-red-100">
                <span>Close count</span>
                <span>{closeProgress}/5</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((index) => (
                  <span
                    key={`warning-close-progress-${index}`}
                    className={`h-2 rounded-full transition-colors ${
                      index < closeProgress
                        ? 'bg-red-300 shadow-lg shadow-red-500/40'
                        : 'bg-red-950 ring-1 ring-red-200/20'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-5 text-red-100/90">
                {setupOnly
                  ? 'Setup is close-only. Keep going, but this warning will return elsewhere.'
                  : snoozeUnlocked
                  ? '48-hour snooze is now unlocked. It will still return after the timer expires.'
                  : `${remainingCloses} more close${
                      remainingCloses === 1 ? '' : 's'
                    } before the 48-hour snooze unlocks.`}
              </p>
            </div>
          </aside>

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-orange-200">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Do not treat this as maintained software
                </p>
                <h2
                  id="deprecation-warning-title"
                  className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl"
                >
                  The <code>overseerr-anime</code> Docker image is deprecated,
                  unmaintained, and risky to keep running.
                </h2>
              </div>
              <button
                type="button"
                onClick={closeWarning}
                className="rounded-full border border-white/20 bg-white/10 p-2 text-red-100 shadow-lg transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-label="Close deprecation warning"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <p
              id="deprecation-warning-description"
              className="mt-5 text-base leading-7 text-red-50/90"
            >
              This fork is built from an old Overseerr v1.34-era pull request
              for anime-specific instances. It will not receive further updates
              and may contain unfixed CVEs inherited from the abandoned
              dependency stack. Running it for a live household or public
              service is a high-risk legacy choice; plan a migration instead of
              treating this as maintained software.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-inner">
                <p className="font-bold text-white">Recommended path</p>
                <p className="mt-2 text-sm leading-6 text-red-100/90">
                  Migrate to the maintained{' '}
                  <a
                    href="https://github.com/seerr-team/seerr"
                    target="_blank"
                    rel="noreferrer"
                    className={linkClassName}
                  >
                    Seerr
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>{' '}
                  project and follow its migration guide.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-inner">
                <p className="font-bold text-white">Closest workaround</p>
                <p className="mt-2 text-sm leading-6 text-red-100/90">
                  <a
                    href="https://github.com/varthe/Redirecterr"
                    target="_blank"
                    rel="noreferrer"
                    className={linkClassName}
                  >
                    Redirecterr
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>{' '}
                  can route requests, but it is webhook-driven and can conflict
                  with existing Seerr/Overseerr webhook workflows.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-inner">
                <p className="font-bold text-white">Future alternative</p>
                <p className="mt-2 text-sm leading-6 text-red-100/90">
                  Seerr PR{' '}
                  <a
                    href="https://github.com/seerr-team/seerr/pull/2452"
                    target="_blank"
                    rel="noreferrer"
                    className={linkClassName}
                  >
                    #2452
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>{' '}
                  is intended to add routing-rule behavior, but it is a draft
                  and is not a drop-in fix today.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-orange-200/30 bg-orange-500/10 p-4 text-sm leading-6 text-orange-50">
              <div className="flex gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-200" />
                <p>
                  Closing only hides this appearance. The 48-hour dismissal is
                  intentionally locked until this warning has been closed five
                  times, and even then it returns every 48 hours.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {allowSnooze && (
                <button
                  type="button"
                  onClick={snoozeWarning}
                  disabled={!snoozeUnlocked}
                  className={`inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-red-200 ${
                    snoozeUnlocked
                      ? 'shadow-red-950/40 border-red-200 bg-red-500 text-white shadow-lg hover:bg-red-400'
                      : 'cursor-not-allowed border-white/10 bg-white/5 text-red-100/60'
                  }`}
                >
                  {snoozeUnlocked ? (
                    <ClockIcon className="mr-2 h-5 w-5" />
                  ) : (
                    <LockClosedIcon className="mr-2 h-5 w-5" />
                  )}
                  {snoozeUnlocked
                    ? 'Dismiss for 48 hours'
                    : `Locked until ${CLOSES_REQUIRED_FOR_SNOOZE} closes`}
                </button>
              )}
              <button
                type="button"
                onClick={closeWarning}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/30 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <XMarkIcon className="mr-2 h-5 w-5" />
                Close warning
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
};

export default DeprecationWarning;
