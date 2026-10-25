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

Use `Translation`, `Plural`, `Select`, and `Condition` to author messages. The `{{ name }}` shorthand creates a named runtime variable; `variable('name', value)` remains available when an explicit expression is clearer. Raw construct values receive deterministic internal names. Passing a one-property object names the construct variable explicitly.

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

<Translation id="availability">
	<Condition value={isAvailable}>
		<Condition.True>Available</Condition.True>
		<Condition.False>Unavailable</Condition.False>
	</Condition>
</Translation>
```

`Condition` represents an exhaustive boolean choice. Either branch may be omitted in React authoring; an omitted outcome is stored as an empty branch and renders nothing.

`messageToReact` applies a translated `Message` to its original React source. It retains preserved props, correlates reordered components by occurrence ID, resolves variables and constructs, and enforces component copy/delete permissions.

`LocalizedList` formats a list of strings or React nodes with the active locale's punctuation and conjunctions. It is opaque inside an outer translation because it performs its own locale-sensitive rendering:

```tsx
<LocalizedList items={['Alex', <strong>Bob</strong>, 'Carl']} />
<LocalizedList items={options} type="disjunction" style="short" />
```

`LocalizedDuration` formats a fixed non-negative duration without relating it to the present. `RelativeTime` compares a date with the current time, includes the locale's equivalent of “ago” or “in”, and schedules its next update for when the displayed value changes. Both use `minute` as their smallest unit by default:

```tsx
<LocalizedDuration milliseconds={exerciseDuration} smallestUnit="second" />
<RelativeTime date={lastActivityAt} />
```


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


## Catalog synchronization

The logic-only `@step-wise/i18n/catalog` entry point exposes `synchronizeCatalog` to copy the latest source hierarchy and messages into a target Catalog. Existing translations and obsolete target entries are retained. A changed source automatically makes the preserved target `needs-review` or `stale` through its reviewed-source fingerprints; a newly introduced unit is `missing`. Node tooling can import locale validation without loading the React integration through the lightweight `@step-wise/i18n/locale` entry point.

`validateCatalogSynchronization` checks that every source unit exists in the target Catalog, that its source snapshot is current, that its translation status is `current`, and that its target is semantically compatible with the source. The underlying `validateMessageCompatibility` check permits reordering, repeated generic components, and locale-specific plural categories while retaining variables, component identities and slots, plural constructs, exact plural cases, and select cases. React-specific component copy and deletion permissions remain runtime concerns.

Step-Wise exposes `npm run i18n:sync` to update its Dutch and German XLIFF files and `npm run i18n:check` for a read-only CI check. Initialize the Catalog tree for a new locale with `npm run i18n:init -- <locale>` before explicitly adding that locale to the frontend settings. The initializer refuses to overwrite existing Catalogs and creates source snapshots without targets.

After updating a target, use `npm run i18n:review -- <locale> <catalog.xlf> [group ...] <unit>` to validate it and record that it was reviewed against its current source, or pass `--all` after the catalog path to review every compatible existing target in that catalog. Obsolete target entries remain a manual cleanup concern.


## Package boundary

This package owns the format-independent message model, catalog semantics, synchronization checks, XLIFF codec, React integration, and generic lazy-catalog coordination. Applications own their supported locales, catalog paths, locale selection, and filesystem tooling.
