import React, { useState, useContext, useEffect, useReducer } from 'react'

import { IOtoFO } from 'step-wise/edu/inputTransformation'
import { emptyFunc } from 'step-wise/util/functions'
import IntegerInput from '../inputs/IntegerInput'
import { useExerciseData } from './ExerciseLoader'
import { useFormData } from './Form'
import Form from './Form'

export default function SubExercise() {
	return <Form><Contents /></Form>
}

function Contents() {
	// Obtain data.
	const { state, progress, history, done, dispatch, startNewExercise } = useExerciseData()
	const { input } = useFormData()

	// Set up button handlers.
	const submit = () => dispatch({ type: 'submit', input })
	const giveUp = () => dispatch({ type: 'giveUp' })

	// Get state.
	const { x } = state

	return <>
		<h3>Problem</h3>
		<p>{x} = <IntegerInput name="ans" /></p>
		{/* <components.Problem state={state} /> */}
		{
			!done ? (
				<p>
					<button type="button" onClick={submit}>Submit</button>
					<button type="button" onClick={giveUp}>Give up</button>
				</p>
			) : (
					<>
						{/* <components.Solution state={state} /> */}
						<h3>Solution</h3>
						<p>The answer is {x}.</p>
						{done ? <p><button type="button" onClick={startNewExercise}>Next problem</button></p> : null}
					</>
				)
		}
	</>
}