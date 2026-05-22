import {
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';

const DISMISSAL_KEY = 'overseerr-anime-deprecation-warning-dismissed-until';
const DISMISSAL_DURATION_MS = 48 * 60 * 60 * 1000;

const linkClassName =
  'inline-flex items-center gap-1 font-semibold text-red-100 underline decoration-red-200 decoration-2 underline-offset-2 transition hover:text-white hover:decoration-white';

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

const DeprecationWarning = () => {
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
    const remainingDismissalMs = getDismissedUntil() - Date.now();

    if (remainingDismissalMs > 0) {
      setIsVisible(false);
      scheduleReappearance(remainingDismissalMs);
    } else {
      setIsVisible(true);
    }

    return clearDismissalTimer;
  }, [clearDismissalTimer, scheduleReappearance]);

  const dismissWarning = () => {
    const dismissedUntil = Date.now() + DISMISSAL_DURATION_MS;

    try {
      window.localStorage.setItem(DISMISSAL_KEY, String(dismissedUntil));
    } catch {
      // Ignore localStorage failures; the current view can still be dismissed.
    }

    setIsVisible(false);
    scheduleReappearance(DISMISSAL_DURATION_MS);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section
      role="alert"
      aria-live="polite"
      data-testid="deprecation-warning"
      className="sticky top-20 z-40 mb-6 overflow-hidden rounded-xl border-2 border-red-300 bg-red-900 bg-opacity-95 text-red-50 shadow-2xl shadow-black/60 ring-4 ring-red-600 ring-opacity-40 backdrop-blur"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-black/60">
          <ExclamationTriangleIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-red-200">
              Critical deprecation and security notice
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
              Overseerr Anime and the <code>overseerr-anime</code> Docker image
              are deprecated and unmaintained.
            </h2>
          </div>

          <p className="text-sm leading-6 text-red-100 sm:text-base">
            This fork is built from an old Overseerr v1.34-era pull request for
            anime-specific instances. It will not receive further updates and
            may contain unfixed CVEs inherited from the abandoned dependency
            stack. Running it for a live household or public service is a
            high-risk legacy choice; plan a migration instead of treating this
            as maintained software.
          </p>

          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-red-300/40 bg-black/20 p-3">
              <p className="font-bold text-white">Recommended path</p>
              <p className="mt-1 text-red-100">
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
            <div className="rounded-lg border border-red-300/40 bg-black/20 p-3">
              <p className="font-bold text-white">Closest workaround</p>
              <p className="mt-1 text-red-100">
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
            <div className="rounded-lg border border-red-300/40 bg-black/20 p-3">
              <p className="font-bold text-white">Future alternative</p>
              <p className="mt-1 text-red-100">
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
                is intended to add routing-rule behavior, but it is a draft and
                is not a drop-in fix today.
              </p>
            </div>
          </div>

          <p className="rounded-md border border-red-200/50 bg-red-900/70 p-3 text-sm font-semibold text-white">
            You may dismiss this warning, but only for 48 hours. It will return
            every 48 hours so every user and administrator is repeatedly
            reminded that this deployment is deprecated and risky.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissWarning}
          className="inline-flex flex-shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-600 px-3 py-2 text-sm font-bold text-white shadow hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-900"
          aria-label="Dismiss deprecation warning for 48 hours"
        >
          <XMarkIcon className="mr-2 h-5 w-5" />
          Dismiss for 48 hours
        </button>
      </div>
    </section>
  );
};

export default DeprecationWarning;
