# Exercise checking

Pretty much all exercises make use of a `checkInput` function. This function gets all exercise data (and possibly a step and substep) and needs to check if the input is correct. It returns a boolean.

Of course this can be done in rudimentary ways: `return solution.ans === input.ans`. However, for physical quantities or mathematical expressions this doesn't work. Even then, it's of course possible to run `return solution.ans.equals(input.ans, { ... some options ... })` but this gets tedious. That's why this folder has various support functions that make your life easier.

## Various comparison methods

There are a variety of input types on Step-Wise. But how can we compare them? There are generally two ways.

### Using a comparison options object

Many input types have an `equals` function. For instance the `FloatUnit` object that represents physical quantities like `2.0 kg`. When comparing `FloatUnits` we provide a comparison options object. It defines the margins that can be used, and what type of equality check must be run on the units. (If the solution is `0.20 kg`, is `200 g` an acceptable answer?) The equality check should then be run through `solution.ans.equals(input.ans, { ... some options ... })`. (Note: we always run the comparison on the solution parameter instead of the input parameter, since the solution parameter is more reliable to be sensible. Though in theory it shouldn't matter.)

Using a comparison object is powerful, because on an error it allows us to get information about the type of error too. For instance, we may find that the solution is not equal to the input, because a unit of `kg` is specifically required, and if this requirement is relaxed, then there would be equality.

### Using a comparison function

For other object types, for instance for mathematical `Expressions`, it's not possible or sensible to capture the equality options in a single object. In that case, we use comparison functions. These functions are generally of the form

```
comparison = (inputValue, solutionValue, fullSolutionObject) => solutionValue.equals(inputValue, { ... someOptions ... })
```

An example is `equivalent(input, solution)` or `onlyOrderChanges(input, solution)`, and so forth.

Note: For comparison functions we always provide the `inputValue` first, because the `solutionValue` might not always even be needed. The `fullSolutionObject` parameter is only provided for exercises in which a `getSolution` function has been provided.

Using comparison functions is less powerful than using comparison objects, since we cannot figure out why the comparison got rejected. 

### The location of the comparison definition

We know that the `comparison` method can be either an object with options, or a function. But where do we put it? In practice, this `comparison` method is needed both for checking/grading the exercise (which is defined in the `shared` folder) as well as to eventually provide feedback on user input (which is done in the `frontend` folder).

To make sure both scripts can access this data, the `comparison` methods are defined inside of the exercise `metaData` parameter. So this `metaData` parameter will look like

```
metaData = {
	skill: 'someSkillId',
	comparison: {
		someExpression: (input, solution) => equivalent(input, solution),
		someFloatUnit: { relativeMargin: 0.2 },
		default: {}, // Empty object uses default options.
	}
}
```

By doing it this way, they are accessible to both sides of the exercise. Changing it in one place will change them everywhere.


## Making comparisons

We just saw that the `comparison` method is defined in the exercise `metaData`. How can we easily use this? There are functions that easily do exactly that.

### The `performComparison` function

The `checkInput` function gets all `exerciseData`: the `state`, `input`, `solution` and `metaData`. We can forward this data to the `performComparison` function. This goes like

```
const checkInput = (exerciseData) => {
	return performComparison(exerciseData, ['someExpression', 'someFloatUnit', 'someOtherNumber'])
}
```

The function will then use all available data to grade the given parameters. It searches inside the `metaData` for which comparison method is connected to the given parameter ID and run that comparison method. It returns true when all comparisons match out. That makes everything a lot simpler! In 95% of the cases this type of comparison is all you need.

Usually the `performComparison` function gets a single string `someFloatUnit` or an array of strings `['someExpression', 'someFloatUnit', 'someOtherNumber']`. If you really want to override the comparison method, you can also provide an object.

```
const checkInput = (exerciseData) => {
	return performComparison(exerciseData, { someExpression: (input, solution) => someOtherComparisonFunction(input, solution) })
}
```

In this case the `metaData` is ignored. This is not customary, as now the feedback functions in the frontend do not know how the parameter is graded.

### The `performListComparison` function

Sometimes there are problems where two or more answers are needed, and it doesn't matter in which order they appear. For instance, "Give the two solutions of `x*(x-2) = 0`. The user could enter `x1 = 0, x2 = 2` or `x1 = 2, x2 = 0` and both solutions would be fine. In this case you need a list-comparison.

The general way in which this is done is through

```
const checkInput = (exerciseData) => {
	return performListComparison(exerciseData, ['x1', 'x2'])
}
```

The script then tries to match the parameters `x1` and `x2` from the `solution` object to those from the `input` object. For `x1` it uses the comparison method defined for `x1` and identically for `x2`. (Obviously, you often want them to be equal, but this is not necessarily required.)

If you don't want to define the comparison method in the `metaData` (not recommended) then you can also manually defined them. This can be done in two ways: generally (as third function parameter) or specific per parameter (through defining an object with the right keys).

```
const checkInput = (exerciseData) {
	return performListComparison(exerciseData, ['x1', 'x2'], (input, solution) => equivalent(input, solution)) // General method.
	return performListComparison(exerciseData, { x1: equivalent, x2: onlyOrderChanges }) // Specific per parameter.
}
```

Obviously this is not recommended, and is only needed in edge cases.
