// UnitElement represents a single unit element like "km^3", but not a combined one like "N * m" or "m / s". It is not an input field but its functionality is used by other input fields.

import React from 'react'
import clsx from 'clsx'

import { CharString } from '../../TextInput'

import { isValid } from './support'

export function UnitElement({ value, cursor }) {
	// Determine important parameters.
	const useFiller = (value.prefix === '' && value.unit === '' && (!cursor || cursor.part !== 'text'))
	const valid = isValid(value)

	// Render the output.
	return (
		<span className={clsx('unitElement', { valid, invalid: !valid })}>
			<span className="prefix">
				<CharString str={value.prefix} cursor={cursor?.part === 'text' && cursor.cursor <= value.prefix.length ? cursor.cursor : undefined} />
			</span>
			<span className="baseUnit">
				{useFiller ?
					<span className={clsx('char', 'filler', 'filler-qm')} key='filler'>?</span> :
					<CharString str={value.unit} cursor={cursor?.part === 'text' && cursor.cursor > value.prefix.length && cursor.cursor <= value.prefix.length + value.unit.length ? cursor.cursor - value.prefix.length : undefined} />
				}
			</span>
			<span className="power">
				<CharString str={value.power} cursor={cursor?.part === 'power' ? cursor.cursor : undefined} />
			</span>
		</span>
	)
}
