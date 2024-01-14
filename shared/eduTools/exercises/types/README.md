# Exercise types

On Step-Wise it is in theory possible to program any crazy type of exercise. However, in practice exercises are usually either a `SimpleExercise` (just one grading which is correct or incorrect) or a `StepExercise` (which can be split up into substeps). Here you can learn more about how they work. Specifically, we look at how to get `processAction` function for these exercise types.


## SimpleExercise

A `SimpleExercise` is an exercise which gets input and is then graded as correct or incorrect.

### Required exports

In the `shared` folder there are three parameters that always must be exported.

- Exercise `metaData`: any information about the exercise, like what skill is it connected to.
- A `generateState` function: this defines the exercise parameters. (More about this in a bit.)
- A `processAction` function: this is the function that defines the exercise functioning. Let's study how to set this up.

### The `processAction` function

For a `SimpleExercise`, we can set up a `processAction` parameter through:

```
const processAction = getSimpleExerciseProcessor({ metaData, generateState, getSolution, checkInput })
```

Tip: see an existing exercise to see how this is set up.

### Functions to be defined for the processor

The functions to be provided are as follows.

- `generateState` gives a basic object with parameters -- a `state` -- that defines the exercises. For instance it can be `generateState = () => ({ a: getRandomInteger(1, 10), b: getRandomInteger(1, 10) })`.
- `getSolution` is in theory optional, but it is used pretty much always. It takes the exercise state and comes up with a basic object with a lot of useful calculated parameters, including the final solution. It could for instance be `getSolution = ({ a, b }) => ({ sum: a + b, product: a*b })`.
- `checkInput` is the grading function. It receives all exerciseData (like `{ state, input, solution, metaData }`) in one object, and then returns either `true` or `false`: is the input correct? So it could be

```
const checkInput = ({ solution, input }) => solution.sum === input.sum && solution.product === input.product
```

Note: there are many supporting functions for checking exercise inputs. See the [checking](../checking/) folder for more information about this. Alternatively, you can run a `console.log` on the given `exerciseData` and see how to check the input based on that.

If you have done that, you have set up the `shared` part of the `SimpleExercise`! See the [frontend exercise types](../../../../frontend/src/ui/eduTools/exercises/types/) folder for further info on how to set up the display.


## StepExercise

The `StepExercise` is an extension of the `SimpleExercise`. It works pretty much identically, but now we can also check steps and possibly substeps.

### Defining steps

The only difference is in the `checkInput` function. This function now gets an extra `step` parameter: this is `0` when the user is working on the main problem, or `1, 2, 3, ...` when the user has split up the exercise into steps. The `checkInput` now has to grade, for the given step, whether the input is correct. So it could be something like

```
const checkInput = ({ input, solution }, step) => {
	switch (step) {
		case 1:
			return solution.part1 === input.part1
		case 2:
			return solution.part2 === input.part2
		default: // For step 0 (main problem) or step 3 (final problem).
			return solution.finalAns === input.finalAns
	}
}
```

### Adding substeps

Suppose an exercise has two parts (part 1 and part 2) that do not build on each other. The user can do them simultaneously. However, each part is connected to a separate skill, and if the user does part 1 correctly and fails part 2, he/she of course shouldn't have to do that part again. This is a typical scenario where substeps are useful.

In this case, the user can simply do parts 1 and 2 simultaneously, together in one step. Each part is then a substep. And if a substep has been graded as correct, it won't be graded any further.

The way to set this up is as follows.

```
const checkInput = ({ input, solution }, step, substep) => {
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return solution.part1 === input.part1
				case 2:
					return solution.part2 === input.part2
			}
		default: // For step 0 (main problem) or step 2 (final problem).
			return solution.finalAns === input.finalAns
	}
}
```


## The `getSolution` parameter: input-dependent solutions

It is possible to make a `SimpleExercise` and a `StepExercise` without a `getSolution`. However, it is way more convenient to define a `getSolution` function that calculates and defines all parameters you may need at any point in time. The exercise types are programmed in such a way that the `getSolution` function is called as little as possible (efficiency in case of difficult computations) but its results are available in as many places as possible.

In general, the `getSolution` parameter is a function that receives the `state` and returns a basic objects with parameters: anything that might be useful can be in there. However, in some special cases the solution of an exercise might be input-dependent. For instance, maybe in a physics exercise the user first has to define a "positive direction" (left or right) and depending on this choice (which can be made freely) the answer is either `30 m` or `-30 m`. How do we deal with this?

The solution is an input-dependent solution. To accomplish this, the `getSolution` parameter is now an object with four functions.

```
const getSolution = { dependentFields: ['direction'], getStaticSolution, getInputDependency, getDynamicSolution }
```

The system then works in three steps.

- First the `staticSolution` is calculated, based on the `getStaticSolution(state)` function. This is done once, and this contains all parameters that do not chance based on the input.
- On a first render, or whenever any of the `dependentFields` changes, then the `inputDependency` is (re)calculated. This is done through the `getInputDependency(filteredInput, staticSolution)` function. This function receives only the inputs mentioned in the `dependentFields` parameter and no other input fields. It returns any parameter that defines the case we find ourselves in. For our example physics problem, it could simply be a boolean `upIsPositive` or so.
- On a first render, or whenever the `inputDependency` changes, then the `getDynamicSolution(inputDependency, staticSolution, state)` function is called. This returns the `dynamicSolution`: an object containing all parameters that depend on the input.

Eventually the `solution` object is the merger of the dynamic solution and the static solution.

```
const solution = { ...staticSolution, ...dynamicSolution }
```

This solution object is then again available to all parts of the exercise, for instance for grading the input, giving feedback, or displaying the right solution adjusting to the user's input.


## General exercises

Above we have defined various exercise types. If you want to create new exercise types, then read on.

An exercise is defined by the `generateState` function and the `processAction` function. The `generateState` function is pretty simply: it just comes up with exercise parameters that are then stored in the database. But the `processAction` is more tricky.

The `processAction` function works just like a [reducer](https://css-tricks.com/understanding-how-reducers-are-used-in-redux/). It gets an object as input with five properties:

- The current `progress` object of the exercise. This object is used to keep track of the progress of the student in this exercise. It starts as an empty object `{}` but can be filled with whatever the exercise needs. For instance, after a while it may look like `{ step1done: true, step2done: true }` or `{ atStep: 3 }` or whatever.
- A given `action`. Again, this can be any type of object, but a common action is `{ type: "input", input: { ans: 105 } }` or `{ type: "giveUp" }`.
- The exercise `state`. This is the one originally generated by the `generateState` function.
- The `history` array. This array is tracked behind the scenes but will look like `[{ action: { ... }, progress: { ... } }, ..., { action: { ... }, progress: { ... } }]`. So it contains the first action, the progress *after* this action, the second action, the progress *after* this action, and so forth. (Note that the initial progress is always `{}` so it's omitted from the history.) It is much cleaner to *never* use the history object in the `processAction` function, making it a clean reducer. However, in some very rare cases it may be useful.
- An `updateSkills` function. When the student has successfully solved or failed at a certain skill, the `processAction` function should call the given `updateSkills` function. The syntax for this is `updateSkills(setup, true)` on a correct solution and `updateSkills(setup, false)` on an incorrect one. The given `setup` can be a `skillId` or any setup object. (Note: it must be an exercise-type setup, so only `and`, `or` and `repeat` functions may be used.) For instance, if the student failed a step that could be solved using either skill `A` or `B`, use `updateSkills(or("A", "B"), false)`. This is then processed accordingly. (That is, on the server, skill mastery scores are adjusted in the database. For offline users the `updateSkills` function is an empty (no-op) function.)
	
The `processAction({ progress, action, state, history, updateSkills })` function should finally return a new `progress` object. For example, it could return `{ atStep: 4 }`, but in theory any desired `progress` object is possible. This progress is then once more stored in the database.

There is one special rule about the `progress` parameter. If it has the parameter `done` set to `true`, like in `{ stuff: 'whatever', done: true }`, then the system sees that the exercise is done and registers as such. On a subsequent visit, a new exercise will be generated. But until this is done, the exercise continues.
