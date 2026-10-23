# Step-Wise XLIFF profile

The package uses XLIFF 2.1 as its persistent catalog format. This document defines the subset and application-owned extensions used to map the semantic message AST to XLIFF. The AST remains the authoritative in-memory representation; XLIFF is the interchange format.


## Catalogs

English catalogs are source-only XLIFF documents with `srcLang="en"`. Target catalogs additionally set `trgLang` and contain `<target>` elements. Each catalog path maps to one XLIFF document, nested message groups map to `<group>` elements, and a translation entry maps to a `<unit>` containing one `<segment>`.

The runtime representation is a nested `Catalog`. Its ordered entries are groups or translation units, and groups recursively contain their own ordered entries. This mirrors the XLIFF hierarchy, preserves mixed group/unit ordering and permits empty groups. Use `serializeXliff` and `parseXliff` from `@step-wise/i18n/xliff` to convert between that representation and XML.

Application extensions use the namespace `https://step-wise.com/ns/i18n` and the conventional prefix `swi18n`. The URI identifies the vocabulary; it does not imply that processing requires network access.


## Inline content

XLIFF inline IDs are generated deterministically in source traversal order and are scoped to their unit. They correlate source and target occurrences but are excluded from semantic source fingerprints.

- `<ph>` represents an atomic component or variable.
- `<pc>` represents a component or construct containing translatable content.
- `type` contains the closest XLIFF top-level classification.
- `subType` identifies the semantic component or construct.
- `copyOf` identifies a target-only copy of a shared source component.

Component behavior such as whether it may be copied or deleted is defined by its React registration. It is deliberately not duplicated through XLIFF editing-hint attributes.


## Named component slots

A component with one translatable property stores that property directly in its `<pc>` contents. The component registration identifies the property. A component with multiple translatable properties uses nested slot codes:

```xml
<pc id="c1" type="ui" subType="swi18n:paragraph" swi18n:slot="children">Some contents</pc>
```

For multiple properties, the slots are explicit:

```xml
<pc id="c1" type="ui" subType="swi18n:container">
	<pc id="c2" type="other" subType="swi18n:slot" swi18n:name="header">Some title</pc>
	<pc id="c3" type="other" subType="swi18n:slot" swi18n:name="children">Some contents</pc>
</pc>
```

Properties not declared translatable never enter the catalog and are retained from the original React element.


## Plurals

A plural remains inside its surrounding translation unit. It is represented by a paired code containing paired branch codes:

```xml
<pc id="c1" type="other" subType="swi18n:plural" swi18n:variable="count">
	<pc id="c2" type="other" subType="swi18n:plural-one">One ball</pc>
	<pc id="c3" type="other" subType="swi18n:plural-other">
		<ph id="c4" type="ui" subType="xlf:var" swi18n:name="count"/> balls
	</pc>
</pc>
```

Targets may add branches required by their locale. Every plural requires `other`; additional categories are validated against `Intl.PluralRules` for the target locale. Exact-number branches are distinct from grammatical plural categories.

Selections use `swi18n:select` containers with `swi18n:select-branch` children. Each branch stores its value in `swi18n:value`, and every selection requires an `other` branch.

Boolean conditions use `swi18n:condition` containers with exactly one `swi18n:condition-true` and one `swi18n:condition-false` child. Either branch may be empty.


## Source compatibility

Every source unit has two deterministic fingerprints:

- The content fingerprint changes for any semantic source change.
- The structure fingerprint ignores ordinary translatable and preserved component contents but includes variables, constructs, and component and slot structure.

An approved target records the source fingerprints it was reviewed against. Comparison produces these states:

- `current`: both fingerprints match.
- `needs-review`: structure matches but content differs.
- `stale`: structure differs.
- `missing`: no target exists.
- `invalid`: the target cannot be parsed or violates semantic/component rules.

Only current targets render in normal production operation. All other states fall back to the English React source.

The fingerprints are stored on `<target>` as `swi18n:sourceContentFingerprint` and `swi18n:sourceStructureFingerprint`. They describe the English source against which that target was reviewed, not necessarily the latest source currently stored beside it.


## Catalog reconciliation

Development discovery and explicit extraction add or update English entries, but absence is never evidence of removal. Synchronization adds target entries and refreshes their source snapshots without deleting obsolete entries automatically. Cleanup of obsolete units is an explicit manual operation.
