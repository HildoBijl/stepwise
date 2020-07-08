import React from 'react'

import { selectRandomly } from 'step-wise/util/random'
import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from '../components/ExerciseContainer'
import SimpleExercise from '../components/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem() {
	const { state } = useExerciseData()
	const { x } = state
	return <>
		<h3>Problem</h3>
		<p>{x} = <IntegerInput name="ans" /></p>
	</>
}

function Solution() {
	const { state } = useExerciseData()
	const { x } = state
	return <>
		<h3>Solution</h3>
		<p>The answer is {x}.</p>
	</>
}

function getFeedback(state, input, progress, shared) {
	// const correct = shared.checkInput(state, input)
	const correct = progress.solved
	return {
		ans: {
			correct,
			text: correct ? selectRandomly([
				'You got it!',
				'That was impressive!',
				'Amazing, you did it!',
			]) : selectRandomly([
				'You cannot even fill in a simple number?',
				'You failed big time...',
				'Geez ... you suck.',
			])
		}
	}
}