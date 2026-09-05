import { useState } from 'react'

import { Vector } from '@step-wise/geometry'
import { getEventClientPosition, getModifierKeyState } from '@step-wise/browser-utils'

import { useEventListener } from './eventListeners.ts'

export function useMouseData(): { position?: Vector | null, keys?: Record<'shift' | 'ctrl' | 'alt', boolean> } {
	const [data, setData] = useState<{ position?: Vector | null, keys?: Record<'shift' | 'ctrl' | 'alt', boolean> }>({})
	const storeData = (event: Event) => setData({
		position: getEventClientPosition(event as MouseEvent | TouchEvent),
		keys: getModifierKeyState(event as KeyboardEvent),
	})
	useEventListener(['mousemove', 'touchstart', 'touchmove'], storeData)
	const processKeyPress = (event: Event) => setData(currentData => ({ ...currentData, keys: getModifierKeyState(event as KeyboardEvent) }))
	useEventListener(['keydown', 'keyup'], processKeyPress)
	return data
}

export function useMousePosition(): Vector | null | undefined {
	return useMouseData().position
}
