import { ensureString, equalAngles, normalizeAngle } from '@step-wise/utils'

import { type Load, type LoadComparisonOptionsInput, equalLoads, isForce, isLoadAtPoint, isMoment } from '../loads'

import type { LoadName, NamedLoad, NamedPointLike } from './types'
import { createLoadName, createNamedPoint } from './creation'

export type LoadNamingOptions = {
	forceSymbol?: string
	momentSymbol?: string
	predefinedComparison?: LoadComparisonOptionsInput
}

export function deriveLoadNames(loads: readonly Load[], points: readonly NamedPointLike[] = [], predefinedLoads: readonly NamedLoad[] = [], options: LoadNamingOptions = {}): NamedLoad[] {
	// Process the input.
	const forceSymbol = ensureString(options.forceSymbol ?? 'F', true)
	const momentSymbol = ensureString(options.momentSymbol ?? 'M', true)
	const namedPoints = points.map(createNamedPoint)

	// Set up iteration containers.
	const result: NamedLoad[] = []
	const named = loads.map(() => false)

	// Find loads matching predefined loads and copy their names.
	predefinedLoads.forEach(predefinedLoad => {
		const index = loads.findIndex((load, index) => !named[index] && equalLoads(load, predefinedLoad.load, options.predefinedComparison))
		if (index === -1) return
		named[index] = true
		result.push({ load: loads[index], name: createLoadName(predefinedLoad.name) })
	})

	// Walk through points, find associated loads, and name them.
	namedPoints.forEach(point => {
		const loadIndicesAtPoint = loads.map((_, index) => index).filter(index => !named[index] && isLoadAtPoint(loads[index], point.position))
		loadIndicesAtPoint.forEach(index => { named[index] = true })
		result.push(...deriveNamesAtPoint(loadIndicesAtPoint.map(index => loads[index]), point.name, forceSymbol, momentSymbol))
	})

	// Name remaining loads not connected to a point.
	const remainingLoads = loads.filter((_, index) => !named[index])
	result.push(...deriveNamesAtPoint(remainingLoads, undefined, forceSymbol, momentSymbol))
	return result
}

function deriveNamesAtPoint(loads: readonly Load[], point: string | undefined, forceSymbol: string, momentSymbol: string): NamedLoad[] {
	return [
		...deriveForceNames(loads.filter(isForce), point, forceSymbol),
		...deriveMomentNames(loads.filter(isMoment), point, momentSymbol),
	]
}

function deriveForceNames(forces: readonly Load[], point: string | undefined, symbol: string): NamedLoad[] {
	const forceLoads = forces.filter(isForce)
	if (forceLoads.length === 1) return [{ load: forceLoads[0], name: { symbol, ...(point === undefined ? {} : { point }) } }]
	if (forceLoads.length === 2 && point !== undefined) {
		const horizontal = forceLoads.find(force => equalAngles(force.angle, 0, Math.PI))
		const vertical = forceLoads.find(force => equalAngles(force.angle, Math.PI / 2, Math.PI))
		if (horizontal && vertical) {
			return [
				{ load: horizontal, name: { symbol, point, suffix: 'x' } },
				{ load: vertical, name: { symbol, point, suffix: 'y' } },
			]
		}
	}
	return [...forceLoads].sort((a, b) => normalizeAngle(a.angle + Math.PI / 2) - normalizeAngle(b.angle + Math.PI / 2)).map((load, index) => ({ load, name: getIndexedName(symbol, point, index) }))
}

function deriveMomentNames(moments: readonly Load[], point: string | undefined, symbol: string): NamedLoad[] {
	const momentLoads = moments.filter(isMoment)
	if (momentLoads.length === 1) return [{ load: momentLoads[0], name: { symbol, ...(point === undefined ? {} : { point }) } }]
	return [...momentLoads].sort((a, b) => Number(b.clockwise) - Number(a.clockwise) || a.openingAngle - b.openingAngle).map((load, index) => ({ load, name: getIndexedName(symbol, point, index) }))
}

function getIndexedName(symbol: string, point: string | undefined, index: number): LoadName {
	return { symbol, ...(point === undefined ? {} : { point }), suffix: index + 1 }
}
