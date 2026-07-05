# Step-Wise skill tracking

Step-Wise uses a large skill tree. For each student, and for each skill in the tree, Step-Wise tracks the mastery level. This package contains the tooling for that. For the mathematics behind skill tracking, see the [paper on Skill Tracking](https://arxiv.org/abs/2501.10050).


## Prerequisites

Before using this package, make sure to [define a Skill Tree](../skill-definition/). Once that is done, then this package can track the skill level of every skill in it. Skill levels are described through [Bernstein coefficients](../bernstein-polynomials/). Every skill has a set of coefficients describing the student's level, which is constantly updated based on new observations.


## Setting up

The main class in this package is the `SkillLevelSet`. It requires a (processed) skill tree and a set of `RawSkillLevelData`. We may for instance have

```
rawSkillLevelData = {
	someSkillId: {
		coefficients: BernsteinCoefficients
		coefficientsOn: Date
		highest: BernsteinCoefficients
		highestOn: Date
		numPracticed: number
	}, 
	anotherSkillId: { ... },
	...
}
```

Given this data, we can set up a `SkillLevelSet` through

```
import { SkillLevelSet } from '@step-wise/skill-tracking'
const skillLevelSet = new SkillLevelSet(skillTree, rawSkillLevelData)
```

If new data is received, for instance from the API, then this can be added through

```
skillLevelSet.update(rawSkillLevelUpdateData)
```


## Extracting data

The coefficients in the raw data is only based on observations for each individual skill. However, skills are linked. Given these links, we can find *inferred coefficients* for each skill too. If we ask the `SkillLevelSet` for coefficients, it will give us these *inferred* coefficients. This is done through

```
const expectedValue = skillLevelSet.getExpectedValue('someSkillId')
const coefficients = skillLevelSet.getCoefficients('someSkillId')
```

We also track the highest (inferred) coefficients ever obtained. The API here is similar.

```
const highestExpectedValue = skillLevelSet.getHighestExpectedValue('someSkillId')
const highestCefficients = skillLevelSet.getHighestCoefficients('someSkillId')
```

It may happen that you have some exercise with a given skill set-up, and you want to find the distribution of the success rate for this exercise.

```
const setupExpectedValue = skillLevelSet.getSetupExpectedValue(setup)
const setupCoefficients = skillLevelSet.getSetupCoefficients(setup)
```


## Implementing observations

When the student does an exercise, we gather data. Such an observation always takes the form `{ setup: SkillSetup, correct: boolean }`. We can implement this observation into the `SkillLevelSet`, to update the skill levels. This is done through

```
const result = skillLevelSet.processObservation({ setup, correct })
```

The result is a `rawSkillLevelUpdateData` object containing only the data that was updated. This also includes "highest" data: that is only added when relevant. So an example object that is returned may be:

```
rawSkillLevelData = {
	someSkillId: {
		coefficients: [0, 1],
		coefficientsOn: now,
		highest: [0, 1],
		highestOn: now,
		numPracticed: 3,
	}, 
	anotherSkillId: {
		coefficients: [0.4, 0.6],
		coefficientsOn: now,
		numPracticed: 5
	},
	...
}
```

It is also possible to process multiple observations at the same time. This is done through

```
const result = skillLevelSet.processObservations([observation1, observation2, ...])
```

The result object is a merged collection of all updates. It can be used to update the database.
