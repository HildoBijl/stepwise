import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import { processOptions, filterOptions } from 'step-wise/util'

import { TextInput, defaultTextInputOptions } from '../TextInput'

import { type, initialValue, isEmpty, FIToKeyboardSettings, keyPressToFI, mouseClickToCursor, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, errorToMessage } from './Unit'
import { UnitInputInner } from './UnitInputInner'
import * as validation from './validation'

const defaultUnitInputOptions = {
	...defaultTextInputOptions,

	// Settings from outside.
	placeholder: <>Eenheid</>,
	validate: validation.nonEmpty,

	// Functionalities.
	type,
	initialValue,
	isEmpty,
	keyboardSettings: FIToKeyboardSettings,
	keyPressToFI,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	clean,
	functionalize,
	errorToMessage,
}

export const style = (theme) => ({
	'&.filler-1': {
		pointerEvents: 'none', // To prevent it being clicked on. When the cursor is already in the numerator, the filler disappears as soon as it's clicked on, which messes up the click processing.
	},
	'& .unitElement': {
		color: theme.palette.info.main,
		'&.valid': {
			'& .prefix': {
				'& .char': {
					color: alpha(theme.palette.info.main, 0.75),
				},
			},
		},
		'&.invalid': {
			'& .prefix, .baseUnit': {
				color: theme.palette.error.main,
			},
		},
	},
	'& .fraction': {
		textAlign: 'center',

		'& .num, .den, .divider': {
			display: 'block',
		},

		'& .num, .den': {
			fontSize: '0.85em',
			height: '50%',
			padding: '0 3px', // Add padding to make the divider line wider horizontally.
			position: 'relative', // Needed for cursor positioning.

			'& .cursorContainer': {
				'& span.cursor': {
					height: '65%',
				},
			},

			'& .power': {
				'& .cursorContainer': {
					'& span.cursor': {
						height: '46%',
					},
				},
			},
		},

		'& .num': {
			'& .char': {
				lineHeight: 1.8,
			},
			'& .cursorContainer': {
				'& span.cursor': {
					top: '25%',
				},
			},
			'& .power': {
				'& .char': {
					lineHeight: 2.0,
				},
				'& .cursorContainer': {
					'& span.cursor': {
						top: '14%',
					},
				},
			},
		},

		'& .den': {
			'& .char': {
				lineHeight: 1.6,
			},
			'& .cursorContainer': {
				'& span.cursor': {
					top: '20%',
				},
			},
			'& .power': {
				'& .char': {
					lineHeight: 1.8,
				},
				'& .cursorContainer': {
					'& span.cursor': {
						top: '11%',
					},
				},
			},
		},

		'& .dividerContainer': {
			height: 0,
			pointerEvents: 'none', // To prevent it being clicked on and messing up cursor positioning.
			position: 'relative',
			width: '100%',

			'& .divider': {
				background: theme.palette.info.main,
				height: '1px',
				width: '100%',
			},
		},
	},
})
const useStyles = makeStyles((theme) => ({
	unitInput: style(theme)
}))

export function UnitInput(options) {
	options = processOptions(options, defaultUnitInputOptions)

	// Set up options for the TextInput field.
	const classes = useStyles()
	const textInputOptions = {
		...filterOptions(options, defaultTextInputOptions),
		className: clsx(options.className, classes.unitInput, 'floatInput'),
	}

	// Render the TextInput.
	return <TextInput {...textInputOptions}>
		<UnitInputInner />
	</TextInput>
}
UnitInput.validation = validation
