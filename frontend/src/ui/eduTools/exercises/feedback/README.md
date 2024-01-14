# Feedback suppor functions

Automatic feedback to user input is a crucial part of Step-Wise. It helps students practice and motivates them to try again if they make a mistake. So how does it work?

Generally, a `getFeedback` function receives `exerciseData` and uses this to return an object of the form `{ param1: { correct: true, text: 'Nice!' }, param2: { correct: false, text: 'Oops...' } }`. But to get there, there are various supporting functions.


## Field input feedback

Most input fields are of the `FieldInput` type. Think of an input field in which you type something. If you have that, use the methods below.

### The default intelligent feedback

Generally, field input values are graded separately. An input value is either correct or incorrect, and this does not depend on other inputs. When this is the case, then the grading is done through `performComparison(exerciseData, [' param1', 'param2'])`. Identically, the feedback can then be given through

```
const getFeedback = (exerciseData) => {
	return getFieldInputFeedback(exerciseData, ['param1', 'param2'])
}
```

Note that the format is identical! The `getFieldInputFeedback` then tries to get feedback about the given parameters in an intelligent way. It gets the comparison options from the `metaData`, grades them once more, tries grading them in alternative ways to see if this changes the results, and then returns a message like "Well done! It's correct, but if the margins were a bit smaller, it wouldn't be. Try to be a bit more accurate." Of course the result is in the required object format `{ param1: { correct: true, ... } }`.

### Adding feedbackChecks

When setting up automatic feedback, there are often small checks you want to do to detect common mistakes. For instance, maybe the user got the minus sign wrong, or flipped the denominator and the numerator or so. These small checks are called `feedbackChecks`. It's an array of small functions, and the first one that returns something gets to give the feedback message. If none of the `feedbackChecks` fires, then we resort to the default way of giving feedback.

Feedback checks can be set up and defined as follows.

```
const getFeedback = (exerciseData) => {
	return getFieldInputFeedback(exerciseData, { height: [
		(input, solution, fullSolutionObject, correct, exerciseData) => !correct && solution.multiply(-1).equals(input) && 'Oops ... you mixed up the minus sign!',
		(input, solution, _, correct) => !correct && solution.multiply(2).equals(input) && 'Your answer is twice as large as what it should be.',
	] })
}
```

Note that feedback checks get five parameters.
- `input`: the given input for the parameter.
- `solution`: the solution connected to the parameter.
- `solutionObject`: the full solution objected given by the `getSolution` function, in case other calculated parameters are needed.
- `correct`: the result of `performComparison(exerciseData, 'param')` that determines whether the field is graded as correct.
- `exerciseData`: all exercise data, in case it's needed. (Usually it's not.)

Based on this, the check either returns something falsy, in which case it's ignored, or it returns a message, in which case that message is used as feedback. In this way it's easy to check for common errors.

### Adding other options

Sometimes it is needed to add extra options to the feedback checks. In this case the given options value is also an object. Extra options include:

- `comparison`: a different comparison object/function that overrides what is in the `metaData`. (Not recommended.)
- `feedbackFunction`: a specific feedback function to be called instead of the regular intelligent way of determining feedback.
- `dependency`: an array of field IDs. If any of these input fields changes, then the feedback is recalculated. This is useful if the correctness of a field depends on the value of another field. (For instance, one multiple choice field decides on the positive direction, and the `height` input field then gives the height value. In this case the `height` may suddenly turn from incorrect to correct based on a change in another field.)
- `feedbackChecks`: as mentioned before, the feedbackChecks can also be defined as options.

In this case the `getFieldInputFeedback` call looks as follows.

```
const getFeedback = (exerciseData) => {
	return getFieldInputFeedback(exerciseData, {
		height: {
			feedbackChecks: [
				(input, solution, fullSolutionObject, correct, exerciseData) => !correct && solution.multiply(-1).equals(input) && 'Oops ... you mixed up the minus sign!',
				(input, solution, _, correct) => !correct && solution.multiply(2).equals(input) && 'Your answer is twice as large as what it should be.',
			],
			dependency: ['positiveDirection'],
		},
	})
}
```

Of course it's also possible to use multiple parameters in this call, each with their own options.


## Field input list feedback

Suppose that you need a list of answers `x1, x2, ...` and the order doesn't matter. For instance, you may ask the user to solve `x*(x-2) = 0` and the user might say `x1 = 0, x2 = 2` or he/she might say `x1 = 2, x2 = 0`. Both answers are correct. In this case we have a list comparison.

The comparison is done in the `shared` folder through `performListComparison(exerciseData, ['x1', 'x2'])`. Getting the feedback works similarly. This is done through

```
const getFeedback = (exerciseData) => {
	return getFieldInputListFeedback(exerciseData, ['x1', 'x2'])
}
```

This then automatically gets feedback on the list of parameters.


## Multiple choice feedback

Giving feedback on a `MultipleChoice` input field is usually a lot of work -- what feedback should be given to what answer -- but it's not hard to define that in a script. All you need is the `getMCFeedback` function. The calling is done as follows.

```
const getFeedback = (exerciseData) => {
	return getMCFeedback(exerciseData, { someFieldId: [
		'Nope, answer A is wrong.',
		'Heck no, answer B is ridiculous.',
		'Yes! Answer C is indeed right!',
		'Almost. Answer D was the intended fake.',
	]})
}
```

It is also possible to give an object with further options to the `getMCFeedback` function. A possibly silly example is the following.

```
const getFeedback = (exerciseData) => {
	return getMCFeedback(exerciseData, { someFieldId: {
			text: [
				undefined,
				'Heck no, answer B is ridiculous.',
				undefined,
				'Almost. Answer D was the intended fake.',
			],
			correctText: 'Yes! That's correct!',
			incorrectText: 'This is not the right answer.',
			step: 2,
		}
	})
}
```

All text parameters (`text`, `correctText`, `incorrectText`) can either be a string/React element (when suitable to multiple fields) or an array of them (when specified per field). The script uses the parameters as follows.

- `text`: this is the first attempt at getting any feedback. If something is found, this is used. If not, the following parameters are used.
- `correctText`: this is the feedback used when the chosen MC option is correct.
- `incorrectText`: this is the feedback used when the chosen MC option is incorrect.

Note that the MC input field uses the `solution` parameter to determine which field is actually correct.

An optional extra setting is the `step`. This is only sensible for a `StepExercise`. It tells the field in which exercise step the input field is used. If the user is beyond this step, then the input field also displays the answer that should have been chosen (the correct answer when the user failed) in green as an extra information to the user. Obviously, when the user still has to solve this step, the correct answer is not shown yet.
