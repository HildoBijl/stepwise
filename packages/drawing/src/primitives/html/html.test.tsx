// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Drawing } from '../../Drawing/index.ts'
import { anchors } from '../../positioning/index.ts'

import { CornerLabel } from './CornerLabel.tsx'
import { HtmlElement } from './HtmlElement.tsx'
import { getAnchorFromAngle, Label } from './Label.tsx'
import { LineLabel } from './LineLabel.tsx'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('HTML drawing primitives', () => {
	test('positions and anchors an HTML element in the Drawing HTML layer', () => {
		const { container } = renderDrawing(<HtmlElement anchor={anchors.topLeft} position={[10, 20]} scale={2}>Element</HtmlElement>)
		const element = screen.getByText('Element')
		expect(element.style.left).toBe('10px')
		expect(element.style.top).toBe('20px')
		expect(element.style.transform).toBe('translate(0%, 0%) rotate(0rad) scale(2)')
		expect(element.parentElement).toBe(container.querySelector('svg')?.nextElementSibling)
	})

	test('supports interactive elements explicitly', () => {
		renderDrawing(<HtmlElement ignoreMouse={false} position={[0, 0]}>Interactive</HtmlElement>)
		expect(screen.getByText('Interactive').style.pointerEvents).toBe('auto')
	})

	test('does not wrap contents unless wrapping is explicitly enabled', () => {
		renderDrawing(<>
			<HtmlElement position={[0, 0]}>No wrapping</HtmlElement>
			<HtmlElement position={[0, 0]} style={{ whiteSpace: 'normal' }}>Wrapping</HtmlElement>
		</>)
		expect(screen.getByText('No wrapping').style.whiteSpace).toBe('nowrap')
		expect(screen.getByText('Wrapping').style.whiteSpace).toBe('normal')
	})

	test('renders an element behind the SVG layer when requested', () => {
		const { container } = renderDrawing(<HtmlElement behind position={[0, 0]}>Behind</HtmlElement>)
		expect(screen.getByText('Behind').parentElement?.nextElementSibling).toBe(container.querySelector('svg'))
	})

	test('offsets labels in pixel-coordinate directions', () => {
		renderDrawing(<Label angle={0} distance={{ pixelDistance: 10 }} position={[10, 20]}>Label</Label>)
		const label = screen.getByText('Label')
		expect(label.style.left).toBe('20px')
		expect(label.style.top).toBe('20px')
	})

	test('uses stable corner anchors at diagonal label angles', () => {
		const angle = Math.PI * 5 / 4
		for (const delta of [-Number.EPSILON, 0, Number.EPSILON]) {
			const anchor = getAnchorFromAngle(angle + delta)
			expect(anchor.x).toBeCloseTo(-1)
			expect(anchor.y).toBeCloseTo(-1)
		}
	})

	test('follows an upward pixel direction for offsets, anchors, and rotations', () => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 100 } as DOMRect)
		render(<Drawing view={{ type: 'identity', width: 100, height: 100, yDirection: 'up' }}>
			<Label angle={Math.PI / 2} anchor={[1, 1]} distance={{ pixelDistance: 10 }} position={[10, 20]} rotate={Math.PI / 2}>Upward</Label>
		</Drawing>)
		const label = screen.getByText('Upward')
		expect(Number.parseFloat(label.style.left)).toBeCloseTo(10)
		expect(Number.parseFloat(label.style.top)).toBeCloseTo(70)
		expect(label.style.transform).toBe('translate(-100%, 0%) rotate(-1.5707963267948966rad) scale(1)')
	})

	test('places line labels opposite a supplied position', () => {
		renderDrawing(<LineLabel distance={{ pixelDistance: 10 }} oppositeTo={[5, 10]} positions={[[0, 0], [10, 0]]}>Line</LineLabel>)
		const label = screen.getByText('Line')
		expect(Number.parseFloat(label.style.left)).toBeCloseTo(5)
		expect(Number.parseFloat(label.style.top)).toBeCloseTo(-10)
	})

	test('places corner labels inside the angle', () => {
		renderDrawing(<CornerLabel positions={[[10, 0], [0, 0], [0, 10]]} size={{ pixelDistance: 20 }}>Corner</CornerLabel>)
		const label = screen.getByText('Corner')
		expect(Number.parseFloat(label.style.left)).toBeCloseTo(10)
		expect(Number.parseFloat(label.style.top)).toBeCloseTo(10)
	})

	test('does not render while a referenced position is unresolved', () => {
		renderDrawing(<HtmlElement position={{ target: 'missing' }}>Missing</HtmlElement>)
		expect(screen.queryByText('Missing')).toBeNull()
	})

	test('registers an element that renders after its position target resolves', () => {
		renderDrawing(<>
			<HtmlElement position={[0, 0]} target="first">First</HtmlElement>
			<HtmlElement position={{ target: 'first' }} target="second">Second</HtmlElement>
			<HtmlElement position={{ target: 'second' }}>Third</HtmlElement>
		</>)
		expect(screen.getByText('Second')).toBeTruthy()
		expect(screen.getByText('Third')).toBeTruthy()
	})
})

function renderDrawing(children: ReactNode) {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 } as DOMRect)
	return render(<Drawing view={{ type: 'identity', width: 100, height: 100 }}>{children}</Drawing>)
}
