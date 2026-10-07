import { ensureBoolean, ensureNumber } from '@step-wise/js-utils'
import { type RectangleLike, Rectangle, ensureRectangle } from '@step-wise/geometry'

import type { DrawingView } from '../transforms/index.ts'
import { getPointBounds, resolvePoints } from '../transforms/viewSupport.ts'

import { type AxisPosition, type PlotAxes, type PlotAxisSettings, type PlotTicks, type PlotView, type ResolvedPlot, type ResolvedPlotAxis } from './types.ts'

/*
 * Plot resolution: determining bounds, ticks and such.
 */

// Resolve the plot axes from the provided settings and source domain.
export function resolvePlot(bounds: unknown, points: unknown, settings: Partial<PlotAxes<PlotAxisSettings>> = {}): ResolvedPlot {
	const plotRange = resolvePlotRange(bounds, points)

	// First resolve the axis data for each axis independently.
	const axisData = {
		x: resolvePlotAxisData(plotRange.getBounds(0), settings.x),
		y: resolvePlotAxisData(plotRange.getBounds(1), settings.y),
	}

	// Then combine knowledge about each other's domain to determine the axis positions.
	const axes = {
		x: { ...axisData.x, position: resolveAxisPosition(settings.x?.position ?? 'zero', axisData.y.domain) },
		y: { ...axisData.y, position: resolveAxisPosition(settings.y?.position ?? 'zero', axisData.x.domain) },
	}

	// Gather all data into a concrete object.
	return {
		domain: new Rectangle([axes.x.domain[0], axes.y.domain[0]], [axes.x.domain[1], axes.y.domain[1]]),
		axes,
	}
}

// Resolve the desired plot range from the provided bounds or points.
function resolvePlotRange(bounds: unknown, points: unknown): Rectangle {
	if (bounds !== undefined && points !== undefined) throw new Error('Invalid Plot range: provide either bounds or points, not both.')
	if (bounds !== undefined) return ensureRectangle(bounds as RectangleLike, { dimension: 2, nonZero: true })
	if (points !== undefined) return getPointBounds(resolvePoints(points as Parameters<typeof resolvePoints>[0]))
	throw new Error('Invalid Plot range: expected either bounds or points.')
}

// For a single axis, given its desired range and its settings, determine its actual bounds and ticks.
function resolvePlotAxisData(sourceDomain: readonly [number, number], settings: PlotAxisSettings = {}): Omit<ResolvedPlotAxis, 'position'> {
	if ((settings.type ?? 'linear') !== 'linear') throw new Error('Invalid Plot axis: only linear scales are currently supported.')

	// Normalize the domain and include zero if requested.
	let domain = normalizeDomain(settings.domain ?? sourceDomain)
	if (ensureBoolean(settings.includeZero ?? true)) domain = [Math.min(domain[0], 0), Math.max(domain[1], 0)]

	// Resolve the ticks and extend the domain if requested.
	const ticks = resolveTicks(domain, settings.ticks)
	if ((settings.ticks?.extendDomain ?? true) && ticks.length > 0) domain = [Math.min(domain[0], ticks[0]!), Math.max(domain[1], ticks[ticks.length - 1]!)]
	return { domain, ticks: ticks.filter(value => value >= domain[0] && value <= domain[1]) }
}

// Resolve an axis position within its perpendicular domain.
function resolveAxisPosition(position: AxisPosition, domain: readonly [number, number]): number {
	switch (position) {
		case 'zero': return Math.max(domain[0], Math.min(domain[1], 0))
		case 'min': return domain[0]
		case 'max': return domain[1]
		default: return ensureNumber(position)
	}
}

/*
 * Support functions for plot resolution.
 */

// Normalize a domain to ensure it is a valid range of two numbers. On zero-width domains, expand it to some small range around the value.
function normalizeDomain(input: readonly [number, number]): [number, number] {
	if (!Array.isArray(input) || input.length !== 2) throw new Error('Invalid Plot domain: expected exactly two numbers.')
	const values = input.map(value => ensureNumber(value)) as [number, number]
	let domain: [number, number] = values[0] <= values[1] ? values : [values[1], values[0]]
	if (domain[0] === domain[1]) {
		const margin = Math.abs(domain[0]) * 0.05 || 1
		domain = [domain[0] - margin, domain[1] + margin]
	}
	return domain
}

// Resolve the ticks for a given domain and tick options. If no tick values are provided, generate a set of ticks based on the desired count or step size.
function resolveTicks(domain: readonly [number, number], options: PlotTicks | undefined): number[] {
	// If the user provided explicit tick values, use those.
	if (options?.values !== undefined) return uniqueSorted(options.values.map(value => ensureNumber(value)))

	// Determine the step size based on the provided options.
	const desiredCount = ensureNumber(options?.desiredCount ?? 8, { nonNegative: true, nonZero: true })
	if (!Number.isInteger(desiredCount)) throw new Error('Invalid Plot desired tick count: expected an integer.')
	const step = options?.step === undefined ? getNiceStep(domain[1] - domain[0], desiredCount) : ensureNumber(options.step, { nonNegative: true, nonZero: true })

	// Determine the first and last ticks and use them to generate a list of ticks.
	const extend = options?.extendDomain ?? true
	const firstIndex = extend ? Math.floor(domain[0] / step) : Math.ceil(domain[0] / step)
	const lastIndex = extend ? Math.ceil(domain[1] / step) : Math.floor(domain[1] / step)
	if (lastIndex - firstIndex > 10000) throw new Error('Invalid Plot ticks: the requested step produces more than 10,000 ticks.')
	return Array.from({ length: Math.max(0, lastIndex - firstIndex + 1) }, (_, index) => cleanNumber((firstIndex + index) * step))
}

// Get a "nice" step size for a given range and desired tick count.
function getNiceStep(range: number, desiredCount: number): number {
	const roughStep = range / Math.max(1, desiredCount - 1)
	const power = 10 ** Math.floor(Math.log10(roughStep))
	const candidates = [1, 2, 5, 10].map(multiplier => multiplier * power)
	return candidates.reduce((best, candidate) => Math.abs(range / candidate + 1 - desiredCount) < Math.abs(range / best + 1 - desiredCount) ? candidate : best)
}

function uniqueSorted(values: readonly number[]): number[] {
	return [...new Set(values)].sort((a, b) => a - b)
}

function cleanNumber(value: number): number {
	return Number(value.toPrecision(14))
}

/*
 * Plot view resolution.
 */

// Resolve the drawing view from the provided plot view and the resolved domain.
export function resolvePlotView(view: PlotView, domain: Rectangle): DrawingView {
	switch (view.type) {
		case 'bounds': return { ...view, bounds: domain, yDirection: 'up' }
		case 'scale': return { ...view, points: [domain.min, domain.max], yDirection: 'up' }
		case 'fit': return { ...view, points: [domain.min, domain.max], uniform: view.uniform ?? false, yDirection: 'up' }
	}
}
