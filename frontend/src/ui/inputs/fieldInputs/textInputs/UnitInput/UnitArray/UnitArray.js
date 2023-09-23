// UnitArray represents a multiplication of unit elements like "km^3 * s^2 * N", but not a division like "m / s". It is not an input field but its functionality is used by other input fields.

import React, { Fragment } from 'react'

import { UnitElement } from '../UnitElement'

import { isEmpty } from './support'

export function UnitArray({ value, cursor }) {
	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// Iterate over all the unit elements, putting times-signs in-between them.
	return value.map((unitElement, index) => (
		<Fragment key={index}>
			{index === 0 ? null : <span className="char times">⋅</span>}
			<UnitElement {...{ type: 'UnitElement', value: unitElement, cursor: cursor?.part === index ? cursor.cursor : undefined }} />
		</Fragment>
	))
}
