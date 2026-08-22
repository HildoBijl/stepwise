# @step-wise/course-definition

`@step-wise/course-definition` resolves and validates courses against a skill tree. A course definition provides starting points and learning goals and may additionally provide learning-goal weights, block goals and a setup. The package derives the course contents and prior knowledge, resolves the supplied block goals into block contents, and reports diagnostics without depending on one particular set of skills.


## Installation

```bash
npm install @step-wise/course-definition @step-wise/skill-definition
```


## Quick start

Create a `Course` by passing it a processed `SkillTree` and a `CourseDefinition`.

```ts
import { Course, validateCourseDiagnostics } from '@step-wise/course-definition'
import { createSkillTree } from '@step-wise/skill-definition'

const skillTree = createSkillTree({
	arithmeticBasics: {
		name: 'Understand arithmetic basics',
	},
	addNumbers: {
		name: 'Add numbers',
		prerequisites: ['arithmeticBasics'],
	},
	multiplyNumbers: {
		name: 'Multiply numbers',
		prerequisites: ['arithmeticBasics'],
	},
	solveMixedCalculations: {
		name: 'Solve mixed calculations',
		prerequisites: ['addNumbers', 'multiplyNumbers'],
	},
})

const course = new Course(skillTree, {
	startingPointIds: ['arithmeticBasics'],
	learningGoalIds: ['solveMixedCalculations'],
})

validateCourseDiagnostics(course.diagnostics)

course.contentSkillIds // Skills taught in the course
course.priorKnowledgeIds // Prerequisites assumed before the course
course.allSkillIds // Prior knowledge followed by course contents
```

Constructing a course validates and normalizes the supplied data. Accessing its analysis resolves the definition against the skill tree. Semantic issues such as unknown skills or missing starting points are recorded as diagnostics; call `validateCourseDiagnostics` when those issues should reject the course.


## Defining a course

A `CourseDefinition` supports the following properties.

| Property | Required | Behavior |
| --- | --- | --- |
| `startingPointIds` | Yes | Skills at which teaching starts. Their earlier prerequisites become prior knowledge. |
| `learningGoalIds` | Yes | Skills learners should reach by completing the course. |
| `learningGoalWeights` | No | Non-negative weights corresponding to the learning goals. Defaults to one per goal. |
| `blockLearningGoalIds` | No | Learning goals assigned to consecutive course blocks. |
| `setup` | No | The target end-level setup, such as the skill combination required by a typical final assessment. |

Starting-point and learning-goal arrays must not contain duplicate IDs. Empty courses are allowed so a definition can be created before its contents are filled in.

### Starting points

A starting point is included in the course contents. Its prerequisites are considered prior knowledge unless another starting point causes those prerequisites to be taught within the course.

```ts
const course = new Course(skillTree, {
	startingPointIds: ['addNumbers', 'multiplyNumbers'],
	learningGoalIds: ['solveMixedCalculations'],
})
```

The analysis removes starting points that are already reached from another starting point, reports starting points unrelated to the learning goals, and suggests missing starting points where the selected paths do not cover every required branch.

### Learning-goal weights

Learning-goal weights are optional course-definition data; they are not derived from the learning goals. When weights are supplied, their number must equal the number of learning goals. Every weight must be finite and non-negative, and their sum must be positive. Individual zero weights are allowed.

```ts
const course = new Course(skillTree, {
	startingPointIds: ['arithmeticBasics'],
	learningGoalIds: ['addNumbers', 'multiplyNumbers'],
	learningGoalWeights: [1, 2],
})
```

Weights can be used for an "Open Practice" mode where students get exercises randomly sampled from the course's learning goals. When weights are omitted, the resolved course exposes a default weight of one for every known learning goal.

### Blocks

Block goals are optional course-definition data. When supplied, they divide the course into consecutive sections, with each inner array explicitly listing the goals of one block.

```ts
const course = new Course(skillTree, {
	startingPointIds: ['arithmeticBasics'],
	learningGoalIds: ['solveMixedCalculations'],
	blockLearningGoalIds: [
		['addNumbers', 'multiplyNumbers'],
		['solveMixedCalculations'],
	],
})
```

The analysis preserves the supplied block goals and derives the `contentSkillIds` introduced in each block. Skills assigned to earlier blocks are not repeated. When blocks are provided, they must collectively cover every course learning goal.

### Setup

The optional setup describes the target level at the end of the course, such as the skill combination required by a typical final-exam question. It accepts the same setup values as `@step-wise/skill-setup`, including a single skill ID or a constructed setup.

```ts
import { and } from '@step-wise/skill-setup'

const course = new Course(skillTree, {
	startingPointIds: ['addNumbers', 'multiplyNumbers'],
	learningGoalIds: ['solveMixedCalculations'],
	setup: and('addNumbers', 'multiplyNumbers', 'solveMixedCalculations'),
})
```

Every setup skill must exist in the skill tree and occur in the resolved course contents. The resolved setup can be combined with learner data from `@step-wise/skill-tracking`, for example to predict a learner's performance on the final assessment represented by the setup.


## Course resolution

The `resolution` property contains the complete `CourseResolution`. The same values are available directly through the `Course` instance.

| Property | Behavior |
| --- | --- |
| `priorKnowledgeIds` | Direct prerequisites assumed before the course. |
| `startingPointIds` | Required starting points after redundant and missing points are resolved. |
| `contentSkillIds` | Skills taught in the course, ordered by blocks when valid blocks are provided and otherwise by skill-tree order. |
| `allSkillIds` | Prior-knowledge IDs followed by content skill IDs. |
| `learningGoalIds` | Known learning goals in their supplied order. |
| `learningGoalWeights` | Weights corresponding to the resolved learning goals. |
| `blocks` | Resolved blocks when block goals were supplied. |
| `setup` | The normalized optional setup. |

```ts
course.resolution
course.contentSkillIds
course.learningGoalWeights
course.blocks
```


## Course diagnostics

The `diagnostics` property explains problems found while resolving the definition. It distinguishes unknown, external, redundant and missing endpoints; reports invalid block assignments and uncovered goals; and identifies unknown or external setup skills.

```ts
const { diagnostics } = course

diagnostics.unknownStartingPointIds
diagnostics.missingStartingPointIds
diagnostics.redundantLearningGoalIds
diagnostics.blockDiagnostics
diagnostics.unknownSetupSkillIds
```

Diagnostics remain available even for an invalid course, which allows an editor to show several problems without discarding the analysis. Use `validateCourseDiagnostics` to throw on the first issue.

```ts
validateCourseDiagnostics(course.diagnostics)
```


## Convenience methods

The `Course` class provides membership helpers for the roles a skill can have.

```ts
course.hasAsContents('addNumbers')
course.hasAsPriorKnowledge('arithmeticBasics')
course.hasAsStartingPoint('addNumbers')
course.hasAsLearningGoal('solveMixedCalculations')
```

`getLearningGoalWeight(skillId)` returns the configured or default weight for a learning goal and returns zero when the skill is not a learning goal.


## TypeScript

The package includes TypeScript declarations. Its principal exported types are `CourseDefinition`, `CourseResolution`, `CourseResolutionBlock`, `CourseDiagnostics`, `CourseBlockDiagnostics` and `CourseAnalysis`.
