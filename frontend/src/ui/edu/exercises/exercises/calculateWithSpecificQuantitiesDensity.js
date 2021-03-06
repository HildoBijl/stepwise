import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ rho }) {
	return <>
		<Par>Een vliegtuig meet dat de luchtdichtheid op enkele kilometers hoogte <M>{rho}</M> is. Wat is het specifieke volume van de lucht op die hoogte?</Par>
		<InputSpace>
			<Par><FloatUnitInput id="v" prelabel={<M>v =</M>} label="Specifiek volume" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution() {
	const { rho, v } = useCorrect()
	return <Par>De dichtheid is het aantal kilogram lucht per kubieke meter. Het specifiek volume is het aantal kubieke meters lucht per kilogram. Dat is precies het omgekeerde! We vinden het specifiek volume dus via <BM>v = \frac(1)(\rho) = \frac(1){rho.float} = {v}.</BM></Par>
}