# Step-Wise skill tracking

Step-Wise uses a large skill tree. For each student, and for each skill in the tree, Step-Wise tracks the mastery level. This file discusses script-wise how this all works. For the mathematics behind skill tracking, there is a [separate PDF file on Skill Tracking](../../frontend/public/SkillTracking.pdf) that you can read. There is also a paper on this in the works.


## Skill coefficients

The algorithm constantly keeps track of the distribution of the success rate of each skill. This distribution is described by a set of coefficients. An example is `[0, 0.2, 0.8]`. Tracking and manipulating these coefficients is described further in the [coefficients directory](coefficients/).


## Polynomials

Every skill has a set-up. For instance, something like `and('a', or('b', 'c'))`. Corresponding to this set-up is a polynomial. This could be something like `a*c + a*b - a*b*c`. Each polynomial can also be captured in a polynomial matrix, describing the coefficients. For the example, this is `[[[0,0],[0,0]],[[0,1],[1,-1]]]`. Here, the coefficient in matrix element `matrix[i][j][k]` is the coefficient before the term `a^i*b^j*c^k` in the polynomial.

There are various methods related to handling and manipulating polynomials. This is all further elaborated on in the [polynomial directory](polynomials/).


## Skill set-ups

To describe the dependency of a skill on another, we use skill set-ups. This is described in the [setup directory](setup/). For instance, a skill can depend on subskills `a`, `b` and `c` through `and('a', or('b', 'c'))`. To create such a set-up, important the `and` and `or` functions and set it up through exactly this code.

A skill set-up has many functions. A couple of them require a coefficient set, which is an object of the form `{ someSkill1: [...coefficients...], someSkill2: [...coefficients...] }`. It is also possible to update these coefficient sets on a new observation. This is done through `setup.processObservation(coefSet, correct)`. Here, `correct` is a boolean: did the student do it correctly or not? The result is an updated coefficient subset. It only contains new coefficients for the skills that have been updated. The original coefficient set is not adjusted, but of course the calling script can merge the two data sets together if desired.


## Inference: the Skill Data object

The skill tracking algorithm can also use set-ups between skills to apply inference. We then don't just use data for a skill itself, but also data on its subskills, and combine all that data to make a more informed estimate about the proficiency of the user in that skill. The full process is described in the [inference directory](inference/), but we give a summary here.

The process starts with a raw skill data set pulled from the database. This is something like `{ someSkill1: { coefficients: [...], coefficientsOn: Date, highest: [...], highestOn: Date, numPracticed: number }, ... }`. This is then fed into the `processSkillDataSet(rawSkillData, skillTree)` to turn into a functional skill data set. This is an object of the form `{ someSkill1: SkillData }`, where each parameter is a `SkillData` object. This object has various useful properties that can be called, including the inferred (posterior) coefficients. Updates can be implemented into a skill data set through `updateSkillDataSet(oldSkillDataSet, updatedRawSkillData)` where the `updatedRawSkillData` can contain updated data for some (already existing or even new) skills.
