# Applying inference to distributions

The [coefficients directory](../coefficients/) has all the basic functionalities of manipulating distributions. Think of smoothing them, merging them, etcetera. Using these methods, we can apply inference: determine the posterior distribution of a skill, given information about *other* skills. That is done in this folder.


## The skill data set

Previously we have worked with coefficient sets: objects of the form `{ someSkill1: someCoefArray, someSkill2: someCoefArray }`. When applying inference, we work with functional skill data sets `{ someSkill1: someSkillDataObject, someSkill2: someSkillDataObject }`. Here all parameters are `SkillData` objects with added functionalities.

To start, we need a raw data set of skills, often loaded from the database. This is a basic object of the form `{ someSkill1: { coefficients: [...], coefficientsOn: Date, highest: [...], highestOn: Date, numPracticed: number }, ... }`. We call this a "raw skill data set". To turn this into a "functional skill data set", use

```
skillDataSet = processSkillDataSet(rawSkillDataSet, skillTree)
```

The skill tree is needed to know which links each skill has to other skills. The result is a functional skill data set: a basic object with `SkillData` properties.


## The SkillData object

The `SkillData` object is an object that has all the functionalities required for getting posterior distributions. It does two important things.

- Extract posterior distributions through inference.
- Cache said distributions, updating them whenever required.

To do this, every `SkillData` object has access to the functional skill data set it belongs to, to access other `SkillData` objects of related skills. This allows it to calculate the following properties.

ToDo: list properties of the SkillData object.




