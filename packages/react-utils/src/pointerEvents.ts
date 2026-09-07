import { useSyncExternalStore } from 'react'

import { type Vector } from '@step-wise/geometry'
import { type ModifierKeyState, getEventClientPosition, getModifierKeyState } from '@step-wise/browser-utils'

export interface PointerState {
	readonly position: Vector | undefined
	readonly modifierKeys: ModifierKeyState
}

const noModifierKeys: ModifierKeyState = Object.freeze({ shift: false, ctrl: false, alt: false })
const initialPointerState: PointerState = Object.freeze({ position: undefined, modifierKeys: noModifierKeys })

let pointerState = initialPointerState
let latestPosition: Vector | undefined
let latestModifierKeys = noModifierKeys
let animationFrame: number | undefined
const subscribers = new Set<() => void>()

function areModifierKeysEqual(current: ModifierKeyState, previous: ModifierKeyState): boolean {
	return current.shift === previous.shift && current.ctrl === previous.ctrl && current.alt === previous.alt
}

function arePointerStatesEqual(current: PointerState, previous: PointerState): boolean {
	const positionsAreEqual = current.position === previous.position || (current.position !== undefined && previous.position !== undefined && current.position.equals(previous.position))
	return positionsAreEqual && areModifierKeysEqual(current.modifierKeys, previous.modifierKeys)
}

function publishPointerState(): void {
	const newState = { position: latestPosition, modifierKeys: latestModifierKeys }
	if (arePointerStatesEqual(newState, pointerState)) return
	pointerState = newState
	subscribers.forEach(notify => notify())
}

function schedulePointerStateUpdate(): void {
	if (animationFrame !== undefined) return
	animationFrame = window.requestAnimationFrame(() => {
		animationFrame = undefined
		publishPointerState()
	})
}

function handlePointerEvent(event: PointerEvent): void {
	latestPosition = getEventClientPosition(event)
	latestModifierKeys = getModifierKeyState(event)
	schedulePointerStateUpdate()
}

function handleModifierKeyEvent(event: KeyboardEvent): void {
	latestModifierKeys = getModifierKeyState(event)
	publishPointerState()
}

function handlePointerOut(event: PointerEvent): void {
	if (event.relatedTarget !== null) return
	latestPosition = undefined
	schedulePointerStateUpdate()
}

function handleWindowBlur(): void {
	latestPosition = undefined
	latestModifierKeys = noModifierKeys
	if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
	animationFrame = undefined
	publishPointerState()
}

function startTracking(): void {
	if (typeof window === 'undefined') return
	window.addEventListener('pointermove', handlePointerEvent, { passive: true })
	window.addEventListener('pointerdown', handlePointerEvent, { passive: true })
	window.addEventListener('pointerout', handlePointerOut, { passive: true })
	window.addEventListener('keydown', handleModifierKeyEvent)
	window.addEventListener('keyup', handleModifierKeyEvent)
	window.addEventListener('blur', handleWindowBlur)
}

function stopTracking(): void {
	if (typeof window === 'undefined') return
	window.removeEventListener('pointermove', handlePointerEvent)
	window.removeEventListener('pointerdown', handlePointerEvent)
	window.removeEventListener('pointerout', handlePointerOut)
	window.removeEventListener('keydown', handleModifierKeyEvent)
	window.removeEventListener('keyup', handleModifierKeyEvent)
	window.removeEventListener('blur', handleWindowBlur)
	if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
	animationFrame = undefined
	latestPosition = undefined
	latestModifierKeys = noModifierKeys
	pointerState = initialPointerState
}

function subscribe(notify: () => void): () => void {
	subscribers.add(notify)
	if (subscribers.size === 1) startTracking()
	return () => {
		subscribers.delete(notify)
		if (subscribers.size === 0) stopTracking()
	}
}

export function usePointerState(): PointerState {
	return useSyncExternalStore(subscribe, () => pointerState, () => initialPointerState)
}

export function usePointerPosition(): Vector | undefined {
	return useSyncExternalStore(subscribe, () => pointerState.position, () => undefined)
}
