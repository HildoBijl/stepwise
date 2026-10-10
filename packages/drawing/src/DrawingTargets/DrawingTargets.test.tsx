// @vitest-environment jsdom

import { useEffect, useLayoutEffect, useRef } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { Transformation } from '@step-wise/geometry'

import { Drawing } from '../Drawing/index.ts'

import { anchors } from '../positioning/anchors.ts'
import { useDrawingDistance, useDrawingDistances, useDrawingPixelDistance, useDrawingPixelDistances } from '../positioning/distanceHooks.ts'
import { useDrawingPosition, useDrawingPositions, useDrawingPixelPosition, useDrawingPixelPositions } from '../positioning/positionHooks.ts'
import { useDrawingTargetBounds, useDrawingTargetBoundsMap, useDrawingTargetPixelBounds, useDrawingTargetPixelBoundsMap } from '../positioning/targetBoundsHooks.ts'

import { DrawingTarget, useDrawingElementTarget, useDrawingTarget, useDrawingTextTarget } from './index.ts'

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
	const createRange = document.createRange.bind(document)
	vi.spyOn(document, 'createRange').mockImplementation(() => {
		const range = createRange()
		range.getBoundingClientRect = () => rectangle(30, 40, 20, 10)
		return range
	})
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.style.position === 'relative') return rectangle(10, 20, 100, 100)
		if (this.textContent === 'Second') return rectangle(70, 60, 10, 20)
		if (this.tagName === 'SPAN') return rectangle(30, 40, 20, 10)
		return rectangle(0, 0, 100, 100)
	})
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	ResizeObserverMock.observed.length = 0
})

describe('Drawing targets', () => {
	test('measures referenced targets and resolves their positions', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget target="label">Label</DrawingTarget>
			<ResolvedTargetPosition />
		</Drawing>)

		expect(screen.getByText('45,35')).toBeTruthy()
	})

	test('keeps referenced positions available across equivalent inline view rerenders', () => {
		const { rerender } = render(<DrawingWithInlineView marker="first" />)
		expect(screen.getByText('45,35')).toBeTruthy()

		rerender(<DrawingWithInlineView marker="second" />)
		expect(screen.getByText('45,35')).toBeTruthy()
	})

	test('remeasures referenced positions after a genuine view change', () => {
		const onUnmount = vi.fn()
		const { rerender } = render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget target="label">Label</DrawingTarget>
			<ResolvedTargetPosition onUnmount={onUnmount} />
		</Drawing>)
		expect(screen.getByText('45,35')).toBeTruthy()

		rerender(<Drawing view={{ type: 'identity', width: 200, height: 100 }}>
			<DrawingTarget target="label">Label</DrawingTarget>
			<ResolvedTargetPosition onUnmount={onUnmount} />
		</Drawing>)
		expect(screen.getByText('85,35')).toBeTruthy()
		expect(onUnmount).not.toHaveBeenCalled()
	})

	test('only observes a target once it is referenced', () => {
		const { rerender } = render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget target="label">Label</DrawingTarget>
		</Drawing>)
		const label = screen.getByText('Label')
		expect(ResizeObserverMock.observed).not.toContain(label)

		rerender(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget target="label">Label</DrawingTarget>
			<ResolvedTargetPosition />
		</Drawing>)
		expect(ResizeObserverMock.observed.some(element => element.textContent === 'Label')).toBe(true)
	})

	test('accepts text nodes through useDrawingTarget', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<TextTarget />
			<ResolvedTargetPosition target="text" />
		</Drawing>)

		expect(screen.getByText('45,35')).toBeTruthy()
	})

	test('finds and registers a matching text node through useDrawingTextTarget', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<TextTargetWithHelper />
			<ResolvedTargetPosition target="matching-text" />
			<ResolvedTargetPosition target="matching-parent" />
		</Drawing>)

		expect(screen.getByText('45,35')).toBeTruthy()
		expect(screen.getByText('75,65')).toBeTruthy()
	})

	test('tracks elements that appear, disappear, and move to a replacement container', async () => {
		const { rerender } = render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicElementTarget containerKey="first" show={false} />
			<ResolvedTargetPosition target="dynamic-element" />
		</Drawing>)
		expect(screen.queryByText('45,35')).toBeNull()

		rerender(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicElementTarget containerKey="first" show />
			<ResolvedTargetPosition target="dynamic-element" />
		</Drawing>)
		await waitFor(() => { expect(screen.getByText('45,35')).toBeTruthy() })

		rerender(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicElementTarget containerKey="second" show />
			<ResolvedTargetPosition target="dynamic-element" />
		</Drawing>)
		await waitFor(() => { expect(screen.getByText('45,35')).toBeTruthy() })

		rerender(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicElementTarget containerKey="second" show={false} />
			<ResolvedTargetPosition target="dynamic-element" />
		</Drawing>)
		await waitFor(() => { expect(screen.queryByText('45,35')).toBeNull() })
	})

	test('uses a registered target as an element resolver container', async () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget as="div" target="table"><span data-nested-target>Nested</span></DrawingTarget>
			<NestedElementTarget />
			<ResolvedTargetPosition target="nested-element" />
		</Drawing>)

		await waitFor(() => { expect(screen.getByText('45,35')).toBeTruthy() })
	})

	test('updates text targets when matching text appears and disappears', async () => {
		const { rerender } = render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicTextTarget text="Waiting" />
			<ResolvedTargetPosition target="dynamic-text" />
		</Drawing>)
		expect(screen.queryByText('45,35')).toBeNull()

		rerender(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicTextTarget text="Matched" />
			<ResolvedTargetPosition target="dynamic-text" />
		</Drawing>)
		await waitFor(() => { expect(screen.getByText('45,35')).toBeTruthy() })

		rerender(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DynamicTextTarget text="Gone" />
			<ResolvedTargetPosition target="dynamic-text" />
		</Drawing>)
		await waitFor(() => { expect(screen.queryByText('45,35')).toBeNull() })
	})

	test('resolves calculated positions that reference multiple targets', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget target="first">First</DrawingTarget>
			<DrawingTarget target="second">Second</DrawingTarget>
			<CalculatedTargetPosition />
		</Drawing>)

		expect(screen.getByText('47.5,37.5')).toBeTruthy()
	})

	test('exposes target bounds, positions, and distances in drawing and pixel coordinates', () => {
		render(<Drawing view={{
			type: 'custom',
			width: 100,
			height: 100,
			yDirection: 'up',
			drawingToPixelTransformation: Transformation.fromScale([2, 2]),
		}}>
			<DrawingTarget target="label">Label</DrawingTarget>
			<CoordinateHookOutput />
		</Drawing>)

		expect(screen.getByText('bounds:10,35,20,40|pixels:20,70,40,80|maps:10,35,20,40;20,70,40,80|positions:3,8;6,8|positionLists:3,8/1,2/undefined;6,16/2,4/undefined|distances:4;6|distanceLists:4/3/undefined;8/6/undefined')).toBeTruthy()
	})
})

function ResolvedTargetPosition({ onUnmount, target = 'label' }: { onUnmount?: () => void, target?: string }) {
	const position = useDrawingPixelPosition({ target, anchor: anchors.bottomRight, pixelOffset: [5, 5] })
	return position ? <ResolvedTargetOutput onUnmount={onUnmount} value={`${position.x},${position.y}`} /> : null
}

function ResolvedTargetOutput({ onUnmount, value }: { onUnmount?: () => void, value: string }) {
	useEffect(() => () => { onUnmount?.() }, [onUnmount])
	return <output>{value}</output>
}

function DrawingWithInlineView({ marker }: { marker: string }) {
	return <Drawing view={{ type: 'identity', width: 100, height: 100 }}>
		<span hidden>{marker}</span>
		<DrawingTarget target="label">Label</DrawingTarget>
		<ResolvedTargetPosition />
	</Drawing>
}

function CalculatedTargetPosition() {
	const position = useDrawingPixelPosition({
		positions: [{ target: 'first' }, { target: 'second' }],
		calculate: ([first, second]) => first.add(second).multiply(0.5),
	})
	return position ? <output>{position.x},{position.y}</output> : null
}

function CoordinateHookOutput() {
	const drawingBounds = useDrawingTargetBounds('label')
	const pixelBounds = useDrawingTargetPixelBounds('label')
	const drawingBoundsMap = useDrawingTargetBoundsMap(['label'])
	const pixelBoundsMap = useDrawingTargetPixelBoundsMap(['label'])
	const drawingPosition = useDrawingPosition({ pixelPosition: [6, 16] })
	const pixelPosition = useDrawingPixelPosition([3, 4])
	const drawingPositions = useDrawingPositions([{ pixelPosition: [6, 16] }, [1, 2], { target: 'missing' }])
	const pixelPositions = useDrawingPixelPositions([{ pixelPosition: [6, 16] }, [1, 2], { target: 'missing' }])
	const drawingDistance = useDrawingDistance({ pixelDistance: 8 })
	const pixelDistance = useDrawingPixelDistance(3)
	const unresolvedDistance = { positions: [{ target: 'missing' }], calculate: () => 0 } as const
	const drawingDistances = useDrawingDistances([{ pixelDistance: 8 }, 3, unresolvedDistance])
	const pixelDistances = useDrawingPixelDistances([{ pixelDistance: 8 }, 3, unresolvedDistance])
	if (!drawingBounds || !pixelBounds || !drawingPosition || !pixelPosition || !drawingPositions || !pixelPositions || drawingDistance === undefined || pixelDistance === undefined || !drawingDistances || !pixelDistances) return null
	return <output>{[
		`bounds:${formatRectangle(drawingBounds)}`,
		`pixels:${formatRectangle(pixelBounds)}`,
		`maps:${formatRectangle(drawingBoundsMap.get('label'))};${formatRectangle(pixelBoundsMap.get('label'))}`,
		`positions:${drawingPosition.coordinates};${pixelPosition.coordinates}`,
		`positionLists:${drawingPositions.map(position => position?.coordinates ?? 'undefined').join('/')};${pixelPositions.map(position => position?.coordinates ?? 'undefined').join('/')}`,
		`distances:${drawingDistance};${pixelDistance}`,
		`distanceLists:${drawingDistances.map(distance => distance ?? 'undefined').join('/')};${pixelDistances.map(distance => distance ?? 'undefined').join('/')}`,
	].join('|')}</output>
}

function formatRectangle(bounds: { min: { coordinates: readonly number[] }, max: { coordinates: readonly number[] } } | undefined): string {
	return bounds ? `${bounds.min.coordinates},${bounds.max.coordinates}` : 'undefined'
}

function TextTarget() {
	const container = useRef<HTMLSpanElement>(null)
	const targetRef = useDrawingTarget<Text>('text')
	useLayoutEffect(() => {
		targetRef(container.current!.firstChild as Text)
		return () => { targetRef(null) }
	}, [targetRef])
	return <span ref={container}>Text</span>
}

function TextTargetWithHelper() {
	const container = useRef<HTMLDivElement>(null)
	useDrawingTextTarget('matching-text', container, 'Second', { index: 1 })
	useDrawingTextTarget('matching-parent', container, node => node.textContent === 'Second', { parentDepth: 1 })
	return <div ref={container}><span>First</span><span>Second</span><span>Second</span></div>
}

function DynamicElementTarget({ containerKey, show }: { containerKey: string, show: boolean }) {
	const container = useRef<HTMLDivElement>(null)
	useDrawingElementTarget('dynamic-element', container, element => element.querySelector('[data-dynamic-target]'))
	return <div key={containerKey} ref={container}>{show && <span data-dynamic-target>Dynamic</span>}</div>
}

function NestedElementTarget() {
	useDrawingElementTarget('nested-element', 'table', container => container.querySelector('[data-nested-target]'))
	return null
}

function DynamicTextTarget({ text }: { text: string }) {
	const container = useRef<HTMLDivElement>(null)
	useDrawingTextTarget('dynamic-text', container, 'Matched')
	return <div ref={container}>{text}</div>
}

class ResizeObserverMock {
	static readonly observed: Element[] = []

	constructor(private readonly callback: ResizeObserverCallback) {}

	observe(element: Element) {
		ResizeObserverMock.observed.push(element)
		this.callback([], this as unknown as ResizeObserver)
	}

	disconnect() {}
	unobserve() {}
}

function rectangle(left: number, top: number, width: number, height: number): DOMRect {
	return { left, top, width, height, right: left + width, bottom: top + height } as DOMRect
}
