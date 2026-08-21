# @step-wise/skill-definition

`@step-wise/skill-definition` provides the data structures and utilities needed to define, validate and search a skill tree. It does not contain a concrete tree and does not manage learner state; applications create their own tree and pass it to this package or to consumers such as `@step-wise/course-definition` and `@step-wise/skill-tracking`.


## Installation

```bash
npm install @step-wise/skill-definition @step-wise/skill-setup
```

`@step-wise/skill-setup` is only needed when skill definitions use setups. Install downstream packages separately when course analysis or skill tracking is required.


## Quick start

Creating a skill tree has two stages: write a nested raw definition, then pass it to `createSkillTree` to obtain the validated and fully connected `SkillTree` used at runtime.

```ts
import { and } from '@step-wise/skill-setup'
import { createSkillTree } from '@step-wise/skill-definition'

const rawSkillTree = {
	mathematics: {
		arithmetic: {
			addNumbers: {
				name: 'Add numbers',
			},
			multiplyNumbers: {
				name: 'Multiply numbers',
				prerequisites: ['addNumbers'],
			},
		},
		algebra: {
			solveLinearEquation: {
				name: 'Solve a linear equation',
				setup: and('addNumbers', 'multiplyNumbers'),
				links: { skillId: 'rearrangeFormula', correlation: 0.6 },
			},
			rearrangeFormula: {
				name: 'Rearrange a formula',
			},
		},
	},
}

const skillTree = createSkillTree(rawSkillTree)
```

The result is a flat, ID-keyed record. Prerequisite references are validated, setup skills are added to the prerequisites, continuation IDs are derived, and links are made symmetric.

```ts
skillTree.multiplyNumbers.prerequisiteIds // ['addNumbers']
skillTree.addNumbers.continuationIds // ['multiplyNumbers', 'solveLinearEquation']
skillTree.solveLinearEquation.linkedSkillIds // ['rearrangeFormula']
skillTree.rearrangeFormula.linkedSkillIds // ['solveLinearEquation']
```


## Defining a raw skill tree

A `RawSkillTree` is a nested record. Every property is either another group or a `RawSkillDefinition`. Groups may be nested to any depth, while every skill ID must be unique throughout the complete tree regardless of casing.

```ts
import type { RawSkillTree } from '@step-wise/skill-definition'

const rawSkillTree: RawSkillTree = {
	subject: {
		category: {
			firstSkill: { name: 'First skill' },
			secondSkill: { name: 'Second skill' },
		},
	},
}
```

### Raw skill properties

| Property | Required | Behavior |
| --- | --- | --- |
| `name` | Yes | Non-empty display name for the skill. |
| `setup` | No | A setup from `@step-wise/skill-setup`. Every referenced skill is also added as a prerequisite. |
| `prerequisites` | No | Direct prerequisite skill IDs. Defaults to an empty list. |
| `links` | No | One link or a list of link definitions. Defaults to no links. |
| `thresholds` | No | Legacy per-skill mastery overrides, currently supporting `pass`. |

Explicit and setup-derived prerequisites are combined and deduplicated in first-occurrence order.


## Links

Links describe symmetric relationships between skills. Declaring a relationship at one participant is sufficient; `createSkillTree` adds the corresponding processed link to every participant.

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

Self-links, repeated participants, unknown IDs, duplicate reciprocal declarations and conflicting correlations are rejected. Processed participants, structured links and `linkedSkillIds` are ordered canonically according to skill-tree order.


## Creating the processed tree

### `createSkillTree(rawSkillTree)`

Returns a validated `SkillTree` whose keys are the original skill IDs. The tree uses a null prototype so IDs such as `constructor`, `toString` and `__proto__` are safe.

Each processed `Skill` contains:

| Property | Behavior |
| --- | --- |
| `id` | Canonical skill ID taken from the raw-tree key. |
| `name` | Display name from the raw definition. |
| `path` | Group path from the root to the containing group. |
| `groupSkillIds` | All skills directly contained in the same group, including the skill itself. |
| `setup` | Original optional setup. |
| `prerequisiteIds` | Deduplicated explicit and setup-derived direct prerequisites. |
| `continuationIds` | Skills that directly name this skill as a prerequisite. |
| `links` | Canonical `SkillLink` relationships, each containing `skillIds` and an optional `correlation`. |
| `linkedSkillIds` | Deduplicated IDs occurring across the skill's links. |
| `thresholds` | Original optional threshold overrides. |

Creation rejects malformed entries, empty IDs or names, exact and case-insensitive ID collisions, unknown references, prerequisite cycles and inconsistent links. The error identifies the relevant skill or relationship where possible.


## Searching a skill tree

All search and validation functions receive a processed `SkillTree` as their first argument.

### `ensureSkillId(skillTree, skillId)`

Returns the canonical known ID using case-insensitive matching. Unknown IDs throw.

```ts
ensureSkillId(skillTree, 'ADDNUMBERS') // 'addNumbers'
```

### `ensureSkillIds(skillTree, skillIds)`

Accepts a readonly array and returns a new array containing the canonical IDs in the supplied order. Use `ensureSkillId` for a single ID.

### `ensureSkillSetup(skillTree, setup)`

Normalizes a setup through `@step-wise/skill-setup`, verifies that every referenced skill exists and returns the resulting setup.

### `isSkillPrerequisiteFor(skillTree, prerequisiteId, skillId)`

Checks whether the first skill is a direct or transitive prerequisite of the second. A skill is considered a prerequisite of itself for reachability calculations.

### `getSkillIdsWithDirectPrerequisites(skillTree, skillIds)`

Returns the requested canonical IDs and their direct prerequisites. It does not recurse.

### `getSkillIdsWithDirectPrerequisitesAndLinks(skillTree, skillIds)`

Returns the requested canonical IDs, their direct prerequisites and their directly linked skills. It does not recurse through either relationship.

### `getSkillIdsBetweenGoalsAndPriorKnowledge(skillTree, goals, priorKnowledge)`

Returns the goals and their recursive prerequisites while excluding prior-knowledge skills and everything reached only by traversing beyond those boundaries.

```ts
getSkillIdsBetweenGoalsAndPriorKnowledge(skillTree, ['solveLinearEquation'], ['addNumbers'])
// ['solveLinearEquation', 'multiplyNumbers']
```

### `sortSkillIdsByTreeOrder(skillTree, skillIds)`

Validates and canonicalizes the supplied IDs, then returns a new array sorted by their order in the processed skill tree. Duplicate IDs are preserved.


## Using the tree with other packages

The processed tree is intentionally independent of any particular course or learner. Pass the same `SkillTree` into packages that add those concerns.

```ts
import { Course } from '@step-wise/course-definition'
import { SkillLevelSet } from '@step-wise/skill-tracking'

const course = new Course(skillTree, {
	startingPoints: ['addNumbers'],
	learningGoals: ['solveLinearEquation'],
})

const skillLevels = new SkillLevelSet(skillTree)
```

`@step-wise/course-definition` derives course contents and prior knowledge from its goals and starting points. `@step-wise/skill-tracking` combines the definition with learner-specific skill-level data. A project may also use the search helpers in this package directly without installing either consumer.


## TypeScript

The package includes TypeScript declarations. Its principal exported types are `SkillId`, `RawSkillDefinition`, `RawSkillTree`, `RawSkillLink`, `Skill`, `SkillTree`, `SkillLink` and `SkillThresholds`.
