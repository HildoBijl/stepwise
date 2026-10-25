import React from 'react'

import { mergeDefaults, pickFromDefaults } from '@step-wise/js-utils'
import { withTranslation } from '@step-wise/i18n'
import { useAssertConstant } from '@step-wise/react-utils'

import { Input, defaultInputOptions } from '../../../Input'

import { getEmptySI } from '../support'
import * as validation from '../validation'

import { MultipleChoiceInner, defaultMultipleChoiceInnerOptions } from './MultipleChoiceInner'

export const defaultMultipleChoiceOptions = {
	// General Input field options.
	...defaultInputOptions,
	validate: validation.nonEmpty,
	clean: FI => ({ type: 'MultipleChoice', value: FI }),
	functionalize: SI => SI.value,

	// Specific Multiple Choice options.
	...defaultMultipleChoiceInnerOptions,
}

function MultipleChoiceBase(options) {
	options = mergeDefaults(options, defaultMultipleChoiceOptions)

	// Set up the Input field settings.
	const multiple = useAssertConstant(options.multiple) // Ensure that "multiple" does not change.
	const inputOptions = {
		...pickFromDefaults(options, defaultInputOptions),
		allowFocus: false, // Tabbing does not focus MultipleChoice input fields.
		initialSI: getEmptySI(multiple), // Get the SI corresponding to the type of MultipleChoice field.
	}

	// Render the field.
	return <Input {...inputOptions}>
		<MultipleChoiceInner {...pickFromDefaults(options, defaultMultipleChoiceInnerOptions)} />
	</Input>
}

export const MultipleChoice = Object.assign(withTranslation(MultipleChoiceBase, {
	tag: 'multiple-choice',
	translatedProps: [{ name: 'choices', itemName: 'choice' }],
}), { validation })
