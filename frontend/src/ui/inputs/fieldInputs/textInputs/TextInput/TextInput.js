import React from 'react'

import { processOptions, filterOptions, resolveFunctions } from 'step-wise/util'

import { FieldInput, defaultFieldInputOptions } from '../../FieldInput'

export const defaultTextInputOptions = {
	...defaultFieldInputOptions,
	contentsStyle: theme => ({
		...resolveFunctions(defaultFieldInputOptions.contentsStyle, theme),

		display: 'inline-block',
		fontFamily: 'KaTeX_Main, Times New Roman,serif',
		fontSize: '1.1em',
		fontStyle: 'normal',
		height: '100%',

		'& span': {
			display: 'inline-block',
			// height: '100%',
			lineHeight: 0,
			margin: 0,
			padding: 0,
			verticalAlign: 'top',
		},

		'& .char': {
			display: 'inline-block',
			height: '100%',
			lineHeight: 2.85,
			'&.times': { padding: '0 0.15em' },
		},

		'& .power': {
			fontSize: '0.7em',
			'& .char': { lineHeight: 3.05 },
			'& span.cursor': { height: '35%', top: '20%' },
		},

		'& .filler': { color: theme.palette.text.disabled, opacity: 0.3 },
	}),
}

export function TextInput(options) {
	options = processOptions(options, defaultTextInputOptions)
	return <FieldInput {...filterOptions(options, defaultFieldInputOptions)}>
		{options.children}
	</FieldInput>
}
TextInput.translatableProps = FieldInput.translatableProps
