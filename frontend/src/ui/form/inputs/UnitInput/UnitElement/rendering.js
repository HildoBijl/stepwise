// UnitElement represents a single unit element like "km^3", but not a combined one like "N * m" or "m / s". It is not an input field but its functionality is used by other input fields.

import React from 'react'
import clsx from 'clsx'

import { CharString } from '../../support/FieldInput'

import { isValid } from './support'

// UnitElement takes an FI object and shows the corresponding contents as JSX render.
export default function UnitElement({ type, value, cursor }) {
	// Check input.
	if (type !== 'UnitElement')
		throw new Error(`Invalid type: tried to get the contents of a UnitElement field but got an FI with type "${type}".`)

	// Set up the visuals in the right way.
	const useFiller = (value.prefix === '' && value.unit === '' && (!cursor || cursor.part !== 'text'))
	const valid = isValid(value)
	return (
		<span className={clsx('unitElement', { valid, invalid: !valid })}>
			<span className="prefix">
				<CharString str={value.prefix} cursor={cursor && cursor.part === 'text' && cursor.cursor <= value.prefix.length && cursor.cursor} />
			</span>
			<span className="baseUnit">
				{useFiller ?
					<span className={clsx('char', 'filler', 'filler-qm')} key='filler'>?</span> :
					<CharString str={value.unit} cursor={cursor && cursor.part === 'text' && cursor.cursor > value.prefix.length && cursor.cursor <= value.prefix.length + value.unit.length && cursor.cursor - value.prefix.length} />
				}
			</span>
			<span className="power">
				<CharString str={value.power} cursor={cursor && cursor.part === 'power' && cursor.cursor} />
			</span>
		</span>
	)
}
