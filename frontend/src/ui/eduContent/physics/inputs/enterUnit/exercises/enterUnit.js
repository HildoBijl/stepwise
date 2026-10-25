import React from 'react'

import { Unit } from '@step-wise/physics-core'
import { M } from '@step-wise/math-display'
import { Translation } from '@step-wise/i18n'

import { Par, List } from 'ui/components'
import { InputSpace } from 'ui/form'
import { UnitInput } from 'ui/inputs'
import { MonoExercise, getFieldInputFeedback, FeedbackTranslation } from 'ui/eduTools'

export default function Exercise() {
	return <MonoExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ unit }) {
	return <>
		<Par><Translation id="text">Enter the unit <M>{unit}</M> exactly as shown.</Translation></Par>
		<InputSpace>
			<Par><UnitInput id="ans" prelabel={<M>{unit} =</M>} label={<Translation id="label">Enter the unit here</Translation>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ unit }) {
	if (unit.equals(new Unit('dC')))
		return <Par><Translation id={unit.str}>To enter <M>{unit}</M> you use "dC" or "degC" (degrees Celsius).</Translation></Par>
	if (unit.equals(new Unit('Ohm')))
		return <Par><Translation id={unit.str}>To enter <M>Ω</M> you can type "Ohm" or "Omega". Note: this is case-sensitive! Simply typing "ohm" won't work.</Translation></Par>
	if (unit.equals(new Unit('mum')))
		return <Par><Translation id={unit.str}>For the symbol <M>μ</M> you type "mu". So for the unit <M>{unit}</M> you basically enter "mum".</Translation></Par>
	return <Par><Translation id="other">You click on the input field and enter <M>{unit}</M>.<List>
		<List.Item><>For multiplications use the star "*" or the period ".". The space bar also works as short-cut.</></List.Item>
		<List.Item><>For divisions use the slash "/" or the downward arrow.</></List.Item>
		<List.Item><>For powers you can use the power hat "^" but this isn't even needed: directly entering numbers also works.</></List.Item>
	</List></Translation></Par>
}

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		ans: [
			(input, solution, _, correct) => !correct && solution.equals(input, { target: 'standard' }) && <FeedbackTranslation id="reorderedUnit">Technically correct, but you must enter the unit <strong>as shown</strong>, including its order.</FeedbackTranslation>,
			(input, solution, _, correct) => !correct && solution.equals(input, { target: 'base' }) && <FeedbackTranslation id="equivalentUnit">Technically correct, but this is a whole different notation. Enter the unit <strong>as shown</strong>.</FeedbackTranslation>,
		],
	})
}
