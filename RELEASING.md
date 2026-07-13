# Releasing `@syntronic/ngx-highlight`

This package is published to npm by the [`release.yml`](.github/workflows/release.yml)
workflow, which runs when a **GitHub Release is published**. Authentication uses
npm **Trusted Publishing (OIDC)** — there is no `NPM_TOKEN` stored anywhere.

## One-time setup

Trusted Publishing can only be configured for a package that **already exists**
on npm. The very first version therefore has to be published manually; every
release after that is automatic.

### Step 1 — Publish `1.0.0` manually (one time only)

On your machine, from the repo root:

```bash
npm login                 # log in to the npm account/org that owns @syntronic
npm run build             # produces dist/ngx-highlight
npm publish ./dist/ngx-highlight
```

Notes:

- The scope `@syntronic` must exist and your npm user must be allowed to publish
  to it. If the org/scope does not exist yet, create it at
  <https://www.npmjs.com/org/create> (a free org is fine for public packages).
- `publishConfig.access` is already set to `public` in the package, so the
  scoped package is published publicly without extra flags.
- Verify afterwards: <https://www.npmjs.com/package/@syntronic/ngx-highlight>

### Step 2 — Configure the Trusted Publisher on npmjs.com

1. Go to the package settings:
   `https://www.npmjs.com/package/@syntronic/ngx-highlight/access`
2. Find the **Trusted Publisher** section and choose **GitHub Actions**.
3. Fill in:
   - **Organization or user:** `SynTronic`
   - **Repository:** `ngx-highlight`
   - **Workflow filename:** `release.yml`
   - **Environment:** leave empty (the workflow does not use a GitHub environment)
4. Save.

After this, npm accepts publishes coming from this repo's `release.yml` workflow
without any token, and each release gets a **provenance** badge automatically.

### Step 3 — (Recommended) require 2FA / disable legacy tokens

Once trusted publishing works, you no longer need automation tokens for CI. If
you created any for this package, revoke them under **Access Tokens** on npm.

## Cutting a release (every time after setup)

1. Bump the version in [`projects/ngx-highlight/package.json`](projects/ngx-highlight/package.json)
   (e.g. `1.0.0` → `1.0.1`) following [SemVer](https://semver.org/).
2. Move the relevant notes in [`CHANGELOG.md`](CHANGELOG.md) from `Unreleased`
   into a new version section, and update the compare links at the bottom.
3. Commit and push to `main`:
   ```bash
   git add projects/ngx-highlight/package.json CHANGELOG.md
   git commit -m "chore: release vX.Y.Z"
   git push
   ```
4. Create the GitHub Release with a tag `vX.Y.Z` (the tag **must** match the
   `package.json` version — the workflow enforces this):
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-from-tag
   ```
   or use the GitHub UI (Releases → Draft a new release → create tag `vX.Y.Z`).
5. Publishing the release triggers `release.yml`, which lints, tests, builds, and
   runs `npm publish` from `dist/ngx-highlight`. Watch it under the **Actions**
   tab.

## GitHub repository permissions

The workflow declares the permissions it needs inline
(`id-token: write`, `contents: read`), so no repo-wide change is strictly
required. Make sure Actions is allowed to use these:

- **Settings → Actions → General → Workflow permissions**: the default
  "Read repository contents" is enough — the workflow requests `id-token: write`
  explicitly, which is permitted as long as Actions are enabled for the repo.
- If your org restricts OIDC, ensure the repository is allowed to request an ID
  token.

## Verifying a release

- npm page shows the new version and a **Provenance** section:
  <https://www.npmjs.com/package/@syntronic/ngx-highlight>
- Quick install test in a scratch project:
  ```bash
  npm install @syntronic/ngx-highlight
  ```
