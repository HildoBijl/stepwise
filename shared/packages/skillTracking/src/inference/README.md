# Applying inference to distributions

In this inference folder, we use all the mathematical tools from [coefficients](../coefficients/) and [polynomials](../polynomials/), together with the [skill set-ups](../setup/). It allows us to infer the skill level for skills, based on data from different linked skills.


## The skill data set

Our starting point is raw skill data of the form `{ someSkill1: { coefficients: [...], coefficientsOn: Date, highest: [...], highestOn: Date, numPracticed: number }, ... }`. We have a raw data set `{ someSkill1: someRawSkillDataObject, someRawSkill2: someSkillDataObject }`. This is fed into a new `SkillDataSet` object through:

```
const skillDataSet = new SkillDataSet(rawSkillDataSet, skillTree)
```

If more raw data is loaded, either updating existing skills or adding new raw skill data, this can be done through `skillDataSet.update(newRawSkillDataSet)`.

Once the data has been loaded, we can request the inferred coefficients for skills. This is done through `skillDataSet.getCoefficients(skillId)` and/or `skillDataSet.getHighestCoefficients(skillId)`.
