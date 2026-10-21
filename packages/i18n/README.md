# @step-wise/i18n

`@step-wise/i18n` provides reusable internationalization logic and React integration for Step-Wise applications, backed by a semantic message model and XLIFF 2.1 catalogs.

The format-independent message model represents text, variables, components with named translatable slots, plurals, and selections as a typed AST. It provides normalization, validation, deterministic fingerprints, and source-compatibility classification. Catalogs can be parsed from and serialized to the package's [XLIFF 2.1 profile](./XLIFF.md).

The React integration can register component translation behavior, convert authored React content into this message model, and render translated catalogs lazily at runtime.


## Installation

```bash
npm install @step-wise/i18n react
```


## Usage

The new XLIFF runtime receives the active and source locales from the application. Its catalog loader returns parsed `Catalog` values:

```tsx
import { I18nProvider } from '@step-wise/i18n'

export function App({ children }: { children: React.ReactNode }) {
	return <I18nProvider
		locale={locale}
		sourceLocale="en"
		loadCatalog={applicationCatalogLoader}
		registerSource={developmentSourceRegistrar}
	>{children}</I18nProvider>
}
```

The runtime caches catalogs by locale and path, deduplicates concurrent loads, and exposes its state through `useI18n`. Translation scopes distinguish folder paths, loadable catalogs, and nested catalog groups:

```tsx
<TranslationFolder path={['eduContent', ...groupPath]}>
	<TranslationCatalog name={moduleId}>
		<TranslationGroup path="practice">
			<Translation id="introduction">Let us practice.</Translation>
		</TranslationGroup>
	</TranslationCatalog>
</TranslationFolder>
```

Folders and groups extend their parent scope by default and accept `extend={false}` to start from their respective root. Their `path` accepts either one segment as a string or multiple segments as an array; strings are never split on punctuation. A catalog can provide an absolute `folder` directly and always resets the group scope. Nested catalogs replace the active catalog for their subtree and restore the outer scope afterward. Catalogs are loaded on demand through `useCatalog`. `Translation` resolves its scoped Catalog unit, renders a current target for the active locale, and falls back to its authored source while loading or when no usable target exists.

Every rendered `Translation` also supplies its authored source to the optional `registerSource` callback, regardless of the currently displayed locale. Applications can use this hook in development to persist encountered sources. Filesystem access and bundler integration remain application-owned; production applications should omit the callback.

The application decides how paths resolve to catalog modules. Bundler-specific discovery such as Vite's `import.meta.glob` therefore remains outside this package.


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

`messageToReact` applies a translated `Message` to its original React source. It retains preserved props, correlates reordered components by occurrence ID, resolves variables and constructs, and enforces component copy/delete permissions.


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
