# @step-wise/i18n

`@step-wise/i18n` provides the shared React runtime for internationalization in Step-Wise applications. It is a deliberately thin integration around Lingui: applications own their supported locales, catalogs, catalog resolution, and extraction configuration.


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

This package exposes shared runtime integration and generic lazy-catalog coordination. Application-specific catalogs, path resolution, locale selection, fallback policy, and build tooling belong to the consuming application. Additional abstractions should only be added where Lingui does not already provide a sufficiently clear API.
