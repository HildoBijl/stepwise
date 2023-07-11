# FeedbackProvider

The `FeedbackProvider` tracks the (often last submtited) `input` that is given to it by the parent component (often the exercise). When it changes, the provided `getFeedback` function is called and the result is processed and stored. This is then made available to the input fields inside the `FeedbackProvider` through various hooks.


## The `getFeedback` function

The `getFeedback` function must be provided to the `FeedbackProvider`. It is called through

```
getFeedback({ input: {...}, previousFeedback: {...}, previousInput: {...}, [...other data...] })
```

The parameters here are as follows.

- `input`: the full input object `{ field1: ..., field2: ... }` that needs to be given feedback to. All parameters are in FO format.
- `previousFeedback`: the previous (processed) feedback object, if it exists. Otherwise it's the empty object `{}`.
- `previousInput`: the input object that resulted in the previous feedback. It's also in FO.
- other data: the parent component (often the exercise) can provide the `FeedbackContainer` with extra data to pass to the `getFeedback` function. Often this includes `exerciseData` and possibly a `solution` object, but it depends on the exercise what exactly is included.

The result of the `getFeedback` function should be an object with feedback for various parameters. It could be of the form

```
{
	field1: true,
	field2: { correct: false, text: 'This is incorrect.' },
	field3: { type: 'success', text: 'This seems right!' },
	main: { type: 'info', text: <>You can display an equation like <M>e = mc^2</M> too.</> },
}
```

This feedback is then processed. Per field the following is considered.

- The `type` (success, error, warning, info, normal) is used to determine the `color` and `Icon`. This is done automatically.
- If the parameter is `boolean`, or if a `correct` parameter (also `boolean`) is set, then this is used to determine the `type`: either `success` or `error`.
- The `text` parameter is used to display the feedback. It can be a string or a React component.
- If desired, the `color` and `Icon` properties can also be manually overwritten.

The result is a feedback object of the following form.

```
	field1: {
		type: 'success',
		text: 'That is completely correct!',
		Icon: SuccessIcon,
		color: '#0a6f3c',
	},
	field2: ...,
	...
```


## Using Feedback inside input fields

Once feedback is present, it can be used by input fields. There are various hooks available for this. The most important one is the `useFieldFeedback` hook. It is used through

```
const { feedback, feedbackInput } = useFieldFeedback(fieldId)
```

The `feedback` is the processed feedback for the respective field. (Or `undefined` if no feedback is available yet.) It's then the input field's responsibility to properly display it. The `feedbackInput` is the input (in SI format) that is used to generate that feedback. If desired, the input field can compare this input value to what is currently in the form, to see if the feedback should actually still be shown.
