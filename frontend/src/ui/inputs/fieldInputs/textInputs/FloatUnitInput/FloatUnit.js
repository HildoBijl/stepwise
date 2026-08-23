import React from 'react'

import { Float, isEmpty as isFloatEmpty } from '../FloatInput'
import { Unit } from '../UnitInput'

import { isEmpty, isUnitVisible, getFloatFI, getUnitFI } from './support'

// FloatUnit takes an FI object and shows the corresponding contents as JSX render.
export function FloatUnit(FI) {
	const { value, cursor } = FI
	const { value: numericValue } = value

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// Show the FloatUnit.
	const showFloatFiller = isFloatEmpty(numericValue) && cursor?.part !== 'value'
	return <>
		<span className="value">
			{
				showFloatFiller ?
					<span className="char filler">?</span> :
					<Float {...getFloatFI(FI)} />
			}
		</span>
		{
			isUnitVisible(value, cursor) ? (
				<>
					<span className="spacer unitSpacer" />
					<span className="unit">
						<Unit {...getUnitFI(FI)} />
					</span>
				</>
			) : null}
	</>
}
