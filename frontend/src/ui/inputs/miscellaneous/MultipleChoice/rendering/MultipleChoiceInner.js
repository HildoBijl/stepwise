import React from 'react'
import { Box, Radio, Checkbox } from '@mui/material'

import { processOptions, resolveFunctions } from 'step-wise/util'

import { FeedbackBlock } from 'ui/components'

import { useInput, useReadOnly, useFeedbackResult } from '../../../Input'

import { useStableMapping, useSelectionHandlers } from './handlers'
import { Option } from './Option'

export const defaultMultipleChoiceInnerOptions = {
	choices: [],
	multiple: false,
	mapping: undefined, // Ideally, we provide the MultipleChoice with a mapping setting, given by the getMultipleChoiceMapping suppor function.
	pick: undefined, // If no mapping is present, we can also generate one on the fly using pick, include and randomOrder.
	include: [],
	randomOrder: false,
	sx: {},
}

export function MultipleChoiceInner(options) {
	let { choices, multiple, mapping, pick, include, randomOrder, sx } = processOptions(options, defaultMultipleChoiceInnerOptions)

	// Extract data from the various parents.
	const [selection, setSelection] = useInput()
	const readOnly = useReadOnly()
	const feedbackResult = useFeedbackResult()

	// Apply the various handlers.
	const backupMapping = useStableMapping(choices.length, pick, include, randomOrder)
	mapping = mapping || backupMapping
	const { isChecked, activateItem, toggleItem } = useSelectionHandlers(selection, setSelection, multiple, readOnly)

	// Set up output.
	const Element = multiple ? Checkbox : Radio
	if (!mapping)
		return null
	return <>
		<Box component="ul" sx={theme => ({
			listStyleType: 'none',
			margin: '2px 3px 4px 3px', // To ensure that the box shadow is visible.
			padding: 0,
			...resolveFunctions(sx, theme),
		})}>
			{mapping.map(index => <Option
				key={index}
				checked={isChecked(index)}
				activate={() => activateItem(index)}
				deactivate={() => activateItem(index)}
				toggle={() => toggleItem(index)}
				Element={Element}
				feedback={feedbackResult?.subfields && feedbackResult.subfields[index]}
				readOnly={readOnly}>
				{choices[index]}
			</Option>)}
		</Box>
		{feedbackResult?.text ? <FeedbackBlock {...feedbackResult} /> : null}
	</>
}
