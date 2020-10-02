import React, { useState, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import Checkbox from '@material-ui/core/Checkbox'
import { fade } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import { numberArray, shuffle, getRandomSubset } from 'step-wise/util/arrays'
import { noop } from 'step-wise/util/functions'
import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

import { notSelectable } from 'ui/theme'
import FeedbackBlock from 'ui/components/FeedbackBlock'

import { useFormParameter } from '../Form'
import { useStatus } from '../Status'
import { useFieldFeedback } from '../FeedbackProvider'

// Set up style.
const style = (theme) => ({
	listStyleType: 'none',
	margin: 0,
	padding: 0,

	'& li': {
		'&.option': {
			alignItems: 'center',
			borderRadius: '0.5rem',
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'flex-start',
			marginTop: '0.6rem',
			padding: '0.4rem',
			transition: `background ${theme.transitions.duration.standard}ms`,
			...notSelectable,

			'&:first-child': {
				marginTop: 0,
			},

			'& .checkbox': {
				flex: '0 0 auto',
				transition: `color ${theme.transitions.duration.standard}ms`,
			},
			'& .contents': {
				flex: '1 1 auto',
				margin: '0.5rem',
				transition: `color ${theme.transitions.duration.standard}ms`,
				...notSelectable,
			},
			'& .icon': {
				flex: '0 0 auto',
				margin: '0.4rem 0.6rem',
				transition: `color ${theme.transitions.duration.standard}ms`,
			}
		},

		'&.feedback': {
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 1.2em 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		},
	},

	'&.enabled': {
		'& li': {
			'&.option': {
				cursor: 'pointer',
			},
		},
	},
	'&.disabled': {
		'& li': {
			'&.option': {

			},
		},
	},
})
const useStyles = makeStyles((theme) => ({
	multipleChoice: style(theme)
}))
export { style }

const useOptionStyle = makeStyles((theme) => ({
	option: {
		background: ({ feedbackType, feedbackColor }) => !feedbackType || feedbackType === 'normal' ? fade(theme.palette.info.main, 0.1) : fade(feedbackColor, 0.1),
		color: ({ feedbackColor }) => feedbackColor || 'inherit',

		'&.checked': {
			background: ({ feedbackType, feedbackColor }) => !feedbackType || feedbackType === 'normal' ? fade(theme.palette.info.main, 0.2) : fade(feedbackColor, 0.2),
		},

		'& .checkbox': {
			color: ({ feedbackColor }) => feedbackColor || theme.palette.info.main,
		},
	},
	feedback: {
		color: ({ feedbackColor }) => feedbackColor || 'inherit',
	},
}))

/* This is the MultipleChoice component, used for making multiple-choice questions. It has a variety of properties to be set.
 * choices (default empty array): 
 * id (obligatory): a string indicating what Form id to store the data under. This data always takes the form of an array with the indices of the chosen options. For instance, [0, 3] if the first and fourth option are selected.
 * validate (default nonEmpty): a validation function. Default is that at least one option should be chosen.
 * multiple (default false): are multiple choices allowed? If set to true, checkboxes are used instead of radio buttons.
 * readOnly (default undefined): can the value still be changed? If left undefined, the exercise status is checked and only when the exercise is not done can the value be changed. If this option is defined, it overwrites this.
 * pick (default undefined): choose a subset of the choices given. If there are six choices and pick is set to four, then only four of the six choices are shown. If left undefined, all choices are included.
 * include (default []): only used when pick is defined. The given options are then definitely included in the pick. If you set include to [0,3], then choices 0 and 3 are definitely picked, along with a few other random ones. This is useful to make sure you include the correct answer. If only a single option has to be included, no array is needed: this is automatically fixed.
 * randomOrder (default false): should we show the choices in a random order? Behind the scenes the original order is still used: this only related to how it is shown to the user.
 */
export default function MultipleChoice({ id, choices = [], validate = nonEmpty, multiple = false, readOnly, pick, include, randomOrder = false }) {
	const [input, setInput] = useFormParameter(id, [])
	const { feedback, feedbackInput } = useFieldFeedback({ fieldId: id, subFields: numberArray(0, choices.length - 1), validate })
	const { done } = useStatus()
	readOnly = (readOnly === undefined ? done : readOnly)
	const Element = multiple ? Checkbox : Radio
	const classes = useStyles()

	// Set up a function that can give us a mapping.
	const numChoices = choices.length
	const getMapping = useCallback(() => {
		let newMapping
		if (pick === undefined) {
			newMapping = numberArray(0, numChoices - 1) // Show all choices.
		} else {
			include = (include === undefined ? [] : include) // Use [] as a default value.
			include = (Array.isArray(include) ? include : [include]) // Ensure it's an array.
			const nonIncluded = numberArray(0, numChoices - 1).filter(index => !include.includes(index))
			const numExtra = Math.max(pick - include.length, 0)
			newMapping = [...include, ...getRandomSubset(nonIncluded, numExtra)]
		}
		return randomOrder ? shuffle(newMapping) : newMapping.sort()
	}, [numChoices, pick, include, randomOrder])

	// On updates, update the mapping. (Note: in most cases this won't be necessary.)
	const [mapping, setMapping] = useState(getMapping())
	useEffect(() => setMapping(getMapping()), [getMapping, setMapping])

	// Set up handlers to change selections.
	const isCheckedFromInput = (index, input) => input.includes(index)
	const isChecked = (index) => isCheckedFromInput(index, input)
	const activateItem = readOnly ? noop : (multiple ?
		((index) => isChecked(index) ? undefined : setInput([...input, index])) :
		((index) => isChecked(index) ? undefined : setInput([index]))
	)
	const deactivateItem = readOnly ? noop : (multiple ?
		((index) => isChecked(index) ? setInput(input.filter(item => item !== index)) : undefined) :
		((index) => isChecked(index) ? setInput([]) : undefined)
	)
	const toggleItem = (index) => (isChecked(index) ? deactivateItem(index) : activateItem(index))

	// Determine if feedback is shown: only if there is feedback and if the feedbackInput equals the current input.
	const isFeedback = feedback !== undefined && !!feedback.text
	const inputEqualToFeedbackInput = feedbackInput && input.length === feedbackInput.length && input.every(item => feedbackInput.includes(item))
	const showFeedback = isFeedback && inputEqualToFeedbackInput

	// Set up output.
	if (!mapping)
		return null
	return <>
		<ul className={clsx(classes.multipleChoice, readOnly ? 'disabled' : 'enabled')}>
			{mapping ? mapping.map(index => <Choice key={index} checked={isChecked(index)} activate={() => activateItem(index)} deactivate={() => activateItem(index)} toggle={() => toggleItem(index)} Element={Element} feedback={feedback && feedback[index]} feedbackInput={feedbackInput && isCheckedFromInput(index, feedbackInput)} readOnly={readOnly}>{choices[index]}</Choice>
			) : null}
		</ul>
		{showFeedback ? <FeedbackBlock {...feedback} /> : null}
	</>
}

// A choice is a single item from the list.
function Choice({ checked, activate, deactivate, toggle, Element, feedback, feedbackInput, readOnly, children }) {
	const { type: feedbackType, text: feedbackText, Icon, color: feedbackColor } = feedback || {}
	const classes = useOptionStyle({ feedbackType, feedbackColor })
	const handleChange = (evt, check) => check ? activate() : deactivate()

	return <>
		<li onClick={toggle} className={clsx('option', checked ? 'checked' : 'unchecked', classes.option)}>
			<Element className="checkbox" color="default" checked={checked} onChange={handleChange} disabled={readOnly} />
			<div className="contents">{children}</div>
			{Icon ? <Icon className="icon" /> : null}
		</li>
		{feedbackText ? <li className={clsx('feedback', classes.feedback)}>{feedbackText}</li> : null}
	</>
}

// These are validation functions.
export function nonEmpty(input) {
	if (input.length === 0)
		return 'Je hebt nog niets geselecteerd.'
}

export function useMultipleChoiceGetFeedback(id, multiple = false) {
	return (exerciseData) => {
		const { input, progress } = exerciseData
		const selection = input[id]

		if (multiple)
			return { main: !!progress.solved }
		return { [id]: { [selection[0]]: { correct: !!progress.solved, text: progress.solved ? selectRandomCorrect() : selectRandomIncorrect() } } }
	}
}