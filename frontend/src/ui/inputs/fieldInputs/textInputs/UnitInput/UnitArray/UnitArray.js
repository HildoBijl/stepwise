// UnitArray represents a multiplication of unit factors like "km^3 * s^2 * N", but not a division like "m / s". It is not an input field but its functionality is used by other input fields.

import React, { Fragment } from 'react'

import { UnitFactor } from '../UnitFactor'

import { isEmpty } from './support'

export function UnitArray({ value, cursor }) {
	// Check if anything should be shown.
	if (isEmpty(value)) {
		if (!cursor)
			return null
		return <UnitFactor {...{ type: 'UnitFactor', value: { prefix: '', unit: '', power: '' }, cursor: cursor.cursor }} />
	}

	// Iterate over all the unit factors, putting times-signs in-between them.
	return value.map((unitFactor, index) => (
		<Fragment key={index}>
			{index === 0 ? null : <span className="char times">⋅</span>}
			<UnitFactor {...{ type: 'UnitFactor', value: unitFactor, cursor: cursor?.part === index ? cursor.cursor : undefined }} />
		</Fragment>
	))
}
