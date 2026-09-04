# @step-wise/course-analysis

`@step-wise/course-analysis` combines a course definition with learner skill-tracking data. It determines which skills need practice, summarizes progress through the course, recommends what to practise next, and provides contextual advice for the learner's current skill.

The package contains domain logic only. It does not depend on a particular skill tree, exercise registry, database, frontend framework, or rendering system.


## Installation

```bash
npm install @step-wise/course-analysis
```

The analysis operates on a `Course` from `@step-wise/course-definition` and a `SkillLevelSet` from `@step-wise/skill-tracking`.


## Quick start

```ts
import { analyzeCourseProgress, freePracticeRecommendation } from '@step-wise/course-analysis'

const analysis = analyzeCourseProgress(course, skillLevelSet)

if (analysis) {
	analysis.practiceNeeds
	analysis.numCompleted
	analysis.numCompletedPerBlock

	if (analysis.recommendation === freePracticeRecommendation) {
		// The learner can use mixed free practice.
	} else {
		// Open the recommended skill.
		openSkill(analysis.recommendation)
	}
}
```

The result is `undefined` until the `SkillLevelSet` contains all data required for the course. This makes incomplete loading state explicit rather than producing a partial course analysis.


## Practice needs

A `PracticeNeed` is an ordered numerical severity.

| Value | Meaning |
| --- | --- |
| `0` | No practice is needed. The skill is sufficiently mastered or a later mastered skill demonstrates that it can be treated as mastered. |
| `1` | Practice is recommended: the skill was once mastered but is now in the grey zone again. |
| `2` | Practice is required before the learner should move onward: there is no mastery. |

The numerical order is intentional. Course analysis can propagate a maximum severity backwards through prerequisites and combine paths by choosing the lowest applicable severity.

### An individual skill

Use `getPracticeNeed` to inspect one skill.

```ts
const practiceNeed = getPracticeNeed('solveLinearEquation', skillLevelSet, {
	skillThresholds: skill.thresholds,
	priorKnowledge: false,
})
```

The function compares the learner's expected success rate with the supplied mastery and recap thresholds. For course-content skills between those thresholds, the learner's highest historical success rate distinguishes recommended practice (`1`) from required practice (`2`). Prior-knowledge skills use their dedicated thresholds.

It returns `undefined` when the skill level set lacks data required for the skill or its dependencies.

### A complete course

Use `getCoursePracticeNeeds` to derive a `PracticeNeeds` map for a course.

```ts
const practiceNeeds = getCoursePracticeNeeds(course, skillLevelSet)
```

The analysis starts at every learning goal and follows prerequisites back to the course's prior-knowledge boundary. If a later skill is mastered, its prerequisites do not receive a greater practice need: successfully using the later skill provides evidence that those prerequisites are currently sufficient. Shared prerequisites are combined across all learning-goal paths.

`PracticeNeeds` is a partial skill-ID map because it only contains skills reached by this course analysis. The function returns `undefined` if required learner data is incomplete.


## Course progress

`analyzeCourseProgress` produces the main `CourseProgressAnalysis`.

```ts
const analysis = analyzeCourseProgress(course, skillLevelSet, hasExercises)
```

Its result contains:

| Property | Meaning |
| --- | --- |
| `practiceNeeds` | Practice need for each analyzed course skill. |
| `recommendation` | The best skill to practise next, or `freePracticeRecommendation`. |
| `numCompleted` | Number of course-content skills with practice need `0`. |
| `numCompletedPerBlock` | Completed content skills in each resolved course block. |

Recommendations use this priority:

1. Prior-knowledge skills requiring practice.
2. Course-content skills requiring practice.
3. Course-content skills for which practice is recommended.
4. Free practice when none of the above applies.

### Exercise availability

Applications may pass a `HasExercises` predicate when some skills cannot currently be practised.

```ts
const analysis = analyzeCourseProgress(
	course,
	skillLevelSet,
	skillId => exerciseRegistry.has(skillId),
)
```

Unavailable skills are skipped when selecting recommendations. Their practice needs and their contribution to progress counts are unchanged. When the predicate is omitted, `allSkillsHaveExercises` treats every skill as available.


## Contextual skill advice

`getSkillPracticeAdvice` turns course progress into an action relative to the skill the learner is currently viewing.

```ts
const advice = getSkillPracticeAdvice(
	course,
	analysis,
	currentSkillId,
	hasExercises,
)
```

The result is `undefined` when the course analysis is unavailable. Otherwise it always contains a `type` and `recommendation`.

| Advice type | Meaning |
| --- | --- |
| `stay` | The current activity is an appropriate place to practise. |
| `moveOnward` | The current skill is mastered; continue to a related later skill or free practice. |
| `goBack` | A prerequisite requires practice before continuing. |
| `notInCourse` | The supplied skill is outside the analyzed course; use the course-wide recommendation. |

The recommendation is either a skill ID or `freePracticeRecommendation`.

Omitting `currentSkillId` means that the learner is already in free-practice mode. Recommended practice with severity `1` does not interrupt that mode, while a skill with severity `2` produces `goBack` advice. When a mastered skill is supplied, the function searches its continuation paths for related work. When prerequisites are deficient, it searches backwards for the earliest suitable skill with exercises.


## Architectural boundary

This package connects two otherwise independent domains:

- `@step-wise/course-definition` describes which skills make up a course.
- `@step-wise/skill-tracking` describes the learner's proficiency in those skills.

Exercise availability is supplied as a function so course analysis does not depend on an exercise package. Persistence and API-specific student records should likewise be converted into a `SkillLevelSet` before calling this package. Rendering code can then decide how to present the returned progress and advice.


## TypeScript

The package includes TypeScript declarations. Its principal exported types are:

- `PracticeNeed`, `PracticeNeeds`, and `PracticeNeedOptions`;
- `CourseProgressAnalysis`;
- `PracticeRecommendation` and `HasExercises`;
- `SkillPracticeAdvice` and `SkillPracticeAdviceType`.

It also exports `freePracticeRecommendation` as the sentinel for mixed course practice and `allSkillsHaveExercises` as the default availability predicate.
