import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { Translation } from 'i18n'
import { Par, List, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { UnitInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ unit }) {
	return <>
		<Par><Translation entry="text">Enter the unit <M>{unit}</M> exactly as shown.</Translation></Par>
		<InputSpace>
			<Par><UnitInput id="ans" prelabel={<M>{unit} =</M>} label={<Translation entry="label">Enter the unit here</Translation>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ unit }) {
	if (unit.equals(new Unit('dC')))
		return <Par><Translation entry={unit.str}>To enter <M>{unit}</M> you use "dC" or "degC" (degrees Celsius).</Translation></Par>
	if (unit.equals(new Unit('Ohm')))
		return <Par><Translation entry={unit.str}>To enter <M>Ω</M> you can type "Ohm" or "Omega". Note: this is case-sensitive! Simply typing "ohm" won't work.</Translation></Par>
	if (unit.equals(new Unit('mum')))
		return <Par><Translation entry={unit.str}>For the symbol <M>μ</M> you type "mu". So for the unit <M>{unit}</M> you basically enter "mum".</Translation></Par>
	return <Par><Translation entry="other">You click on the input field and enter <M>{unit}</M>.<List items={[
		<>For multiplications use the star "*" or the period ".". The space bar also works as short-cut.</>,
		<>For divisions use the slash "/" or the downward arrow.</>,
		<>For powers you can use the power hat "^" but this isn't even needed: directly entering numbers also works.</>,
	]} /></Translation></Par>
}

function getFeedback(exerciseData) {
	const { translate } = exerciseData
	return getFieldInputFeedback(exerciseData, {
		ans: [
			(input, solution, _, correct) => !correct && solution.equals(input, { type: Unit.equalityTypes.sameUnits }) && translate(<>Technically correct, but you must enter the unit <strong>as shown</strong>, including its order.</>, 'reorderedUnit'),
			(input, solution, _, correct) => !correct && solution.equals(input, { type: Unit.equalityTypes.free }) && translate(<>Technically correct, but this is a whole different notation. Enter the unit <strong>as shown</strong>.</>, 'equivalentUnit'),
		],
	})
}
