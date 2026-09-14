# @step-wise/skill-tree

`@step-wise/skill-tree` provides the concrete skill tree used by Step-Wise education. It combines the mathematics, mechanics, physics and demonstration definitions into one validated tree and provides convenient search functions that already operate on that tree. Use `@step-wise/skill-definition` instead when defining and processing a different skill tree.


## Installation

```bash
npm install @step-wise/skill-tree
```


## Quick start

```ts
import { moduleTree, getSkill, isSkillPrerequisiteOf } from '@step-wise/skill-tree'

const skill = getSkill('solveLinearEquation')

skill.name // 'Solve linear equation'
moduleTree.solveLinearEquation // The same processed skill
isSkillPrerequisiteOf('rewritePower', 'expandDoubleBrackets') // true
```

The tree is created and validated when the package is first imported. Invalid definitions, unknown references, prerequisite cycles and inconsistent links therefore prevent an invalid tree from being exported.


## The skill tree

### `moduleTree`

The processed Step-Wise `SkillTree`, keyed by skill ID. Each skill contains its name, group path, setup, direct prerequisites, direct continuations, links and optional threshold overrides.

```ts
import { moduleTree } from '@step-wise/skill-tree'

const skill = moduleTree.expandDoubleBrackets

skill.id // 'expandDoubleBrackets'
skill.path // ['mathematics', 'algebra', 'expressions', 'brackets']
skill.prerequisiteIds // Direct prerequisites
skill.continuationIds // Skills that directly depend on this skill
```

Skill IDs are stable application identifiers and should be stored or transmitted instead of display names.

### `getModule(moduleId, options?)`

Returns the requested concept or skill and throws when the ID is unknown. Matching is case-sensitive by default.

### `getSkill(skillId, options?)`

Returns the requested skill and throws when the ID is unknown. Matching is case-sensitive by default.

```ts
getSkill('demo')
getSkill('DEMO', { allowCaseInsensitiveMatch: true })
```


## Validating module IDs

### `ensureModuleId(moduleId, options?)`

Checks that one concept or skill ID exists and returns its canonical form.

### `ensureModuleIds(moduleIds, options?)`

Checks a readonly array of module IDs and preserves their supplied order.

### `ensureSkillId(skillId, options?)`

Checks that one skill ID exists and returns its canonical form. Matching is case-sensitive unless `allowCaseInsensitiveMatch` is enabled.

```ts
ensureSkillId('solveLinearEquation') // 'solveLinearEquation'
ensureSkillId('SOLVELINEAREQUATION', { allowCaseInsensitiveMatch: true }) // 'solveLinearEquation'
```

### `ensureSkillIds(skillIds, options?)`

Checks a readonly array of IDs and returns a new array containing their canonical forms in the supplied order.

```ts
ensureSkillIds(['demo', 'solveLinearEquation'])
```


## Searching relationships

The package provides module-aware relationship helpers as well as skill-specific helpers. Use `expandModuleIdsWithDirectPrerequisites`, `isModulePrerequisiteOf`, `getModuleIdsBetweenGoalsAndPriorKnowledge` and `sortModuleIdsByTreeOrder` when concepts must remain in the result. The corresponding skill functions validate skill endpoints and omit concepts from returned collections.

### `expandSkillIdsWithDirectPrerequisites(skillIds)`

Returns the requested skills together with their direct prerequisites. Results are deduplicated in first-occurrence order; prerequisites are not expanded recursively.

```ts
expandSkillIdsWithDirectPrerequisites(['summationAndMultiplication'])
// ['summationAndMultiplication', 'multiplication', 'summation']
```

### `expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds)`

Returns the requested skills together with their direct prerequisites and directly linked skills. Results are deduplicated in first-occurrence order, and neither relationship is traversed recursively.

```ts
expandSkillIdsWithDirectPrerequisitesAndLinks(['substituteAnExpression'])
// ['substituteAnExpression', 'substituteANumber']
```

### `isSkillPrerequisiteOf(prerequisiteId, skillId)`

Checks whether the first skill is a direct or transitive prerequisite of the second. A skill is considered a prerequisite of itself for reachability calculations. Unknown IDs throw.

```ts
isSkillPrerequisiteOf('rewritePower', 'expandDoubleBrackets') // true
isSkillPrerequisiteOf('expandDoubleBrackets', 'rewritePower') // false
```


## TypeScript

The package includes TypeScript declarations and re-exports the `ModuleId`, `ModuleTree`, `SkillId`, `SkillTree` and `EnsureModuleIdOptions` types from `@step-wise/skill-definition`.
