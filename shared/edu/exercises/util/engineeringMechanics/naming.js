const { mod } = require('../../../../util/numbers')
const { sortByIndices } = require('../../../../util/arrays')
const { Vector } = require('../../../../geometry')
const { Variable } = require('../../../../CAS')

const { loadTypes } = require('./definitions')
const { areLoadsEqual, isLoadAtPoint } = require('./comparison')

/*
 * getLoadNames takes a set of loads and points and comes up with names for the loads, based on the points. Provided are:
 * - loads: and array [{...}] of loads.
 * - points: an object { 'A': new Vector(...), 'C': new Vector(...) } with points and their names as keys.
 * - prenamedLoads: an array of loads that already have a name, and should be named accordingly. Something like [{ load: {...}, variable: 'P_A', point: 'A' }].
 * - comparison: the comparison method that determines if loads are equal. This is what is used to compare the given loads to the prenamed loads.
 * The result of the naming is an object of the form [{ load: {...}, variable: new Variable('F_(Ax)'), point: 'A' }, ...].
 */
function getLoadNames(loads, points, prenamedLoads, comparison) {
	// If there are no loads yet, return nothing.
	if (!loads)
		return []

	// Set up a result array and keep track of which loads have been put in.
	let result = []
	const named = loads.map(_ => false)

	// First assign the prenamed loads. For each, check if they match any of the given loads.
	prenamedLoads.forEach(prenamedLoad => {
		const index = loads.findIndex(load => areLoadsEqual(load, prenamedLoad.load, comparison))
		if (index !== -1 && !named[index]) {
			named[index] = true
			result.push({
				load: loads[index],
				variable: Variable.ensureVariable(prenamedLoad.variable),
				point: prenamedLoad.point || getLoadPoint(prenamedLoad.load, points),
				prenamed: true,
			})
		}
	})

	// Then walk through the points, gathering (so far unnamed) loads connected to them.
	Object.keys(points).forEach(pointName => {
		// Gather loads connected to the given point and preemptively mark them as named.
		const point = points[pointName]
		const connectedLoadIndices = loads.map((load, index) => index).filter(index => !named[index] && isLoadAtPoint(loads[index], point))
		connectedLoadIndices.forEach(index => {
			named[index] = true
		})

		// Filter out forces and moments, and name them.
		const connectedLoads = connectedLoadIndices.map(index => loads[index])
		result = [...result, ...getLoadNamesForPoint(connectedLoads, point, pointName)]
	})

	// Finally walk through all remaining loads. Do not give them a point name to keep them nameless.
	const unconnectedLoads = loads.filter((load, index) => !named[index])
	result = [...result, ...getLoadNamesForPoint(unconnectedLoads)]

	// All loads have been named!
	return result
}
module.exports.getLoadNames = getLoadNames

// getLoadPoint receives a load and an object with points { 'A': new Vector(...), 'C': new Vector(...) } and returns the point which the load is connected to, as Vector. If there is none, it returns undefined.
function getLoadPoint(load, points) {
	return Object.values(points).find(point => isLoadAtPoint(load, point))
}

// getLoadNamesForPoint takes a set of loads that are connected to the given point. It then determines proper names for them and returns these names with additional data as an array.
function getLoadNamesForPoint(loads, point, pointName) {
	return [
		...getForceNamesForPoint(loads.filter(load => load.type === loadTypes.force), point, pointName),
		...getMomentNamesForPoint(loads.filter(load => load.type === loadTypes.moment), point, pointName),
	]
}
module.exports.getLoadNamesForPoint = getLoadNamesForPoint

// getForceNamesForPoint takes a set of forces that are connected to the given point. It then determines proper force names for them and returns them as an array.
function getForceNamesForPoint(forces, point, pointName) {
	// On a single force just name it F_A.
	if (forces.length === 1)
		return [{ load: forces[0], variable: new Variable(pointName ? `F_${pointName}` : `F`), point: point || forces[0].span.start }]

	// On two forces that are horizontal and vertical, use F_{Ax} and F_{Ay}.
	if (forces.length === 2 && pointName) {
		if (forces[0].span.vector.isEqualDirection(Vector.i, true) && forces[1].span.vector.isEqualDirection(Vector.j, true)) {
			return [
				{ load: forces[0], variable: new Variable(`F_${pointName}x`), point: point || forces[0].span.start },
				{ load: forces[1], variable: new Variable(`F_${pointName}y`), point: point || forces[1].span.start },
			]
		} else if (forces[0].span.vector.isEqualDirection(Vector.j, true) && forces[1].span.vector.isEqualDirection(Vector.i, true)) {
			return [
				{ load: forces[1], variable: new Variable(`F_${pointName}x`), point: point || forces[1].span.start },
				{ load: forces[0], variable: new Variable(`F_${pointName}y`), point: point || forces[0].span.start },
			]
		}
	}

	// On multiple forces, sort them by vector argument, and then use F_{A1}, F_{A2}, and so forth. Make sure a vector pointing upwards gets the first number, and clockwise afterwards.
	forces = sortByIndices(forces, forces.map(force => mod(force.span.vector.argument + Math.PI/2, 2*Math.PI)))
	return forces.map((force, index) => ({ load: force, variable: new Variable(pointName ? `F_${pointName}${index + 1}` : `F_${index + 1}`), point: point || force.span.start }))
}
module.exports.getForceNamesForPoint = getForceNamesForPoint

// getMomentNamesForPoint takes a set of moments that are connected to the given point. It then determines proper moment names for them and returns them as an array.
function getMomentNamesForPoint(moments, point, pointName) {
	// On a single moment just name it M_A.
	if (moments.length === 1)
		return [{ load: moments[0], variable: new Variable(pointName ? `M_${pointName}` : `M`), point: point || moments[0].position }]

	// Otherwise sort them, first by whether they're clockwise or counter-clockwise, and then by opening angle.
	const momentsByDirection = [moments.filter(moment => moment.clockwise),
	moments.filter(moment => !moment.clockwise)]
	moments = momentsByDirection.map(momentsList => sortByIndices(momentsList, momentsList.map(moment => mod(moment.opening, 2 * Math.PI)))).flat()
	return moments.map((moment, index) => ({ load: moment, variable: new Variable(pointName ? `M_${pointName}${index + 1}` : `M_${index + 1}`), point: point || moment.position }))
}
module.exports.getMomentNamesForPoint = getMomentNamesForPoint
