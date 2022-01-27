import { isValidElement, useState, useRef, useEffect, useReducer, useCallback } from 'react'

import { getCounterNumber } from 'step-wise/util/numbers'
import { ensureConsistency } from 'step-wise/util/objects'

// ensureReactElement ensures that the given parameter is a React-type element. If not, it throws an error. On success it returns the element.
export function ensureReactElement(element) {
	if (!isValidElement(element))
		throw new Error(`Invalid React element: expected a valid React element but received something of type "${typeof element}".`)
	return element
}

// usePrevious remembers a value from the previous render.
export function usePrevious(value) {
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref.current
}

// useCurrentOrPrevious will check if the current object still exists. If not, the previous one is used. This is useful for keeping the layout intact while an object slides into hiding.
export function useCurrentOrPrevious(value) {
	const previousValue = usePrevious(value)
	return value || previousValue
}

// useConsistentValue will check if the given value is the same as previously. If the reference changes, but a deepEquals check still results in the same object, the same reference will be maintained.
export function useConsistentValue(value) {
	const ref = useRef()
	ref.current = ensureConsistency(value, ref.current)
	return ref.current
}

// useEqualRefOnEquality will check if a value equals its previous value. If so, the reference is maintained.
export function useEqualRefOnEquality(value, equalityCheck = (a, b) => a && a.equals(b)) {
	const ref = useRef()
	if (value !== ref.current && !equalityCheck(value, ref.current))
		ref.current = value
	return ref.current
}

// useCounter is a function that returns [counter, increment], where counter is an integer and increment is a function that, when called, increments said counter.
export function useCounter(initialValue = 0) {
	const [counter, setCounter] = useState(initialValue)
	return [counter, () => setCounter(counter + 1)]
}

// useRefWithValue is used to directly store a value in a ref. This is useful when you have use-only functions in a useEffect function: plug them in a ref, apply the ref in the useEffect function and the function isn't triggered so much.
export function useRefWithValue(value, initialValue = value) {
	const ref = useRef(initialValue)
	ref.current = value
	return ref
}

// useInitializer is like useEffect(func, []) but then can have dependencies without giving warnings. 
export function useInitializer(func) {
	const funcRef = useRefWithValue(func)
	useEffect(() => funcRef.current(), [funcRef])
}

// useMountedRef returns whether the object is mounted, through a reference object. This allows for pass-by-reference.
export function useMountedRef() {
	const mountedRef = useRef(false)
	useEffect(() => {
		mountedRef.current = true
		return () => { mountedRef.current = false }
	}, [mountedRef])
	return mountedRef
}

// useMounted returns whether the object is mounted by giving a boolean.
export function useMounted() {
	const mountedRef = useMountedRef()
	return mountedRef.current
}

// useUniqueNumber gives a number that's unique for this page. It keeps it constant. Usually the first object gets 1, the second 2, and so forth.
export function useUniqueNumber() {
	const ref = useRef()
	if (ref.current === null || ref.current === undefined)
		ref.current = getCounterNumber()
	return ref.current
}

// useEventListener sets up event listeners for the given elements, executing the given handler. It ensures to efficiently deal with registering and unregistering listeners. The element parameter can be a DOM object or an array of DOM objects. It is allowed to insert ref objects whose "current" parameter is a DOM object.
export function useEventListener(eventName, handler, elements = window) {
	// If the handler changes, remember it within the ref. This allows us to change the handler without having to reregister listeners.
	const handlerRef = useRef() // This ref will store the handler function.
	useEffect(() => {
		handlerRef.current = handler
	}, [handler])

	// Set up the listeners using another effect.
	useEffect(() => {
		// Ensure that the elements given are an array of existing objects.
		const processedElements = (Array.isArray(elements) ? elements : [elements]).map(element => {
			if (!element)
				return false // No element. Throw it out.
			if (element.addEventListener)
				return element // The element can listen. Keep it.
			if (element.current && element.current.addEventListener)
				return element.current // There is a "current" property that can listen. The object is most likely a ref.
			return false // No idea. Throw it out.
		}).filter(element => element) // Throw out non-existing elements or elements without an event listener.

		// Add and remove event listeners.
		const redirectingHandler = (evt) => handlerRef.current(evt)
		processedElements.forEach(element => element.addEventListener(eventName, redirectingHandler))
		return () => {
			processedElements.forEach(element => element.removeEventListener(eventName, redirectingHandler))
		}
	}, [eventName, elements]) // Reregister only when the event type or the listening objects change.
}

// useMousePosition returns the position of the mouse in client coordinates.
export function useMousePosition() {
	// Track the position of the mouse.
	const [position, setPosition] = useState(null)
	useEventListener('mousemove', (evt) => {
		setPosition({ x: evt.clientX, y: evt.clientY })
	})
	return position
}

// useMousePositionRelative returns the position of the mouse in client coordinates relative to a given element reference. In case anything is not known yet, null is returned.
export function useMousePositionRelative(element) {
	// Acquire all data.
	const mousePosition = useMousePosition()
	const elementRect = useBoundingClientRect(element)

	// Combine data where possible.
	if (!mousePosition || !elementRect)
		return null
	return { x: mousePosition.x - elementRect.x, y: mousePosition.y - elementRect.y }
}

// useBoundingClientRect takes an element and tracks the BoundingClientRect. It only updates it on changes to the element and on scrolls, improving efficiency.
export function useBoundingClientRect(element) {
	const [rect, setRect] = useState(null)

	// Create a handler that updates the rect.
	const updateElementPosition = useCallback(() => {
		if (element)
			setRect(element.getBoundingClientRect())
	}, [element, setRect])

	// Listen for updates to the rect.
	useEffect(() => updateElementPosition(), [element, updateElementPosition]) // Changes in the rectangle.
	useEventListener('scroll', updateElementPosition) // Scrolling.
	useEventListener('resize', updateElementPosition) // Window resize.

	// On a first run the rect may not be known yet. Calculate it directly.
	if (element && !rect) {
		const actualRect = element.getBoundingClientRect()
		setRect(actualRect)
		return actualRect
	}

	// Normal case: return the rectangle.
	return rect
}

// useForceUpdate gives you a force update function, which is useful in some extreme cases.
export function useForceUpdate() {
	return useReducer(() => ({}))[1]
}

// useWidthTracker tracks the width of an element. It returns the width of the object which the ref points to. It forces a rerender on every width change unless forceUpdateOnChange is set to false. It updates on initial render and on window resizes.
export function useWidthTracker(fieldRef, forceUpdateOnChange = true) {
	const fieldWidthRef = useRef(0)
	const forceUpdate = useForceUpdate()

	// Set up a handler that updates the width.
	const updateWidth = useCallback(() => {
		const prevWidth = fieldWidthRef.current
		fieldWidthRef.current = (fieldRef.current && fieldRef.current.offsetWidth) || 0
		if (forceUpdateOnChange && prevWidth !== fieldWidthRef.current)
			forceUpdate()
	}, [fieldRef, fieldWidthRef, forceUpdate, forceUpdateOnChange])

	// Update the width on the initial render.
	useEffect(() => {
		updateWidth()
		const timeout = setTimeout(updateWidth, 0) // Add another update after rendering is done, since some things may change.
		return () => clearTimeout(timeout) // Cancel the update call when the component dismounts.
	}, [updateWidth])

	// Update the width whenever the window changes size.
	useEffect(() => {
		window.addEventListener('resize', updateWidth)
		return () => window.removeEventListener('resize', updateWidth)
	}, [updateWidth])

	return fieldWidthRef.current
}