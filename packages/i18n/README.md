# @step-wise/i18n

`@step-wise/i18n` provides React translation authoring, locale-sensitive formatting, lazy catalog loading, translation validation, and XLIFF 2.1 serialization.


## Terminology

The package uses a few terms consistently throughout its API:

- A **Catalog** is the in-memory representation of one translation file. It identifies its source locale, optionally identifies a target locale, and contains translation units and groups.
- A **Catalog Group** organizes related units inside a Catalog. Groups may be nested.
- A **Catalog Unit** is one addressed translation entry. It contains a source Message and, in a target-language Catalog, may also contain a translated target Message.
- A **Message** is the structured content of one source or target translation. A Message can contain text, variables, React component placeholders, plurals, selections, and conditions.
- A **source locale** is the language in which Messages are authored in React code. A **target locale** is a language into which those Messages are translated.

Catalogs correspond to files; Messages correspond to the individual translatable entries within those files. The package stores Messages as a typed, format-independent tree in memory and persists Catalogs using its [XLIFF 2.1 profile](./XLIFF.md).


## Installation

```bash
npm install @step-wise/i18n react
```

React is a peer dependency.


## Authoring translations

Write source-language content directly inside `Translation`. The surrounding scope determines the Catalog and group, while `id` identifies the unit:

```tsx
import { Translation, TranslationCatalog, TranslationFolder, TranslationGroup } from '@step-wise/i18n'

export function Welcome() {
	return <TranslationFolder path="pages">
		<TranslationCatalog name="home">
			<TranslationGroup path="header">
				<h1><Translation id="title">Learn step by step</Translation></h1>
			</TranslationGroup>
		</TranslationCatalog>
	</TranslationFolder>
}
```

This addresses the `header/title` unit in the `pages/home` Catalog. In an application that maps Catalog addresses directly to files, that Catalog could be stored as `pages/home.xlf`.

`TranslationFolder` and `TranslationGroup` extend their parent scope by default. Pass `extend={false}` to replace the respective path from its root. Their `path` accepts either one segment as a string or several segments as an array. A `TranslationCatalog` selects a Catalog, resets the group scope, and may provide an absolute `folder` itself.

`Translation` can also receive an explicit `folder`, `catalog`, `group`, and `id`. Omitted address parts come from the surrounding scope where the address rules permit it.

### Variables and grammatical constructs

The `{{ name }}` shorthand creates a named runtime variable; `variable('name', value)` is the explicit equivalent. `Plural`, `Select`, and `Condition` describe grammatical branches within the same Message.

```tsx
<Translation id="messages">
	<Plural value={{ count }}>
		<Plural.One>There is one message.</Plural.One>
		<Plural.Other>There are <Plural.Value /> messages.</Plural.Other>
	</Plural>
</Translation>

<Translation id="role">
	<Select value={{ role }}>
		<Select.Case value="teacher">Teacher</Select.Case>
		<Select.Other><Select.Value /> is a member</Select.Other>
	</Select>
</Translation>

<Translation id="availability">
	<Condition value={{ isAvailable }}>
		<Condition.True>Available</Condition.True>
		<Condition.False>Unavailable</Condition.False>
	</Condition>
</Translation>
```

`Plural` uses the active locale's `Intl.PluralRules`. It supports cardinal and ordinal forms, locale-specific categories, and exact-number branches. Every Plural requires `Plural.Other`.

`Select` chooses a branch using a string, number, or boolean value and requires `Select.Other`. `Condition` represents a boolean choice; either condition branch may be omitted, in which case that outcome renders nothing.

### Locale-sensitive formatting

Formatting components use the active locale directly and are opaque when placed inside a larger Translation.

`LocalizedList` applies locale-specific punctuation and conjunctions while retaining React nodes:

```tsx
<LocalizedList items={['Alex', <strong key="bob">Bob</strong>, 'Carl']} />
<LocalizedList items={options} type="disjunction" style="short" />
```

`LocalizedDuration` formats a fixed non-negative duration. `RelativeTime` compares a date with the current time, includes the locale's equivalent of “ago” or “in,” and updates when its displayed value changes. Both use `minute` as their smallest unit by default:

```tsx
<LocalizedDuration milliseconds={exerciseDuration} smallestUnit="second" />
<RelativeTime date={lastActivityAt} />
```

### Plain-text translations

Use `useTextTranslation` when translated plain text is needed as a string rather than rendered as a component. Its `source` is the authored source-language text. An explicitly supplied `group` is absolute by default; set `extendGroup` to append it to the contextual group instead. The same `group` and `extendGroup` options are available on `Translation`.

```tsx
const description = useTextTranslation({
	group: 'constants',
	extendGroup: true,
	id: 'speedOfLight',
	source: 'The speed of light',
})

<Translation group="header" extendGroup id="description">Description</Translation>
```

### React components inside Messages

Ordinary custom components and native elements such as `strong` use the default behavior automatically: their kebab-case component name becomes the tag and their children are translated. Wrap components whose behavior differs from these defaults.

```tsx
import { withTranslation } from '@step-wise/i18n'

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

const TranslatedMultipleChoice = withTranslation(MultipleChoice, {
	tag: 'multiple-choice',
	translatedProps: [{ name: 'choices', itemName: 'choice' }],
})
```

`translatedProps` defaults to `['children']`. Each listed prop becomes a named message slot; unlisted props remain in the original React element and do not enter translation catalogs. For an array-valued prop, use `{ name, itemName }` to give each item its own stable slot, named from `itemName` and its one-based position. This preserves item boundaries without adding React wrappers to authored content. Anonymous components must be wrapped with an explicit tag because no stable default can be derived for them. Copying and deletion are allowed by default and can be disabled independently for required or identity-sensitive components.

### Translation areas

`TranslationArea` reserves one semantic name while allowing its contents to use either one complete Message or several named Messages. This is useful for containers such as exercise problems and solutions. An anonymous `Translation` uses the area's name as its unit ID; named translations use the area as a group.

```tsx
<TranslationArea name="problem">
	<Translation>Translate this problem as one complete Message.</Translation>
</TranslationArea>

<TranslationArea name="problem">
	<Translation id="instruction">Calculate the result.</Translation>
	<Translation id="label">Your answer</Translation>
</TranslationArea>
```

Mixing anonymous and named translations, providing multiple anonymous translations, or repeating a named ID within one area is invalid.


## Setting up an application

Wrap the application in `I18nProvider` and provide its active locale and source locale:

```tsx
import { type CatalogLoader, I18nProvider } from '@step-wise/i18n'
import { parseXliff } from '@step-wise/i18n/xliff'

const loadCatalog: CatalogLoader = async (locale, path) => {
	const response = await fetch(`/locales/${locale}/${path}.xlf`)
	if (!response.ok) throw new Error(`Could not load Catalog: ${locale}/${path}`)
	return parseXliff(await response.text())
}

export function App({ children }: { children: React.ReactNode }) {
	return <I18nProvider
		locale={locale}
		sourceLocale="en"
		loadCatalog={loadCatalog}
		registerSource={developmentSourceRegistrar}
	>
		{children}
	</I18nProvider>
}
```

`loadCatalog` is asynchronous: it receives a locale and Catalog path and returns a `Promise<Catalog>`. The provider caches loaded Catalogs and deduplicates concurrent requests. `Translation` loads its addressed Catalog when needed and renders a current target Message for the active locale. Otherwise, it renders the authored source Message. The source is therefore also the fallback while a Catalog loads, when the source locale is active, or when no usable target exists.

The application owns the relationship between Catalog paths and files or bundles. It may use static imports, dynamic imports, HTTP requests, or bundler features such as Vite's `import.meta.glob`. The package itself does not depend on a bundler or filesystem layout.


### Registering authored sources

Whenever a `Translation` renders, it supplies its address and authored source Message to the optional `registerSource` callback. A development application can use this to update source Catalogs immediately as pages and exercises are rendered.

Source registration is application-owned because browser code cannot write files directly. A development server or bundler plugin may persist registrations; production applications should normally omit `registerSource`.


## Message conversion

`reactToMessage` converts authored React content into the format-independent `Message` model:

```tsx
import { reactToMessage } from '@step-wise/i18n'

const message = reactToMessage(
	<>Welcome {{ name }}. <TranslatedInput label="Your answer" /></>,
)
```

`messageToReact` applies a source or translated Message to its original React content. It restores variables, applies translated component slots, reconstructs translated array props, correlates component occurrences by ID, and enforces component copying and deletion restrictions.

The Message model is a typed discriminated union of text, variable, component, plural, select, and condition nodes. It deliberately contains no React elements, which keeps catalog validation and XLIFF handling independent of React.


## Catalogs and XLIFF

The main entry point exports the Catalog and Message types and their validation utilities. The XLIFF parser and serializer use a separate entry point so code that does not process XML need not load the XML parser:

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

`validateCatalog` returns semantic issues; `assertValidCatalog` throws when a Catalog is invalid. Serialization validates and normalizes its input. Parsing rejects malformed XML and documents outside the supported profile with `InvalidXliffError`.

See [XLIFF.md](./XLIFF.md) for the exact mapping of Catalogs, Messages, components, slots, variables, and grammatical constructs to XLIFF 2.1.


## Synchronization and review

The logic-only `@step-wise/i18n/catalog` entry point exports `synchronizeCatalog`. It copies the current source hierarchy and Messages into a target Catalog while retaining existing translations and obsolete target entries.

Each approved target stores fingerprints for the source Message against which it was reviewed. This produces four normal translation states:

- `current`: the target was reviewed against this exact source;
- `needs-review`: source text changed without changing its structure;
- `stale`: the source Message structure changed;
- `missing`: the unit has no target Message.

`validateCatalogSynchronization` checks that source units exist in the target Catalog, source snapshots are synchronized, targets are current, and translated Messages remain semantically compatible. Compatibility permits language-dependent text order and plural categories while preserving variables, component identities, slots, and grammatical constructs.

Node tooling can import locale validation without loading React through `@step-wise/i18n/locale`.

Applications can build their own translation workflow from the logic-only Catalog API:

```ts
import { type Catalog, reviewCatalogUnit, synchronizeCatalog, validateCatalogSynchronization } from '@step-wise/i18n/catalog'

export function synchronizeTarget(source: Catalog, locale: string, target?: Catalog) {
	return synchronizeCatalog(source, locale, target)
}

export function finishReview(source: Catalog, translatedTarget: Catalog) {
	const reviewedTarget = reviewCatalogUnit(translatedTarget, ['home'], 'welcome')
	const issues = validateCatalogSynchronization(source, reviewedTarget)
	return { reviewedTarget, issues }
}
```

Calling `synchronizeCatalog` without an existing target initializes a Catalog for the requested locale. An application can expose these operations through command-line scripts, a translation service, or another workflow of its choice. Reading and writing Catalog files remains application-owned because supported locales and filesystem layout are not package concerns.


## Package boundaries

This package owns:

- the Message model and React conversion;
- translation authoring constructs;
- locale-sensitive React formatting;
- Catalog types, traversal, validation, synchronization, and review;
- lazy Catalog coordination;
- the XLIFF profile, parser, and serializer.

Applications own:

- their source and supported target locales;
- locale selection and persistence;
- Catalog paths and loading strategy;
- development-time source persistence;
- translation automation and deployment policy.
