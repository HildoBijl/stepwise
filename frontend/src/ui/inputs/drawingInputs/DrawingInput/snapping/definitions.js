import { useMemo, } from 'react'

import { filterDuplicates } from 'step-wise/util'
import { ensureVector, Line, Span } from 'step-wise/geometry'

import { useConsistentValue } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { useTransformationSettings, applyTransformation } from 'ui/figures'

import { useInputFI } from '../../../'

// useSnappingLines takes a snappers object (which could be unprocessed: it may be an input-dependent function or so) and returns an object of the form { lines: [...], graphicalLines: [...] }.
export function useSnappingLines(snappers) {
	snappers = useInputDependentSnappers(snappers)
	return useSnappingLinesFromProcessedSnappers(snappers)
}

// useInputDependentSnappers takes a set of snappers, which may be an input-dependent function. If so, it gets the input and evaluates said function. It also ensures that the snappers parameter is in fact an array.
function useInputDependentSnappers(rawSnappers) {
	// Get the input from the Form.
	let FI = useInputFI()
	if (typeof rawSnappers !== 'function')
		FI = undefined // We don't need the input then. Prevent it from triggering the memo.

	// Recalculate the snappers upon a change.
	rawSnappers = useConsistentValue(rawSnappers) // Prevent unnecessary updates.
	return useMemo(() => {
		let snappers = rawSnappers
		if (typeof snappers === 'function')
			snappers = snappers(FI)
		if (!Array.isArray(snappers))
			snappers = [snappers]
		return snappers
	}, [rawSnappers, FI])
}

// useSnappingLinesFromProcessedSnappers takes a set of processed snappers and turns them into snapping lines, using the parent Drawing's transformation settings.
function useSnappingLinesFromProcessedSnappers(snappers) {
	const transformation = useTransformationSettings()?.transformation
	return useMemo(() => {
		// If no transformation is known yet, return empty arrays.
		if (!transformation)
			return { snappingLines: [], graphicalSnappingLines: [] }

		// Determine the snapping lines from the given snappers.
		let snappingLines = []
		snappers.forEach(snapper => {
			if (snapper instanceof Line) {
				snappingLines.push(snapper)
			} else if (snapper instanceof Span) {
				snappingLines.push(snapper.line)
			} else {
				const vector = ensureVector(snapper) // Default case.
				snappingLines.push(Line.getHorizontalThrough(vector))
				snappingLines.push(Line.getVerticalThrough(vector))
			}
		})

		// Ensure there are no duplicate snapping lines.
		snappingLines = filterDuplicates(snappingLines, (a, b) => a.equals(b))

		// Transform snapping lines to graphical coordinates.
		const graphicalLines = applyTransformation(snappingLines, transformation)
		return { lines: snappingLines, graphicalLines }
	}, [snappers, transformation])
}
