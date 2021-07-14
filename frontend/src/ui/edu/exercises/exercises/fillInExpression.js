import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

// import { useExerciseData, useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ index }) {
	// const { shared: { expressions } } = useExerciseData()
	// const expression = expressions[index]
	return <>
		<Par>Voer een uitdrukking in die je voor je eigen cursus zou kunnen gebruiken. (Klik niet op "Controleer" want die functionaliteit is nog niet gemaakt.)</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>x=</M>} label="Vul hier de uitdrukking in" size="s" />
				{/* <ExpressionInput id="y" prelabel={<M>y=</M>} label="Vul hier de uitdrukking in" size="s" /> */}
			</Par>
		</InputSpace>
	</>
}

function Solution({ index }) {
	// const correct = useCorrect()
	return <Par>Hier komt dan het antwoord.</Par>
	// return <Par>Je typt letterlijk <M>{correct}</M> in het invoerveld.</Par>
}

function getFeedback({ state: { constant }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	// ToDo:
	return { ans: { correct, text: 'Er is iets mis. De feedback functie moet echter nog geschreven worden. ' } }
}