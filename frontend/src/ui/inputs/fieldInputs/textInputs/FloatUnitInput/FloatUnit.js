import React from 'react'

import { PrecisionNumber, isEmpty as isPrecisionNumberEmpty } from '../PrecisionNumberInput'
import { Unit } from '../UnitInput'

import { isEmpty, isUnitVisible, getPrecisionNumberFI, getUnitFI } from './support'

// FloatUnit takes an FI object and shows the corresponding contents as JSX render.
export function FloatUnit(FI) {
	const { value, cursor } = FI
	const { value: numericValue } = value

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// Show the FloatUnit.
	const showPrecisionNumberFiller = isPrecisionNumberEmpty(numericValue) && cursor?.part !== 'value'
	return <>
		<span className="value">
			{
				showPrecisionNumberFiller ?
					<span className="char filler">?</span> :
					<PrecisionNumber {...getPrecisionNumberFI(FI)} />
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
