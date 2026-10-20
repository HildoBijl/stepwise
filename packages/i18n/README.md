# @step-wise/i18n

`@step-wise/i18n` provides reusable internationalization logic and React integration for Step-Wise applications. The package is transitioning from its initial Lingui trial to a semantic message model backed by XLIFF 2.1 catalogs.

The format-independent message model represents text, variables, components with named translatable slots, plurals, and selections as a typed AST. It provides normalization, validation, deterministic fingerprints, and source-compatibility classification. Catalogs can be parsed from and serialized to the package's [XLIFF 2.1 profile](./XLIFF.md).

The new React integration can register component translation behavior and convert authored React content into this message model. Rendering translated messages and the public authoring components are still under development while the existing Lingui trial remains available.


## Installation

```bash
npm install @step-wise/i18n react
```


## Usage

The new XLIFF runtime receives the active and source locales from the application. Its catalog loader returns parsed `Catalog` values:

```tsx
import { I18nProvider } from '@step-wise/i18n'

export function App({ children }: { children: React.ReactNode }) {
	return <I18nProvider locale={locale} sourceLocale="en" loadCatalog={applicationCatalogLoader}>{children}</I18nProvider>
}
```

The runtime caches catalogs by locale and path, deduplicates concurrent loads, and exposes its state through `useI18n`. Catalog-bound message resolution will be connected in the next implementation stage.

The temporary Lingui trial remains available through `LinguiI18nProvider` and `LinguiTranslationCatalog` while frontend pages migrate to the XLIFF runtime:

```tsx
import { LinguiI18nProvider, LinguiTranslationCatalog, setupI18n } from '@step-wise/i18n'

const i18n = setupI18n({ locale: 'en', messages: { en: {} } })

export function Trial({ children }: { children: React.ReactNode }) {
	return <LinguiI18nProvider i18n={i18n} loadCatalog={linguiCatalogLoader}>{children}</LinguiI18nProvider>
}
```

Catalog boundaries load and cache the requested catalog for the active locale:

```tsx
<LinguiTranslationCatalog path="pages/home" fallback={<LoadingPage />}>
	<Home />
</LinguiTranslationCatalog>
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


## React message conversion

Ordinary custom components and native elements such as `strong` use the default behavior automatically: their kebab-case component name becomes the tag and their children are translated. Wrap components whose behavior differs from these defaults.

```tsx
import { reactToMessage, withTranslation } from '@step-wise/i18n'

const TranslatedEquation = withTranslation(Equation, {
	tag: 'equation',
	translatedProps: [],
	canCopy: false,
	canDelete: false,
})

const TranslatedInput = withTranslation(Input, {
	tag: 'input-field',
	translatedProps: ['label'],
})

const message = reactToMessage(
	<>Welcome {{ name }}. <TranslatedInput label="Your answer" /> <TranslatedEquation>x^2</TranslatedEquation></>,
)
```

`translatedProps` defaults to `['children']`. Each listed prop becomes a named message slot; unlisted props remain in the original React element and do not enter translation catalogs. Anonymous components must be wrapped with an explicit tag because no stable default can be derived for them. Copying and deletion are allowed by default and can be disabled independently for required or identity-sensitive components.

Use `Translation`, `Plural`, and `Select` to author messages. The `{{ name }}` shorthand creates a named runtime variable; `variable('name', value)` remains available when an explicit expression is clearer. Raw plural and select values receive deterministic internal names and can be rendered through their scoped `Value` components. Passing a one-property object names the construct variable explicitly.

```tsx
<Translation id="messages">
	<Plural value={{ count }}>
		<Plural.One>There is one message.</Plural.One>
		<Plural.Other>There are <Plural.Value /> messages.</Plural.Other>
	</Plural>
</Translation>

<Translation id="role">
	<Select value={role}>
		<Select.Case value="teacher">Teacher</Select.Case>
		<Select.Other><Select.Value /> is a member</Select.Other>
	</Select>
</Translation>
```

`messageToReact` applies a translated `Message` to its original React source. It retains preserved props, correlates reordered components by occurrence ID, resolves variables and constructs, and enforces component copy/delete permissions. Until the XLIFF catalog runtime is connected, `Translation` renders its English source.


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
