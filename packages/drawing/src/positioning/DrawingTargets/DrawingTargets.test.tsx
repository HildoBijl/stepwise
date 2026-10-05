// @vitest-environment jsdom

import { useLayoutEffect, useRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { Drawing } from '../../Drawing/index.ts'

import { anchors } from '../anchors.ts'
import { useResolvedPosition } from '../hooks.ts'

import { DrawingTarget, useDrawingTarget, useDrawingTextTarget } from './index.ts'

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

	test('resolves calculated positions that reference multiple targets', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>
			<DrawingTarget target="first">First</DrawingTarget>
			<DrawingTarget target="second">Second</DrawingTarget>
			<CalculatedTargetPosition />
		</Drawing>)

		expect(screen.getByText('47.5,37.5')).toBeTruthy()
	})
})

function ResolvedTargetPosition({ target = 'label' }: { target?: string }) {
	const position = useResolvedPosition({ target, anchor: anchors.bottomRight, pixelOffset: [5, 5] })
	return position ? <output>{position.x},{position.y}</output> : null
}

function CalculatedTargetPosition() {
	const position = useResolvedPosition({
		positions: [{ target: 'first' }, { target: 'second' }],
		calculate: ([first, second]) => first.add(second).multiply(0.5),
	})
	return position ? <output>{position.x},{position.y}</output> : null
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
