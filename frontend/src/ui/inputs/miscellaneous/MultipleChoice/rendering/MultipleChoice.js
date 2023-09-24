import React from 'react'

import { processOptions, filterOptions } from 'step-wise/util'

import { useImmutableValue } from 'util/react'

import { Input, defaultInputOptions } from '../../../Input'

import { getEmptySI } from '../support'
import * as validation from '../validation'

import { MultipleChoiceInner, defaultMultipleChoiceInnerOptions } from './MultipleChoiceInner'

export const defaultMultipleChoiceOptions = {
	// General Input field options.
	...defaultInputOptions,
	validate: validation.nonEmpty,

	// Specific Multiple Choice options.
	...defaultMultipleChoiceInnerOptions,
}

export function MultipleChoice(options) {
	options = processOptions(options, defaultMultipleChoiceOptions)

	// Set up the Input field settings.
	const multiple = useImmutableValue(options.multiple) // Ensure that "multiple" does not change.
	const inputOptions = {
		...filterOptions(options, defaultInputOptions),
		allowFocus: false, // Tabbing does not focus MultipleChoice input fields.
		initialSI: getEmptySI(multiple), // Get the SI corresponding to the type of MultipleChoice field.
	}

	// Render the field.
	return <Input {...inputOptions}>
		<MultipleChoiceInner {...filterOptions(options, defaultMultipleChoiceInnerOptions)} />
	</Input>
}
MultipleChoice.validation = validation
