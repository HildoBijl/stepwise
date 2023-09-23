import React from 'react'

import { UnitArray, isEmpty as isUnitArrayEmpty } from '../UnitArray'

import { isEmpty, isDenominatorVisible } from './support'

// Unit takes an FI object and shows the corresponding contents as JSX render.
export function Unit({ value, cursor }) {
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
				!isUnitArrayEmpty(value.num) || (cursor?.part === 'num') ?
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
	return <UnitArray {...{ type: 'UnitArray', value: value[part], cursor: cursor?.part === part && cursor.cursor }} />
}
