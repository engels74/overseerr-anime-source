import Alert from '@app/components/Common/Alert';

const linkClassName =
  'font-medium text-yellow-100 underline transition hover:text-white';

const DeprecationWarning = () => (
  <Alert title="Overseerr Anime is deprecated and no longer maintained">
    <div className="space-y-2">
      <p>
        This fork and the <code>overseerr-anime</code> Docker image are based on
        an old Overseerr pull request. They will not receive further updates and
        may contain unfixed CVEs inherited from the abandoned dependency stack.
      </p>
      <details className="rounded-md border border-yellow-500 border-opacity-40 bg-black bg-opacity-20 p-3">
        <summary className="cursor-pointer text-sm font-medium text-yellow-100">
          Read more about the known axios CVE risk
        </summary>
        <div className="mt-2 space-y-2">
          <p>
            This build ships <code>axios</code> 1.3.4, which is in the affected
            range for{' '}
            <a
              href="https://github.com/axios/axios/security/advisories/GHSA-fvcv-3m26-pcqx"
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              CVE-2026-40175
            </a>
            , an Unrestricted Cloud Metadata Exfiltration vulnerability via a
            header injection chain. This is separate from the axios package
            hijack incident.
          </p>
          <p>
            Seerr patched this in{' '}
            <a
              href="https://github.com/seerr-team/seerr/releases/tag/v3.1.1"
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              v3.1.1
            </a>{' '}
            or later. Overseerr Anime is built from the older v1.34.0-era source
            and will not receive that dependency update.
          </p>
        </div>
      </details>
      <p>
        Migrate to the maintained{' '}
        <a
          href="https://github.com/seerr-team/seerr"
          target="_blank"
          rel="noreferrer"
          className={linkClassName}
        >
          Seerr
        </a>{' '}
        project where possible. There is no exact drop-in replacement for this
        anime-instance fork today. The closest workaround is{' '}
        <a
          href="https://github.com/varthe/Redirecterr"
          target="_blank"
          rel="noreferrer"
          className={linkClassName}
        >
          Redirecterr
        </a>
        , but it is webhook-driven and can conflict with any existing
        Seerr/Overseerr webhook workflow.
      </p>
      <p>
        Seerr pull request{' '}
        <a
          href="https://github.com/seerr-team/seerr/pull/2452"
          target="_blank"
          rel="noreferrer"
          className={linkClassName}
        >
          #2452
        </a>{' '}
        may eventually provide built-in routing-rule behavior, but it is still a
        draft and has not been merged.
      </p>
    </div>
  </Alert>
);

export default DeprecationWarning;
