# Applying inference to distributions

The [coefficients directory](../coefficients/) has all the basic functionalities of manipulating distributions. Think of smoothing them, merging them, etcetera. Using these methods, we can apply inference: determine the posterior distribution of a skill, given information about *other* skills. That is done in this folder.


## The skill data set

Previously we have worked with coefficient sets: objects of the form `{ someSkill1: someCoefArray, someSkill2: someCoefArray }`. When applying inference, we work with functional skill data sets `{ someSkill1: someSkillDataObject, someSkill2: someSkillDataObject }`. Here all parameters are `SkillData` objects with added functionalities.

To start, we need a raw data set of skills, often loaded from the database. This is a basic object of the form `{ someSkill1: { coefficients: [...], coefficientsOn: Date, highest: [...], highestOn: Date, numPracticed: number }, ... }`. We call this a "raw skill data set". To turn this into a "functional skill data set", use

```
skillDataSet = processSkillDataSet(rawSkillDataSet, skillTree)
```

The skill tree is needed to know which links each skill has to other skills. The result is a functional skill data set: a basic object with `SkillData` properties.

When new raw data becomes available, for instance after an updated from the database, this can be incorporated. It is not necessary to make a new data set: simply add it using

```
skillDataSet = updateSkillDataSet(skillDataSet, updatedRawSkillDataSet, skillTree)
```

This modifies the data set to incorporate the new raw data. Old cached data is ignored where appropriate.


## The SkillData object

The `SkillData` object is an object that has all the functionalities required for getting posterior distributions. It does two important things.

- Extract posterior distributions through inference.
- Cache said distributions, updating them whenever required.

To do this, every `SkillData` object has access to the functional skill data set it belongs to, to access other `SkillData` objects of related skills. This allows it to calculate the following properties. First there are five properties that give coefficient arrays.

- `rawCoefficients` are the coefficients for the distribution before smoothing.
- `smoothenedCoefficients` are the coefficients for the distribution after smoothing but not taking into account data on related skills.
- `coefficients` are the coefficients for the distribution taking into account data on related skills, like the skill set-up and links with correlated skills.
- `rawHighest` are the highest coefficients that have ever been obtained, not taking into account data on related skills (but after smoothing; the highest coefficients are always stored after smoothing).
- `highest` are the highest coefficients that have ever been obtained, taking into account data on related skills.

Then there are various other properties.

- `lastPracticed` gives a `Date` object representing the last time this skill was updated.
- `highestOn` gives a `Date` object indicating when the highest score was obtained.
- There are various other properties from the raw data, like the `skillId`, the `skill` (from the skill tree), the `setup`, `prerequisites`, `links`, `numPracticed` and such that can be requested from the `SkillData` too.





