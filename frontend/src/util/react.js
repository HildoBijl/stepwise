import { useState, useRef, useEffect, useReducer, useCallback } from 'react'

import { getCounterNumber } from 'step-wise/util/numbers'

// usePrevious remembers a value from the previous render.
export function usePrevious(value) {
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref.current
}

// useCounter is a function that returns [counter, increment], where counter is an integer and increment is a function that, when called, increments said counter.
export function useCounter(initialValue = 0) {
	const [counter, setCounter] = useState(initialValue)
	return [counter, () => setCounter(counter + 1)]
}

// useRefWithValue is used to directly store a value in a ref. This is useful when you have use-only functions in a useEffect function: plug them in a ref, apply the ref in the useEffect function and the function isn't triggered so much.
export function useRefWithValue(value, initialValue) {
	const ref = useRef(initialValue)
	ref.current = value
	return ref
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

// useEventListener set up an event for the given handler. It ensures to efficiently deal with registering and unregistering listeners. The element parameter can be a DOM object or an array of DOM objects. It is allowed to insert ref objects whose "current" parameter is a DOM object.
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
		setTimeout(updateWidth, 0) // Add another update after rendering is done, since some things may change.
	}, [updateWidth])

	// Update the width whenever the window changes size.
	useEffect(() => {
		window.addEventListener('resize', updateWidth)
		return () => window.removeEventListener('resize', updateWidth)
	}, [updateWidth])

	return fieldWidthRef.current
}