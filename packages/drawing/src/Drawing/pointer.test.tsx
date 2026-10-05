// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { Drawing } from './Drawing.tsx'
import { useDrawingPointerState } from './pointer.ts'

let frameCallback: FrameRequestCallback | undefined

beforeEach(() => {
	frameCallback = undefined
	vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
		frameCallback = callback
		return 1
	}))
	vi.stubGlobal('cancelAnimationFrame', vi.fn(() => { frameCallback = undefined }))
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.style.position === 'relative') return { left: 10, top: 20, width: 200, height: 100 } as DOMRect
		return { width: 100 } as DOMRect
	})
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('Drawing pointer tracking', () => {
	test('provides pointer positions in every Drawing coordinate system', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 50, yDirection: 'up' }}><PointerReader /></Drawing>)

		movePointer(110, 50, { shiftKey: true })

		expect(screen.getByText('client:110,50')).toBeTruthy()
		expect(screen.getByText('render:50,15')).toBeTruthy()
		expect(screen.getByText('pixel:50,35')).toBeTruthy()
		expect(screen.getByText('drawing:50,35')).toBeTruthy()
		expect(screen.getByText('inside:true')).toBeTruthy()
		expect(screen.getByText('shift:true')).toBeTruthy()
	})

	test('retains local coordinates while reporting a pointer outside the Drawing', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 50 }}><PointerReader /></Drawing>)

		movePointer(230, 50)

		expect(screen.getByText('render:110,15')).toBeTruthy()
		expect(screen.getByText('inside:false')).toBeTruthy()
	})

	test('returns unresolved positions before a pointer position is known', () => {
		render(<Drawing view={{ type: 'identity', width: 100, height: 50 }}><PointerReader /></Drawing>)

		expect(screen.getByText('client:undefined')).toBeTruthy()
		expect(screen.getByText('drawing:undefined')).toBeTruthy()
		expect(screen.getByText('inside:false')).toBeTruthy()
	})
})

function PointerReader() {
	const state = useDrawingPointerState()
	return <>
		<output>client:{formatPosition(state.clientPosition)}</output>
		<output>render:{formatPosition(state.renderPosition)}</output>
		<output>pixel:{formatPosition(state.pixelPosition)}</output>
		<output>drawing:{formatPosition(state.drawingPosition)}</output>
		<output>inside:{String(state.isInside)}</output>
		<output>shift:{String(state.modifierKeys.shift)}</output>
	</>
}

function formatPosition(position: { x: number, y: number } | undefined): string {
	return position ? `${position.x},${position.y}` : 'undefined'
}

function movePointer(clientX: number, clientY: number, options: MouseEventInit = {}): void {
	act(() => {
		window.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY, ...options }))
		const callback = frameCallback
		frameCallback = undefined
		callback?.(0)
	})
}
