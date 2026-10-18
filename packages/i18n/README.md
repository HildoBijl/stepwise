# @step-wise/i18n

`@step-wise/i18n` provides reusable internationalization logic and React integration for Step-Wise applications. The package is transitioning from its initial Lingui trial to a semantic message model backed by XLIFF 2.1 catalogs.

The format-independent message model is available now. It represents text, variables, components with named translatable slots, plurals, and selections as a typed AST. It also provides normalization, validation, deterministic fingerprints, and source-compatibility classification. See [XLIFF.md](./XLIFF.md) for the catalog profile being implemented around this model.


## Installation

```bash
npm install @step-wise/i18n react
```


## Usage

Create and configure an i18n instance in the application, then provide it to React:

```tsx
import { I18nProvider, setupI18n, TranslationCatalog } from '@step-wise/i18n'

const i18n = setupI18n({ locale: 'en', messages: { en: {} } })

export function App({ children }: { children: React.ReactNode }) {
	return <I18nProvider i18n={i18n} loadCatalog={applicationCatalogLoader}>{children}</I18nProvider>
}
```

Catalog boundaries load and cache the requested catalog for the active locale:

```tsx
<TranslationCatalog path="pages/home" fallback={<LoadingPage />}>
	<Home />
</TranslationCatalog>
```

The application decides how paths resolve to catalog modules. Bundler-specific discovery such as Vite's `import.meta.glob` therefore remains outside this package.

Messages are authored with Lingui's React macros:

```tsx
import { Trans } from '@lingui/react/macro'

export function Greeting() {
	return <Trans>Hello!</Trans>
}
```

The consuming application is responsible for configuring the Lingui compiler and extractor.


## Package boundary

This package owns the format-independent message model, catalog semantics, React integration, and generic lazy-catalog coordination. Applications own their supported locales, catalog paths, and locale selection. Node-only XLIFF and build tooling will be exposed separately from the browser runtime so filesystem dependencies cannot enter frontend bundles.
