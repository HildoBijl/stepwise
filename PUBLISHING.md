# Publishing packages

Step-Wise packages are currently versioned and published manually. Only packages without `"private": true` may be published.


## Prepare a release

1. Update the changed package's `version` in its `package.json`:
   - patch for compatible fixes: `0.1.0` to `0.1.1`;
   - minor for new or breaking pre-1.0 functionality: `0.1.0` to `0.2.0`.
2. Update internal dependency ranges and dependent package versions where required.
3. Refresh the lockfile:

   ```bash
   npm install --package-lock-only
   ```

4. Build, stage, and verify every public package:

   ```bash
   npm run prepare:package-publications
   ```

The publishable packages are generated under `.release/`. Do not publish directly from `packages/`.
Review and commit the version, dependency-range, lockfile, and changelog changes before publishing.


## Publish a package

Log in to an npm account with write access to the `@step-wise` organization:

```bash
npm login
npm whoami
```

Optionally inspect the final tarball, then publish it:

```bash
npm pack .release/js-utils --dry-run
npm publish .release/js-utils
```

Publish dependencies before packages that depend on them. npm may request additional browser or two-factor authentication during publication.


## Verify the publication

Registry metadata may take several minutes to become available. Once it has propagated, check and install the exact version from a separate project:

```bash
npm view @step-wise/js-utils@0.1.0
npm install @step-wise/js-utils@0.1.0
```

After a successful publication, create a corresponding Git tag or release if desired. Never attempt to reuse a version already published to npm.
