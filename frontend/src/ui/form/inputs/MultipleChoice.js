import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import Checkbox from '@material-ui/core/Checkbox'
import { fade, lighten, darken } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import { numberArray } from 'step-wise/util/arrays'
import { filterProperties } from 'step-wise/util/objects'
import { noop } from 'step-wise/util/functions'
import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

import { getIcon, notSelectable } from '../../theme'
import { useFormParameter } from '../Form'
import { useStatus } from '../Status'
import { useParameterFeedback, useFieldFeedback } from '../FeedbackProvider'
import FeedbackBlock from '../../edu/exercises/util/FeedbackBlock'

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

// Set up contents.
export default function MultipleChoice({ id, multiple = false, validate = nonEmpty, choices, readOnly }) {
	const [input, setInput] = useFormParameter(id, [])
	const { feedback, feedbackInput } = useFieldFeedback({ fieldId: id, subFields: numberArray(0, choices.length - 1), validate })
	const { done } = useStatus()
	readOnly = (readOnly === undefined ? done : readOnly)
	const Element = multiple ? Checkbox : Radio
	const classes = useStyles()

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

	// Show feedback if there is feedback on input and if the feedback input equals the current input.
	const isFeedback = feedback !== undefined && !!feedback.text
	const inputEqualToFeedbackInput = feedbackInput && input.length === feedbackInput.length && input.every(item => feedbackInput.includes(item))
	const showFeedback = isFeedback && inputEqualToFeedbackInput

	// Set up output.
	return <>
		<ul className={clsx(classes.multipleChoice, readOnly ? 'disabled' : 'enabled')}>
			{choices.map((option, index) => {
				return <Choice key={index} checked={isChecked(index)} activate={() => activateItem(index)} deactivate={() => activateItem(index)} toggle={() => toggleItem(index)} Element={Element} feedback={feedback && feedback[index]} feedbackInput={feedbackInput && isCheckedFromInput(index, feedbackInput)} readOnly={readOnly}>{option}</Choice>
			})}
		</ul>
		{showFeedback ? <FeedbackBlock {...feedback} /> : null}
	</>
}

// A choice is a single item from the list.
function Choice({ checked, activate, deactivate, toggle, Element, feedback, feedbackInput, readOnly, children }) {
	const { type: feedbackType, text: feedbackText, Icon, color: feedbackColor } = feedback || {}
	const classes = useOptionStyle({ feedbackType, feedbackColor })
	const handleChange = (evt, check) => check ? activate() : deactivate()

	// ToDo: display icon properly.
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