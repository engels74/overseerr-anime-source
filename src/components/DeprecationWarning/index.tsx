import { useLockBodyScroll } from '@app/hooks/useLockBodyScroll';
import {
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const DISMISSAL_KEY = 'overseerr-anime-deprecation-warning-dismissed-until';
const DISMISSAL_DURATION_MS = 48 * 60 * 60 * 1000;

const linkClassName =
  'inline-flex items-center gap-1 font-semibold text-red-100 underline decoration-red-200 decoration-2 underline-offset-2 transition hover:text-white hover:decoration-white';

type DeprecationWarningProps = {
  allowSnooze?: boolean;
  ignoreSnooze?: boolean;
  surface?: 'standard' | 'setup';
};

const getDismissedUntil = () => {
  if (typeof window === 'undefined') {
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
    clearDismissalTimer();
    setIsVisible(false);
  };

  const snoozeWarning = () => {
    if (!allowSnooze) {
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

  const setupOnly = surface === 'setup' || !allowSnooze;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] flex min-h-screen items-center justify-center overflow-y-auto bg-black/80 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-8"
      data-testid="deprecation-warning"
      role="presentation"
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deprecation-warning-title"
        aria-describedby="deprecation-warning-description"
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-red-200/30 bg-[#050816] text-red-50 shadow-2xl shadow-red-900/70 ring-1 ring-white/10 sm:max-h-[calc(100vh-4rem)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.14),transparent_32%)]" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-400 via-orange-300 to-red-600" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full border border-red-300/20" />

        <div className="relative p-5 sm:p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-900/60 ring-4 ring-red-200/10">
                <ShieldExclamationIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-200">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Critical legacy risk
                </p>
                <h2
                  id="deprecation-warning-title"
                  className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl"
                >
                  The <code>overseerr-anime</code> image is deprecated and
                  unmaintained.
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={closeWarning}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-red-100 shadow-lg transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-200"
              aria-label="Close deprecation warning"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <p
            id="deprecation-warning-description"
            className="mt-4 text-sm leading-6 text-red-50/90 sm:text-base"
          >
            This fork is built from an old Overseerr v1.34-era pull request. It
            will not receive updates and may contain unfixed CVEs, so treat it
            as temporary legacy software and plan a migration.
          </p>

          <div className="mt-5 rounded-2xl border border-orange-200/25 bg-orange-500/10 p-4 text-sm leading-6 text-orange-50">
            <p>
              <span className="font-bold text-white">Recommended:</span> migrate
              to the maintained{' '}
              <a
                href="https://github.com/seerr-team/seerr"
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Seerr
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>{' '}
              project. If you need request routing today, review{' '}
              <a
                href="https://github.com/varthe/Redirecterr"
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                Redirecterr
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>{' '}
              and its webhook tradeoffs.
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-red-100/90">
            {setupOnly
              ? 'Close this setup notice to continue. The warning can still appear elsewhere so operators see the risk.'
              : 'Close it for this visit, or use the reminder if you need a short grace period before migrating.'}
          </p>

          {allowSnooze && (
            <div className="mt-5 flex sm:justify-end">
              <button
                type="button"
                onClick={snoozeWarning}
                className="inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 sm:w-auto"
              >
                <ClockIcon className="mr-2 h-5 w-5" />
                Remind me in 48 hours
              </button>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
};

export default DeprecationWarning;
