import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { FieldInput, defaultFieldInputOptions, fieldInputFunctions } from '../../FieldInput'

export const defaultTextInputOptions = defaultFieldInputOptions

export const textInputFunctions = fieldInputFunctions

const useStyles = makeStyles((theme) => ({
	textInputContents: {
		display: 'inline-block',
		fontFamily: 'KaTeX_Main, Times New Roman,serif',
		fontSize: '1.1em',
		fontStyle: 'normal',
		height: '100%',

		'& span': {
			display: 'inline-block',
			height: '100%',
			lineHeight: 0,
			margin: 0,
			padding: 0,
			verticalAlign: 'top',
		},

		'& .char': {
			display: 'inline-block',
			height: '100%',
			lineHeight: 2.85,

			'&.times': {
				padding: '0 0.15em',
			},
		},

		'& .power': {
			fontSize: '0.7em',

			'& .char': {
				lineHeight: 3.05,
			},
			'& span.cursor': {
				height: '35%',
				top: '20%',
			},
		},

		'& .filler': {
			color: theme.palette.text.hint,
		},
	},
}))

export function TextInput(options) {
	options = processOptions(options, defaultTextInputOptions)
	const classes = useStyles()

	// Determine the options to pass to the field input.
	const fieldInputOptions = {
		...filterOptions(options, defaultFieldInputOptions),
		contentsClassName: clsx(classes.textInputContents, options.concentsClassName),
	}

	// Render the field.
	return <FieldInput {...fieldInputOptions}>
		{options.children}
	</FieldInput>
}
