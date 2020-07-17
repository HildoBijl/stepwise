import React from 'react'

import { selectRandomly } from 'step-wise/util/random'
import { M, BM } from '../../../util/equations'
import SimpleExercise from '../exerciseTypes/SimpleExercise'
import IntegerInput from '../form/inputs/IntegerInput'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	console.log(x)
	return <>
		<h3>Problem</h3>
		<p>Fill in the number <M>x={x}</M>.</p>
		<div><IntegerInput name="ans" label={<M>x=</M>} /></div>
	</>
}

function Solution({ x }) {
	return <>
		<h3>Solution</h3>
		<p>The answer is {x}.</p>
	</>
}

function getFeedback({ state, input, progress, prevProgress, shared }) {
	// const correct = shared.checkInput(state, input)
	const { x } = state
	const { ans } = input
	const correct = progress.solved
	return {
		ans: {
			correct,
			text: correct ? selectRandomly([
				'You got it!',
				'That was impressive!',
				'Amazing, you did it!',
			]) : (Math.abs(x) === Math.abs(ans)) ? (
				ans > 0 ? 'You missed a minus sign.' : 'Try removing the minus sign.'
			) : selectRandomly([
				'You cannot even fill in a simple number?',
				'You failed big time...',
				'Geez ... you suck.',
			])
		}
	}
}