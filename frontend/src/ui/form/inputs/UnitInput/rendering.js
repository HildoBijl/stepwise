import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import FieldInput from '../support/FieldInput'

import UnitArray, { isEmpty as isUnitArrayEmpty } from './UnitArray'
import { emptySI, isEmpty, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, isDenominatorVisible, clean, functionalize, mouseClickToCursor, FIToKeyboardSettings, keyPressToFI, errorToMessage } from './support'
import { nonEmpty } from './validation'

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Eenheid',
	validate: nonEmpty,
	initialSI: emptySI,
	isEmpty: FI => isEmpty(FI.value),
	JSXObject: Unit,
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

const style = (theme) => ({
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
export { style }

export default function UnitInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		className: clsx(props.className, classes.unitInput, 'unitInput'),
	}

	return <FieldInput {...mergedProps} />
}

// Unit takes an FI object and shows the corresponding contents as JSX render.
export function Unit({ type, value, cursor }) {
	// Check input.
	if (type !== 'Unit')
		throw new Error(`Invalid type: tried to get the contents of a Unit field but got an FI with type "${type}".`)

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// If there is no denominator, only show the numerator without a fraction.
	if (!isDenominatorVisible(value, cursor)) {
		return (
			<span className="num">
				<Part {...{ part: 'num', value, cursor }} />
			</span>
		)
	}

	// If there is a denominator, show a fraction.
	return <span className="fraction">
		<span className="num">
			{
				!isUnitArrayEmpty(value.num) || (cursor && cursor.part === 'num') ?
					<Part {...{ part: 'num', value, cursor }} /> :
					<span className="char filler filler-1">1</span>
			}
		</span>
		<span className="dividerContainer"><span className="divider" /></span>
		<span className="den">
			<Part {...{ part: 'den', value, cursor }} />
		</span>
	</span>
}

function Part({ part, value, cursor }) {
	return <UnitArray {...{ type: 'UnitArray', value: value[part], cursor: cursor && cursor.part === part && cursor.cursor }} />
}
