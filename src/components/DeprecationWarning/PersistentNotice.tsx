import {
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/solid';

type PersistentDeprecationNoticeProps = {
  surface: 'settings' | 'sidebar';
};

const linkClassName =
  'inline-flex items-center gap-1 font-semibold text-red-100 underline decoration-red-200 decoration-2 underline-offset-2 transition hover:text-white hover:decoration-white';

const PersistentDeprecationNotice = ({
  surface,
}: PersistentDeprecationNoticeProps) => {
  if (surface === 'sidebar') {
    return (
      <aside
        aria-label="Deprecation notice"
        className="rounded-lg border border-red-400/30 bg-red-900/20 p-3 text-xs leading-5 text-red-100 shadow-lg shadow-red-900/20"
        data-testid="sidebar-deprecation-notice"
      >
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-200" />
          <div>
            <p className="font-bold text-white">Deprecated image</p>
            <p className="mt-1 text-red-100/90">
              This fork is unmaintained. Plan a migration to avoid legacy
              security risk.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-labelledby="settings-deprecation-notice-title"
      className="mb-4 rounded-xl border border-red-300/25 bg-gradient-to-r from-red-900/40 via-gray-800/80 to-orange-900/30 p-4 text-sm leading-6 text-red-50 shadow-xl shadow-red-900/20 ring-1 ring-white/5"
      data-testid="settings-deprecation-notice"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-orange-100 ring-1 ring-red-200/20">
          <ShieldExclamationIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p
            id="settings-deprecation-notice-title"
            className="font-bold text-white"
          >
            This Overseerr Anime version is deprecated and unmaintained.
          </p>
          <p className="mt-1 text-red-100/90">
            Keep this instance temporary and plan a migration path.
          </p>
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-red-200/20 bg-black/20 px-3 py-2 text-red-50/90">
        <summary className="cursor-pointer font-semibold text-orange-100 focus:outline-none focus:ring-2 focus:ring-red-200">
          Show migration and risk details
        </summary>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            This fork is built from an old Overseerr v1.34-era pull request and
            will not receive maintenance updates. Treat it as temporary legacy
            software because unfixed CVEs may remain.
          </p>
          <p>
            Recommended target:{' '}
            <a
              href="https://github.com/seerr-team/seerr"
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              Seerr
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
            . For request routing, review{' '}
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
      </details>
    </aside>
  );
};

export default PersistentDeprecationNotice;
