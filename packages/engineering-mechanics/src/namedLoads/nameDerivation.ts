import { ensureString, anglesEqual, normalizeAngle } from '@step-wise/js-utils'

import { type Load, type LoadComparisonOptionsInput, loadsEqual, isForce, isLoadAtPoint, isMoment } from '../loads/index.ts'

import type { LoadName, NamedLoad, NamedPointInput } from './types.ts'
import { createLoadName, createNamedLoad, createNamedPoint } from './creation.ts'

export type LoadNamingOptions = {
	forceSymbol?: string
	momentSymbol?: string
	predefinedLoadComparison?: LoadComparisonOptionsInput
}

export function deriveLoadNames(loads: readonly Load[], points: readonly NamedPointInput[] = [], predefinedNamedLoads: readonly NamedLoad[] = [], options: LoadNamingOptions = {}): NamedLoad[] {
	// Process the input.
	const forceSymbol = ensureString(options.forceSymbol ?? 'F', { nonEmpty: true })
	const momentSymbol = ensureString(options.momentSymbol ?? 'M', { nonEmpty: true })
	const namedPoints = points.map(createNamedPoint)
	const canonicalPredefinedLoads = predefinedNamedLoads.map(createNamedLoad)
	ensureUniqueNamedPoints(namedPoints)
	ensureUniqueLoadNames(canonicalPredefinedLoads)

	// Set up iteration containers.
	const result: NamedLoad[] = []
	const named = loads.map(() => false)

	// Find loads matching predefined loads and copy their names.
	canonicalPredefinedLoads.forEach(predefinedLoad => {
		const index = loads.findIndex((load, index) => !named[index] && loadsEqual(load, predefinedLoad.load, options.predefinedLoadComparison))
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
	const canonicalResult = result.map(createNamedLoad)
	ensureUniqueLoadNames(canonicalResult)
	return canonicalResult
}

function ensureUniqueNamedPoints(points: readonly ReturnType<typeof createNamedPoint>[]): void {
	points.forEach((point, index) => {
		if (points.slice(0, index).some(previousPoint => previousPoint.name === point.name)) throw new Error(`Invalid named points: the name "${point.name}" occurs more than once.`)
		if (points.slice(0, index).some(previousPoint => previousPoint.position.equals(point.position))) throw new Error(`Invalid named points: the position ${point.position} occurs more than once.`)
	})
}

function ensureUniqueLoadNames(namedLoads: readonly NamedLoad[]): void {
	const keys = namedLoads.map(({ name }) => JSON.stringify([name.symbol, `${name.point ?? ''}${name.suffix ?? ''}`]))
	if (new Set(keys).size !== keys.length) throw new Error(`Invalid named loads: multiple loads received the same complete name.`)
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
		const horizontal = forceLoads.find(force => anglesEqual(force.angle, 0, Math.PI))
		const vertical = forceLoads.find(force => anglesEqual(force.angle, Math.PI / 2, Math.PI))
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
	return [...momentLoads].sort((a, b) => Number(b.clockwise) - Number(a.clockwise) || a.openingDirection - b.openingDirection).map((load, index) => ({ load, name: getIndexedName(symbol, point, index) }))
}

function getIndexedName(symbol: string, point: string | undefined, index: number): LoadName {
	return { symbol, ...(point === undefined ? {} : { point }), suffix: index + 1 }
}
