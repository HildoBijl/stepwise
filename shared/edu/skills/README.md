# The Step-Wise skill tree

The fundamental idea behind Step-Wise is the skill tree. It shows the relationships between skills. To see how this works, examine the following example skills:

- **Determine operation order (skill `A`):** determine what comes first, addition or multiplication (and similarly for other operations).
- **Summation (skill `B`):** calculate a sum like `23 + 82`.
- **Multiplication (skill `C`):** calculate a product like `7*9`.
- **Calculate composite expressions (skill `X`)**: evaluate an expression like `42 + 8*2`, or `3*9 + 8*7`.

To solve an exercise of calculating composite expressions, you need to apply the other skills. First you need to determine the operation order, then calculate the product (possibly twice) and then add everything up. As a result, the first three skills `A`, `B` and `C` are *prerequisites* for the fourth skill `X`.


## Basic and composite skills

There are two types of skills.

- **Basic skills:** these are very simple skills that have no prerequisites. For instance, "Summation" is most likely a basic skill. Their exercises do not have steps: they can be solved directly. (In theory, if it turns out students struggle with the summation of sums like `23 + 82` it can still be split up into steps. In this case summation is not a basic skill anymore but will have various subskills too.)
- **Composite skills:** these are skills that consist of multiple other skills. For example, "calculate composite expressions" is a composite skill.

Each skill has corresponding exercises. Exercises for basic skills generally do not consist of multiple steps, while exercises for composite skills do. (Exceptions to this do at times occur, but not often.)


## Exercises for composite skills

Consider an exercise of a composite skill. For example, "Calculate `3*9 + 8*7`." This exercise corresponds to skill `X` (calculate composite expressions). To solve it, we have to first apply skill `A`, then apply skill `B` twice, and then apply skill `C`. You see: solving an exercise for a composite skill requires the application of multiple subskills.

Every composite exercise has a *setup* defining exactly what steps need to be applied to solve the exercise. To define this setup, we use three setup functions.

- **and**: writing `and(A, B, C)` means skills `A`, `B` and `C` all need to be applied to solve the exercise.
- **or**: writing `or(A, B, C)` means students can solve the exercise in three different ways. They can use skill `A`, `B` or `C`, or even use multiple of these skills and compare the corresponding outcomes to evaluate their own work.
- **repeat**: writing `repeat(A, 3)` means the same as writing `and(A, A, A)` but it is considered cleaner.

So for the exercise of calculating `3*9 + 8*7` the setup is `and(A, repeat(B, 2), C)`. You notice that these functions can be nested to your heart's desire.

When defining the setup, the order does not matter. We could have also written the setup as `and(and(C, B), and(A, B))` which would have the same effect. Nevertheless, it is customary to write the setup in the same order as the steps need to be executed, to keep the code easier to understand.


## The setup for composite skills

Just like exercises, composite skills also have a setup. This setup defines which subskills (like `A`, `B` and `C`) are needed to solve an "average" exercise. However, you may be wondering, "Sometimes we get an exercise like `42 + 8*2` with setup `and(A, B, C)`, but sometimes we get an exercise like `3*9 + 8*7` with setup `and(A, repeat(B, 2), C)`. How does this work?" And you are correct: the problem with skills is that there is some variability involved.

To accomodate for this, we have two additional setup functions for skills. These functions do *not* work (nor would they be appropriate) for exercises, so keep that in mind. They are the following.

- **pick**: writing `pick([A, B, C])` will randomly pick one of the given skills. This is useful if an exercise sometimes requires subskill A, sometimes subskill B and sometimes subskill C, but it varies per exercise. This function also has extra possibilities.
	- Pick multiple: writing `pick([A, B, C], 2)` will pick two skills out of the set (without repeats). So in this case a third of the exercises uses `and(A, B)`, a third of the exercises uses `and(A, C)` and a third of the exercises uses `and(B, C)`. By default, only one skill is picked.
	- Add weights: writing `pick([A, B, C, D], 2, [1, 1, 2, 2])` will make it much more likely that `C` and `D` are chosen. By default equal weights are used.
- **part**: writing `part(A, 0.5)` means skill `A` is used only half the times. It only occurs in half the exercises.

For our example skill, we could hence define the setup in either of the following ways. (And there are plenty of more convoluted possibilities.)

- `and(A, pick([B, repeat(B, 2)]), C)`
- `and(A, B, part(B, 0.5), C)`
- `pick(and(A, B, C), and(A, repeat(B, 2), C))`

By defining the setup like this, our machine learning algorithm can calculate the chance that the student has mastered said skill.

Some people mix up the `or` and the `pick` operator. Note that these are in fact *very different* operators. Using `or(A, B)` in an exercise (or skill) setup means that the exercise can be solved using either of the skills `A` or `B`: students are free to pick. However, using `pick(A, B)` in a skill setup means there are multiple exercises. Half of these exercises require skill `A` to be used and they *cannot be solved* with skill `B`. (And vice versa for the other half.) Keep this distinction in mind.


## Requirements for the skill tree

Based on the setup of each skill, Step-Wise determines the *prerequisites* for that skill. This list of prerequisites simply consists of all the skills that are present in the setup. So the prerequisites for skill `X` are `A`, `B` and `C`. These are all the skills that a student should master before trying to tackle this skill `X`. (If a subskill like `A` should not be counted as a prerequisite for `X`, then it shouldn't be in the setup in the first place.)

Based on all the prerequisites, we can set up a huge learning tree. In this tree, we draw all skills and connect each skill (like `X`) with its prerequisite skills (`A`, `B`, `C`) through lines. This can result in a very complex hierarchy. There are a few rules/guidelines for the setup of this tree.

- **Rule: no cycles.** It may never be that a skill A is a prerequisite for a skill B, which in turn is a prerequisite for a skill C, which then is required for skill A. (Or for a longer cycle to be present.) Automated testing checks for cycles and stops a deploy if this may happen.
- **Guideline: 3-4 prerequisites per skill.** Ideally a skill has three or four direct prerequisites. Two or five prerequisites may at times be okay too. In special cases it is possible that a skill has one direct prerequisite: exercises require this skill to be repeated multiple times then. However, the following should *not* happen.
	- *An exercise with only one step.* In this case this skill and the prerequisite skill are the same skill, not two different ones.
	- *An exercise with six or more steps.* In this case some of these steps need to be merged into another skill. It is confusing for the user, and it also doesn't match well with our machine learning system. (The reason is that our machine learning system is inherently a bit conservative: reaching a score above 90% is very difficult. So if an exercise has six steps, each with a probability of success below 90%, then the algorithm always estimates the success rate as very low. The conservativeness of our algorithm is exacerbated a bit too much.)

Other than these rules/guidelines, pretty much anything goes within the skill tree.


## Adding links/correlations to the skill tree

It may happen that some skills are very similar. Consider for instance the two skills:

- Calculating the efficiency of an engine or other type of system (skill `P`). To calculate this, you have to divide the output (electricity generated) by the input (added heat).
- Calculating the coefficient of performance of a heat pump or similar system (skill `Q`). To calculate this, you have to divide the output (transferred heat) by the input (electricity used).

In this case, there is no direct prerequisite relation: it's not like one of these skills is a prerequisite for the other. They are separate. However, they are very similar! What is the best way to incorporate this into the skill tree?

There are actually three options here:

- If the skills are *very similar* then just merge them into a single skill. For example, we could define a merged skill "calculatePerformanceParameters". However, if you want students to calculate with efficiency without them having to know about heat pumps, then this may not be what you want.
- If the skills are *distinct enough* then just keep them separate. This of course works, but it does require a student who already mastered skill `P` to start from scratch with skill `Q`. It may result in Step-Wise recommending a couple of boring and seemingly pointless exercises, which is not ideal.
- If the situation falls in-between, it is possible to link the skills into linked groups.

To set up a linked group, use a function `group([P, Q], 0.8)`. The given percentage is the correlation between these skills: "If hypothetically the student has mastered skill `P` completely, and has a 100% chance of succeeding in it, what is the chance he/she successfully applies skill `Q`, and vice versa?" This percentage must be the same within the entire group. If it is not, you can make multiple groups for each individual link. This is then taking into account by the machine learning algorithm when estimating success probabilities.


## Programming the skill tree

Currently the skill tree is hard-coded in the `shared/edu/skills/index.js` file. This file exports a large object with all the skills known to Step-Wise. The setup of the object is as follows.

	{
		summation: {
			name: 'Add numbers',
			exercises: ['someExerciseId', 'someOtherExerciseId'],
		},
		multiplication: {
			name: 'Multiply numbers',
			exercises: ['someExerciseId', 'someOtherExerciseId'],
		},
		operationOrder: {
			name: 'Determine the order of operations',
			exercises: ['someExerciseId', 'someOtherExerciseId'],
		},
		compositeExpressions: {
			name: 'Calculate composite expressions',
			exercises: ['someExerciseId', 'someOtherExerciseId'],
			setup: and('operationOrder', 'summation', 'multiplication'),
		},
	}

Note that basic skills do not have a setup (since they have no prerequisites) but composite skills do. Also note that we refer to the ID (generally written in camel case) when mentioning a skill. The name is there only for display purposes. 

The order in which skills appear inside the skills file is important! When Step-Wise recommends skills to students, it starts with the first one mentioned in the skills file. That is why `operationOrder` is placed later on in the file (even though it's the first step in most exercises): because it makes more sense for students to learn summation and multiplication first, before worrying about the order of these operations.

At the bottom of the skill tree we define *linked groups*. Finally some post-processing is done, like extracting prerequisites and such.