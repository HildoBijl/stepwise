# @step-wise/module-tree-definition

`@step-wise/module-tree-definition` provides the data structures and utilities needed to define, validate and search a tree of educational modules. Modules are either concepts or skills. The package does not contain a concrete tree and does not manage learner state.


## Installation

```bash
npm install @step-wise/module-tree-definition @step-wise/skill-setup
```

`@step-wise/skill-setup` is only needed when skill definitions use setups.


## Quick start

Creating a module tree has two stages: write a nested definition, then pass it to `createModuleTree` to obtain the validated and fully connected `ModuleTree` used at runtime.

```ts
import { and } from '@step-wise/skill-setup'
import { createModuleTree } from '@step-wise/module-tree-definition'

const moduleTreeDefinition = {
	mathematics: {
		arithmetic: {
			addNumbers: {
				type: 'skill',
				name: 'Add numbers',
			},
			multiplyNumbers: {
				type: 'skill',
				name: 'Multiply numbers',
				prerequisites: ['addNumbers'],
			},
		},
		algebra: {
			solveLinearEquation: {
				type: 'skill',
				name: 'Solve a linear equation',
				setup: and('addNumbers', 'multiplyNumbers'),
				links: { skillId: 'rearrangeFormula', correlation: 0.6 },
			},
			rearrangeFormula: {
				type: 'skill',
				name: 'Rearrange a formula',
			},
		},
	},
}

const moduleTree = createModuleTree(moduleTreeDefinition)
```

The result is a flat, ID-keyed record. Prerequisite references are validated, setup skills are added to the prerequisites, continuation IDs are derived, and links are made symmetric.

```ts
moduleTree.multiplyNumbers.prerequisiteIds // ['addNumbers']
moduleTree.addNumbers.continuationIds // ['multiplyNumbers', 'solveLinearEquation']
moduleTree.solveLinearEquation.linkedSkillIds // ['rearrangeFormula']
moduleTree.rearrangeFormula.linkedSkillIds // ['solveLinearEquation']
```


## Defining a module tree

A `ModuleTreeDefinition` is a nested record. Every property is either another group, a `ConceptDefinition` or a `SkillDefinition`. Groups may be nested to any depth, while every module ID must be unique throughout the complete tree regardless of casing.

```ts
import type { ModuleTreeDefinition } from '@step-wise/module-tree-definition'

const moduleTreeDefinition: ModuleTreeDefinition = {
	subject: {
		category: {
			firstSkill: { type: 'skill', name: 'First skill' },
			secondSkill: { type: 'skill', name: 'Second skill' },
		},
	},
}
```

### Module properties

| Property | Required | Behavior |
| --- | --- | --- |
| `type` | Yes | Either `concept` or `skill`. |
| `name` | Yes | Non-empty display name for the module. |
| `prerequisites` | No | Direct prerequisite module IDs. Concepts cannot depend on skills. |
| `setup` | Skills only | A setup from `@step-wise/skill-setup`. Every referenced skill is also added as a prerequisite. |
| `links` | Skills only | One link or a list of link definitions. |
| `thresholds` | Skills only | Partial per-skill threshold options. |

Explicit and setup-derived prerequisites are combined and deduplicated in first-occurrence order.

### Threshold options

Every threshold is a success probability between zero and one. Raw definitions may provide any subset of the options:

```ts
const moduleTreeDefinition: ModuleTreeDefinition = {
	advancedSkill: {
		type: 'skill',
		name: 'Advanced skill',
		thresholds: {
			mastery: 0.6,
			recap: 0.5,
		},
	},
}
```

| Option | Behavior |
| --- | --- |
| `mastery` | The regular threshold at which the skill is considered mastered. Defaults to `0.55`. |
| `recap` | The regular threshold below which mastered material should be recapped. Defaults to 90% of `mastery`. |
| `priorKnowledgeMastery` | The mastery threshold when treating the skill as prior knowledge. Defaults to `mastery`. |
| `priorKnowledgeRecap` | The recap threshold when treating the skill as prior knowledge. Defaults to 80% of `priorKnowledgeMastery`. |

Recap thresholds cannot exceed their corresponding mastery thresholds. The processed skill always contains all four values in `thresholds`, regardless of how many were supplied in the raw definition. The exported `defaultSkillThresholdOptions` contains the fully resolved defaults, while `resolveSkillThresholdOptions` resolves and validates a standalone `SkillThresholdOptionsInput`.


## Links

Links describe symmetric relationships between skills. Declaring a relationship at one participant is sufficient; `createModuleTree` adds the corresponding processed link to every participant.

### Shorthand forms

```ts
links: 'otherSkill'
links: ['skillA', 'skillB']
```

A string creates a two-skill relationship. An array of strings creates one multi-skill relationship between the declaring skill and every listed skill; it does not create several independent links.

### Object forms

```ts
links: { skillId: 'otherSkill', correlation: 0.5 }
links: { skillIds: ['skillA', 'skillB'], correlation: 0.5 }
links: [{ skillId: 'skillA' }, { skillId: 'skillB' }]
```

Use `skillId` for one linked skill and `skillIds` for a multi-skill relationship. Supplying both is invalid. A correlation is optional and, when provided, must be a finite number strictly between zero and one.

Self-links, repeated participants, concept IDs, unknown IDs, duplicate reciprocal declarations and conflicting correlations are rejected. Processed participants, structured links and `linkedSkillIds` are ordered canonically according to module-tree order.


## Creating the processed tree

### `createModuleTree(moduleTreeDefinition)`

Returns a validated `ModuleTree` whose keys are the original module IDs. Indexing the tree produces a `Module`; use its `type` discriminator or `getSkill` when skill-specific properties are needed. The tree uses a null prototype so IDs such as `constructor`, `toString` and `__proto__` are safe.

Every processed `Module` contains:

| Property | Behavior |
| --- | --- |
| `id` | Canonical module ID taken from the definition key. |
| `type` | Either `concept` or `skill`. |
| `name` | Display name from the definition. |
| `groupPath` | Group path from the root to the containing group. |
| `groupModuleIds` | All modules directly contained in the same group, including the module itself. |
| `prerequisiteIds` | Direct prerequisite modules. |
| `continuationIds` | Modules that directly name this module as a prerequisite. |

Processed skills additionally contain:

| Property | Behavior |
| --- | --- |
| `setup` | Original optional setup. |
| `links` | Canonical `SkillLink` relationships, each containing `skillIds` and an optional `correlation`. |
| `linkedSkillIds` | Deduplicated IDs occurring across the skill's links. |
| `thresholds` | Fully resolved `SkillThresholdOptions`, including all four thresholds. |

Creation rejects malformed entries, empty IDs or names, exact and case-insensitive ID collisions, unknown references, prerequisite cycles, concepts depending on skills and inconsistent links.


## Searching a module tree

All search and validation functions receive a processed `ModuleTree` as their first argument. Module-aware functions accept concepts and skills. Their skill-specific counterparts validate that every supplied endpoint is a skill and omit concepts from returned collections.

### `ensureModuleId(moduleTree, moduleId, options?)`

Returns the canonical ID of a known concept or skill. Unknown IDs and casing differences throw by default. Set `allowCaseInsensitiveMatch` to `true` at boundaries where casing cannot be trusted.

### `ensureModuleIds(moduleTree, moduleIds, options?)`

Validates a readonly array of concept and skill IDs while preserving their supplied order.

### `getModule(moduleTree, moduleId, options?)`

Returns the corresponding `Module`. Use its `type` discriminator to distinguish concepts from skills.

### `ensureSkillId(moduleTree, skillId, options?)`

Returns the known skill ID when it matches exactly. It rejects unknown IDs and IDs belonging to concepts. Set `allowCaseInsensitiveMatch` to `true` at boundaries where casing cannot be trusted, such as IDs read from URLs; the canonical ID from the tree is then returned.

```ts
ensureSkillId(moduleTree, 'addNumbers') // 'addNumbers'
ensureSkillId(moduleTree, 'ADDNUMBERS', { allowCaseInsensitiveMatch: true }) // 'addNumbers'
```

### `ensureSkillIds(moduleTree, skillIds, options?)`

Accepts a readonly array and returns a new array containing the validated IDs in the supplied order. It supports the same `allowCaseInsensitiveMatch` option. Use `ensureSkillId` for a single ID.

### `getSkill(moduleTree, skillId, options?)`

Returns the corresponding `Skill`, rejecting IDs that identify concepts. This is the convenient way to access skill-specific properties from a mixed module tree.

### `ensureSkillSetup(moduleTree, setup)`

Normalizes a setup through `@step-wise/skill-setup`, verifies that every referenced skill exists and returns the resulting setup.

### `isModulePrerequisiteOf(moduleTree, prerequisiteId, moduleId, options?)`

Checks whether the first module is a direct or transitive prerequisite of the second. A module is considered a prerequisite of itself. Set `includeConcepts` to `false` to exclude concepts and stop traversal when one is encountered.

### `expandModuleIdsWithDirectPrerequisites(moduleTree, moduleIds, options?)`

Returns the requested modules and their direct prerequisites. It does not recurse. Set `includeConcepts` to `false` to omit concepts from the result.

### `expandSkillIdsWithDirectPrerequisitesAndLinks(moduleTree, skillIds)`

Accepts a readonly array and returns the requested canonical IDs, their direct prerequisites and their directly linked skills. It does not recurse through either relationship.

### `getModuleIdsBetweenGoalsAndPriorKnowledge(moduleTree, goals, priorKnowledge, options?)`

Returns the goals and their recursive prerequisites while excluding prior-knowledge modules and everything reached only by traversing beyond those boundaries. Set `includeConcepts` to `false` to omit concepts and stop traversing their prerequisites.

```ts
getModuleIdsBetweenGoalsAndPriorKnowledge(moduleTree, ['solveLinearEquation'], ['addNumbers'], { includeConcepts: false })
// ['solveLinearEquation', 'multiplyNumbers']
```

### `sortModuleIdsByTreeOrder(moduleTree, moduleIds, options?)`

Validates the supplied module IDs, then returns a new array sorted by their order in the processed module tree. Duplicate IDs are preserved. Set `includeConcepts` to `false` to omit concepts.


## TypeScript

The package includes TypeScript declarations. Its principal exported types include `ModuleId`, `ModuleType`, `ModuleDefinition`, `ConceptDefinition`, `SkillDefinition`, `ModuleTreeDefinition`, `Module`, `Concept`, `Skill`, `ModuleTree`, `EnsureModuleIdOptions`, `ModuleSearchOptions`, `SkillLinkDefinition` and `SkillLink`.
