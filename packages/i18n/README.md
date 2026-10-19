# @step-wise/i18n

`@step-wise/i18n` provides reusable internationalization logic and React integration for Step-Wise applications. The package is transitioning from its initial Lingui trial to a semantic message model backed by XLIFF 2.1 catalogs.

The format-independent message model represents text, variables, components with named translatable slots, plurals, and selections as a typed AST. It provides normalization, validation, deterministic fingerprints, and source-compatibility classification. Catalogs can be parsed from and serialized to the package's [XLIFF 2.1 profile](./XLIFF.md).


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


## XLIFF catalogs

Catalog and unit types are available from the main package entry point. The XML codec has a separate entry point so importing the React integration does not load an XML parser:

```ts
import { type Catalog, assertValidCatalog, getCatalogUnits, getCatalogUnitStatus, validateCatalog } from '@step-wise/i18n'
import { parseXliff, serializeXliff } from '@step-wise/i18n/xliff'

const catalog: Catalog = {
	sourceLocale: 'en',
	entries: [{
		type: 'group',
		id: 'home',
		entries: [{
			type: 'unit',
			id: 'welcome',
			source: [{ type: 'text', value: 'Welcome!' }],
		}],
	}, {
		type: 'unit',
		id: 'footer',
		source: [{ type: 'text', value: 'Made with care.' }],
	}],
}

const xml = serializeXliff(catalog)
const restoredCatalog = parseXliff(xml)
const status = getCatalogUnitStatus(getCatalogUnits(restoredCatalog)[0]!)
```

Use `validateCatalog` to collect semantic catalog issues and `assertValidCatalog` when invalid data should throw immediately. Serialization asserts and normalizes its input. Parsing rejects malformed XML and documents outside the supported profile with `InvalidXliffError`.


## Package boundary

This package owns the format-independent message model, catalog semantics, XLIFF codec, React integration, and generic lazy-catalog coordination. Applications own their supported locales, catalog paths, and locale selection. Future filesystem-based synchronization and validation tools will remain separate from the browser runtime.
