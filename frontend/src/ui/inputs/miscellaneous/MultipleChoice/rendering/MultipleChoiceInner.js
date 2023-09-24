import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import Checkbox from '@material-ui/core/Checkbox'
import clsx from 'clsx'

import { processOptions } from 'step-wise/util'

import { notSelectable } from 'ui/theme'
import { FeedbackBlock } from 'ui/components'

import { useInput, useReadOnly, useFeedbackToDisplay } from '../../../Input'

import { useStableMapping, useSelectionHandlers } from './handlers'
import { Option } from './Option'

const useStyles = makeStyles((theme) => ({
	multipleChoice: {
		listStyleType: 'none',
		margin: '2px 3px 4px 3px', // To ensure that the box shadow is visible.
		padding: 0,

		'& .option': {
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

		'& .feedback': {
			fontSize: '0.75em',
			letterSpacing: '0.03em',
			lineHeight: 1.2,
			padding: '0.3em 1.2em 0',
			transition: `color ${theme.transitions.duration.standard}ms`,
		},
	}
}))

export const defaultMultipleChoiceInnerOptions = {
	choices: [],
	multiple: false,
	pick: undefined,
	include: [],
	randomOrder: false,
}

export function MultipleChoiceInner(options) {
	const { choices, multiple, pick, include, randomOrder } = processOptions(options, defaultMultipleChoiceInnerOptions)

	// Extract data from the various parents.
	const [selection, setSelection] = useInput()
	const readOnly = useReadOnly()
	const feedbackResult = useFeedbackToDisplay()

	// Apply the various handlers.
	const mapping = useStableMapping(choices.length, pick, include, randomOrder)
	const { isChecked, activateItem, toggleItem } = useSelectionHandlers(selection, setSelection, multiple, readOnly)

	// Set up output.
	const classes = useStyles()
	const Element = multiple ? Checkbox : Radio
	if (!mapping)
		return null
	return <>
		<ul className={clsx(classes.multipleChoice, readOnly ? 'disabled' : 'enabled')}>
			{mapping.map(index => <Option
				key={index}
				checked={isChecked(index)}
				activate={() => activateItem(index)}
				deactivate={() => activateItem(index)}
				toggle={() => toggleItem(index)}
				Element={Element}
				feedback={feedbackResult?.subfields && feedbackResult.subfields[index]}
				readOnly={readOnly}
			>
				{choices[index]}
			</Option>)}
		</ul>
		{feedbackResult?.text ? <FeedbackBlock {...feedbackResult} /> : null}
	</>
}
