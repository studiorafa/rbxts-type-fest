# Maintenance

Use Node 24 and npm 11.19.0.

```sh
npm ci
npm run sync
npm run sync -- --check
npm run verify
npm run prepare:bootstrap
```

`sync -- --version 5.10.0` selects a specific upstream release. `--check` reproduces the recorded release without replacing files. `verify` checks the declarations, packs the package, installs it in a temporary Roblox project, and runs `rbxtsc`.

The package contains `src/**/*.d.ts`, `README.md`, `package.json`, and `LICENSE`. The license includes Type-Fest's MIT notice. Compatibility data and maintenance documents stay in the repository.

## Publishing

The workflow checks for upstream releases daily at 00:17 UTC. It commits and pushes generated files before publishing the tested tarball. An unpublished committed version is retried. Published versions cannot be replaced.

1. Obtain npm publishing access to `@rbxts`.
2. Store a short-lived granular publishing token as the repository's `NPM_TOKEN` Actions secret.
3. Dispatch `sync-and-publish.yml` with `bootstrap=true`. It verifies both releases and publishes the preceding stable version under `bootstrap`.
4. Configure npm trusted publishing for `studiorafa/rbxts-type-fest`, workflow `sync-and-publish.yml`, with direct publishing allowed.
5. Set the Actions variable `PUBLISH_ENABLED=true` and dispatch normal mode within two days to publish the latest version through OIDC.
6. Remove the bootstrap secret and revoke its token after checking the release.

Normal mode uses OIDC. It does not receive `NPM_TOKEN`. Leave `PUBLISH_ENABLED=false` while organization access is pending.

`prepare:bootstrap` writes both tarballs, compatibility reports, and checksums to `artifacts/`. For local use, install a tarball from your Roblox project:

```sh
npm install /path/to/rbxts-type-fest-5.10.0.tgz
```

GitHub can delay scheduled runs or disable them after 60 days without repository activity. Use manual dispatch or re-enable the schedule when needed.

Earlier plans and setup notes are in [archive](archive/).
