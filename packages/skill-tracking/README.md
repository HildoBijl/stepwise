# @step-wise/skill-tracking

Track a learner's proficiency in a skill tree and update those estimates from correct or incorrect exercise results.

The package represents uncertainty using Bernstein distributions. It can infer a skill level from related skills, estimate success rates for complete skill setups, account for decay, and produce updates suitable for persistent storage.

The underlying model is described in the [paper on probabilistic skill tracking](https://arxiv.org/abs/2501.10050).


## Installation

```bash
npm install @step-wise/skill-tracking
```

A processed `SkillTree` from [`@step-wise/skill-definition`](../skill-definition/) is required. Exercise requirements are represented by setups from [`@step-wise/skill-setup`](../skill-setup/).


## Quick start

Create a `SkillLevelSet` from a skill tree and the learner's stored skill-level data. Use `getInitialSkillLevel` when a learner has no existing data for a skill.

```ts
import { createSkillTree } from '@step-wise/skill-definition'
import { and } from '@step-wise/skill-setup'
import { SkillLevelSet, getInitialSkillLevel } from '@step-wise/skill-tracking'

const skillTree = createSkillTree({
	addition: { name: 'Addition' },
	multiplication: {
		name: 'Multiplication',
		prerequisites: ['addition'],
	},
})

const startedOn = new Date()
const storedSkillLevels = {
	addition: getInitialSkillLevel(startedOn),
	multiplication: getInitialSkillLevel(startedOn),
}

const skillLevels = new SkillLevelSet(skillTree, storedSkillLevels)
const setup = and('addition', 'multiplication')

skillLevels.getExpectedSuccessRate('addition') // 0.5 for the initial uniform distribution
skillLevels.getSetupExpectedSuccessRate(setup) // The estimated probability of succeeding at the complete setup

const updates = skillLevels.applyObservation({
	setup,
	correct: true,
})
```

`applyObservation` updates the `SkillLevelSet` immediately and returns a `StoredSkillLevelUpdateSet`. Persist that returned update set so it can be loaded again in a later session.


## How skill levels work

A skill level is a probability distribution rather than a single mastery score. Its Bernstein coefficients describe the package's uncertainty about the learner's probability of success.

The initial coefficients `[1]` represent a uniform distribution: every success probability from zero to one is initially considered equally plausible. Consequently, its expected success rate is `0.5`.

Each stored skill level contains:

- `coefficients`: the distribution based on observations of this skill;
- `coefficientsOn`: when those coefficients were calculated;
- `highest`: the highest retained distribution reached so far;
- `highestOn`: when that highest level was reached;
- `numPracticed`: how many observations have contributed to the skill.

The stored coefficients deliberately concern the skill itself. When reading a level, the package can additionally infer information from prerequisites and linked skills in the supplied skill tree.


## Reading skill estimates

### Individual skills

```ts
const coefficients = skillLevels.getInferredCoefficients('addition')
const expectedSuccessRate = skillLevels.getExpectedSuccessRate('addition')

const highestCoefficients = skillLevels.getInferredHighestCoefficients('addition')
const highestExpectedSuccessRate = skillLevels.getHighestExpectedSuccessRate('addition')
```

The expected success rates are numbers between zero and one. The coefficient methods retain the full uncertainty distribution.

Use `getSkillLevel` when the inferred coefficients, dates, highest level, and practice count are all needed together.

```ts
const skillLevel = skillLevels.getSkillLevel('addition')
```

`hasSkillLevel(skillId)` checks whether direct data has been loaded for a skill. `hasRequiredDataFor(skillId)` also checks the data needed for its prerequisites and links.

### Skill setups

A setup can combine several skills. Its estimate accounts for both the setup's logic and the uncertainty in every underlying skill.

```ts
const expectedSuccessRate = skillLevels.getSetupExpectedSuccessRate(setup)
const coefficients = skillLevels.getSetupInferredCoefficients(setup)

const highestExpectedSuccessRate = skillLevels.getSetupHighestExpectedSuccessRate(setup)
const highestCoefficients = skillLevels.getSetupInferredHighestCoefficients(setup, 6)
```

The optional inference order controls the resolution of the resulting Bernstein approximation. Higher orders retain more detail but require more work. The package default is suitable for ordinary use.

Several optional setups can also be combined into one estimate:

```ts
const expectedSuccessRate = skillLevels.getCombinedSetupExpectedSuccessRate([
	primarySetup,
	bonusSetup,
])
```

Linked skills without an explicit correlation use the exported `defaultSkillLinkCorrelation`, currently `0.5`.


## Applying observations

A `SkillObservation` records whether a learner succeeded at a deterministic skill setup.

```ts
const updates = skillLevels.applyObservation({
	setup: and('addition', 'multiplication'),
	correct: false,
})
```

Only deterministic setups can be observed. A stochastic setup does not reveal which randomly selected skills were actually required, so the package rejects it. The exercise should instead report the deterministic setup that was used for that particular instance.

The returned object only contains affected skills:

```ts
{
	addition: {
		coefficients: [/* ... */],
		coefficientsOn: new Date(),
		numPracticed: 4,
		highest: [/* ... */],
		highestOn: new Date(),
	},
}
```

`highest` and `highestOn` are included only when the observation produces a new highest estimated level.

### Simultaneous observations

Use `applyObservations` when several results should be treated as occurring at the same time.

```ts
const updates = skillLevels.applyObservations([
	{ setup: firstSetup, correct: true },
	{ setup: secondSetup, correct: false },
])
```

Every observation in the batch is evaluated against the same prior skill data. The order of the observations therefore does not affect the result, and the highest level is considered only after the complete batch has been combined. The full batch is validated before any changes are applied.


## Synchronizing stored updates

Use `applyUpdates` to merge data received from persistent storage or another process.

```ts
skillLevels.applyUpdates(storedSkillLevelUpdateSet)
```

Newer updates are applied, stale or duplicate updates are ignored, and contradictory ordering between `coefficientsOn` and `numPracticed` throws an error. An update for a previously unknown skill must include both `highest` and `highestOn`, because complete initial data is required.

The entire update set is classified before anything changes, so a conflicting update cannot leave the instance partially updated.


## Decay and inference

Older evidence gradually moves toward the uniform distribution. This represents increasing uncertainty as time passes. A smaller practice-related effect is also applied when processing a new observation; its strength decreases as `numPracticed` grows.

These defaults are exported from the package:

- `timeDecayHalfLife`;
- `initialPracticeDecayTime`;
- `practiceCountHalfLife`;
- `defaultInferenceOrder`;
- `defaultSkillLinkCorrelation`;
- `inferenceCacheDuration`.

Most users can rely on these defaults. For lower-level use, `applySkillLevelDecay` applies the decay calculation directly:

```ts
const decayed = applySkillLevelDecay(coefficients, {
	elapsedTime: 30 * 24 * 60 * 60 * 1000,
	applyPracticeEffect: true,
	practiceCount: 12,
})
```

Options may override the default half-lives for an individual calculation.


## Subscribing to changes

`SkillLevelSet` can notify consumers when its stored data changes. This is useful for state-management systems and React's `useSyncExternalStore`.

```ts
const unsubscribe = skillLevels.subscribe(() => {
	console.log('Skill levels changed')
})

const snapshot = skillLevels.getSnapshot()

unsubscribe()
```

The snapshot is an opaque identity token. Its identity changes after an applied update or `clear()`, but its contents should not be inspected. Ignored stale updates do not change it.


## Validation helpers

The package exports helpers for validating data at system boundaries:

- `ensureSkillLevel(value)` validates and copies a complete stored skill level;
- `ensureStoredSkillLevelUpdate(value)` validates and copies a stored update;
- `ensureSkillObservation(value)` validates an observation and normalizes its setup;
- `getInitialSkillLevel(date?)` creates a complete uniform skill level.

Mutable arrays and dates are copied so callers cannot mutate internal state accidentally.


## TypeScript types

The main public types are:

- `StoredSkillLevel`: complete persistent data for one skill;
- `StoredSkillLevelSet`: stored levels indexed by skill ID;
- `SkillLevelData`: the inferred data returned by `getSkillLevel`;
- `SkillObservation`: a deterministic setup and its correct/incorrect result;
- `StoredSkillLevelUpdate`: an update for one skill, with optional new-highest data;
- `StoredSkillLevelUpdateSet`: updates indexed by skill ID;
- `SkillLevelDecayOptions`: options accepted by `applySkillLevelDecay`.
