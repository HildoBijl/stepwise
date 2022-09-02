// sumOfForces gives a latex string to show the notation that forces will be added up in a given direction.
export function sumOfForces(vertical = true, positiveDirection = true, rotateCW = false) {
	// When there is a rotation, display the rotated arrow.
	if (rotateCW) {
		if (vertical)
			return `\\!^+ \\!\\!\\!\\!\\! ${positiveDirection ? `\\nearrow` : `\\swarrow`} \\! \\Sigma F = 0 \\! : \\,\\,\\,`
		return `(${positiveDirection ? `\\searrow` : `\\nwarrow`}\\!\\!\\!)^+ \\Sigma F = 0 \\! : \\,\\,\\,`
	}

	// When there is no rotation, display in the usual way.
	if (vertical)
		return `(\\scriptsize +) \\!\\! ${positiveDirection ? `\\uparrow` : `\\downarrow`} \\! \\Sigma F_y = 0 \\! : \\,\\,\\,`
	return `\\overset(+)(${positiveDirection ? `\\rightarrow` : `\\leftarrow`}) \\!\\! \\Sigma F_x = 0 \\! : \\,\\,\\,`
}

// sumOfForces gives a latex string to show the notation that moments will be added up around a given point in a given direction.
export function sumOfMoments(point, positiveDirection = true) {
	if (point === undefined)
		throw new Error(`Missing moment point: a point to take moments around is required. Use an empty string if this is not desired.`)
	return `${positiveDirection ? `\\circlearrowleft` : `\\circlearrowright`} \\!\\! ^+ \\Sigma M_(${point}) = 0 \\! : \\,\\,\\,`
}