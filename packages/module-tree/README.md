# @step-wise/module-tree

`@step-wise/module-tree` provides the concrete module tree used by Step-Wise education. It combines the mathematics, mechanics, physics and demonstration definitions into one validated tree and provides convenient search functions that already operate on that tree. Use `@step-wise/module-tree-definition` instead when defining and processing a different module tree.


## Installation

```bash
npm install @step-wise/module-tree
```


## Quick start

```ts
import { moduleTree, getSkill, isModulePrerequisiteOf } from '@step-wise/module-tree'

const skill = getSkill('solveLinearEquation')

skill.name // 'Solve linear equation'
moduleTree.solveLinearEquation // The same processed skill
isModulePrerequisiteOf('rewritePower', 'expandDoubleBrackets') // true
```

The tree is created and validated when the package is first imported. Invalid definitions, unknown references, prerequisite cycles and inconsistent links therefore prevent an invalid tree from being exported.


## The module tree

### `moduleTree`

The processed Step-Wise module tree, keyed by module ID. It currently consists entirely of skills, while its public API is ready to expose concepts as they are added.

```ts
import { moduleTree } from '@step-wise/module-tree'

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

The package provides module-aware relationship helpers. They include concepts by default; pass `{ includeConcepts: false }` when only skills should be returned and traversal should stop at concepts.

### `expandModuleIdsWithDirectPrerequisites(moduleIds, options?)`

Returns the requested skills together with their direct prerequisites. Results are deduplicated in first-occurrence order; prerequisites are not expanded recursively.

```ts
expandModuleIdsWithDirectPrerequisites(['summationAndMultiplication'], { includeConcepts: false })
// ['summationAndMultiplication', 'multiplication', 'summation']
```

### `expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds)`

Returns the requested skills together with their direct prerequisites and directly linked skills. Results are deduplicated in first-occurrence order, and neither relationship is traversed recursively.

```ts
expandSkillIdsWithDirectPrerequisitesAndLinks(['substituteAnExpression'])
// ['substituteAnExpression', 'substituteANumber']
```

### `isModulePrerequisiteOf(prerequisiteId, moduleId, options?)`

Checks whether the first module is a direct or transitive prerequisite of the second. A module is considered a prerequisite of itself. Unknown IDs throw.

```ts
isModulePrerequisiteOf('rewritePower', 'expandDoubleBrackets') // true
isModulePrerequisiteOf('expandDoubleBrackets', 'rewritePower') // false
```


## TypeScript

The package includes TypeScript declarations and re-exports the `ModuleId`, `ModuleTree`, `SkillId`, `EnsureModuleIdOptions` and `ModuleSearchOptions` types from `@step-wise/module-tree-definition`.
