

import React from 'react'

import { ensureInt } from 'step-wise/util/numbers'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import Status, { useStatus } from 'ui/form/Status'

import { useExerciseData } from '../../ExerciseContainer'

// Substep is used to update the "done" status when a substep is done. This then informs the field that this part of the exercise is done, so the field cannot be edited anymore.
export default function Substep({ ss, children }) {
	// Gather data.
	let status = useStatus()
	const { progress } = useExerciseData()

	// Check input.
	ss = ensureInt(ss)

	// If the step is not done yet, check if the substep is done.
	if (!status.done) {
		const step = getStep(progress)
		const stepProgress = progress[step]
		if (stepProgress[ss])
			status = { ...status, done: true }
	}

	// Set up a new status.
	return <Status {...status}>{children}</Status>
}