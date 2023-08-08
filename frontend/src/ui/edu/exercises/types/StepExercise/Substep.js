

import React from 'react'

import { ensureInt } from 'step-wise/util'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import FormPart, { useFormPartSettings } from 'ui/form/FormPart'

import { useExerciseData } from '../../ExerciseContainer'

// Substep is used to update the "done" status when a substep is done. This then informs the field that this part of the exercise is done, so the field cannot be edited anymore.
export default function Substep({ ss, children }) {
	// Gather data.
	let settings = useFormPartSettings()
	const { progress } = useExerciseData()

	// Check input.
	ss = ensureInt(ss)

	// If the step is not read-only yet, check if the substep has to be read-only. The same applies for showing hints.
	if (!settings.readOnly) {
		const step = getStep(progress)
		const stepProgress = progress[step]
		if (stepProgress[ss])
			settings = { ...settings, readOnly: true, showHints: false }
	}

	// Set up a new status.
	return <FormPart {...settings}>{children}</FormPart>
}
