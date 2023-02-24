# Step-Wise skill tracking

Step-Wise uses a large skill tree. For each student, and for each skill in the tree, Step-Wise tracks the mastery level. This file discusses script-wise how this all works. For the mathematics behind skill tracking, there is a [separate PDF file on Skill Tracking](../../frontend/public/SkillTracking.pdf) that you can read. There is also a paper on this in the works.

## Skill coefficients

The algorithm constantly keeps track of the distribution of the success rate of each skill. This distribution is described by a set of coefficients. An example is `[0, 0.2, 0.8]`. Tracking and manipulating these coefficients is described further in the [coefficients directory](coefficients/).

## Polynomials

Every skill has a set-up. For instance, something like `and('a', or('b', 'c'))`. Corresponding to this set-up is a polynomial. This could be something like `a*c + a*b - a*b*c`. Each polynomial can also be captured in a polynomial matrix, describing the coefficients. For the example, this is `[[[0,0],[0,0]],[[0,1],[1,-1]]]`. Here, the coefficient in matrix element `matrix[i][j][k]` is the coefficient before the term `a^i*b^j*c^k` in the polynomial.

There are various methods related to handling and manipulating polynomials. This is all further elaborated on in the [polynomial directory](polynomials/).

## Skill set-ups

To describe the dependency of a skill on another, we use skill set-ups. This is described in the [setup directory](setup/). For instance, a skill can depend on subskills `a`, `b` and `c` through `and('a', or('b', 'c'))`. To create such a set-up, important the `and` and `or` functions and set it up through exactly this code.

## Data sets and updating them

The most important functionality is how to track and update data sets. A data set is an object like `dataSet = { addition: [0, 0.2, 0.8], multiplication: [0.7, 0.3], powers: [1] }` with a coefficient list for each relevant skill.

When you make an observation, like a student doing a set-up `setup = and('addition', or('multiplication', 'powers'))` correctly, then you can update the data set. This is done through `setup.processObservation(dataSet, correct)`. Here, `correct` is a boolean: did the student do it correctly or not? The result is an updated data subset. It only contains the skills that have been updated. The original data set is not adjusted, but of course the calling script can merge the two data sets together if desired.

## ToDo: inference

