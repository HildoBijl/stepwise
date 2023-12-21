import { isValidElement, useState, useRef, useEffect, useReducer, useCallback } from 'react'
import { createPortal } from 'react-dom'
import usePrevious from '@react-hook/previous'
import useSize from '@react-hook/size'
import useResizeObserver from '@react-hook/resize-observer'
import FontFaceObserver from 'fontfaceobserver'

import { getCounterNumber, ensureConsistency } from 'step-wise/util'
import { Vector } from 'step-wise/geometry'

import { getEventPosition, getUtilKeys } from 'util/dom' // Keep exports separate and specific due to faulty unit test package caching.

// Re-export various useful hooks from other packages.
export { usePrevious, useSize, useResizeObserver }

// ensureReactElement ensures that the given parameter is a React-type element. If not, it throws an error. On success it returns the element.
export function ensureReactElement(element, allowString = true, allowNumber = true) {
	if (!isValidElement(element) && (!allowString || typeof element !== 'string') && (!allowNumber || typeof element !== 'number'))
		throw new Error(`Invalid React element: expected a valid React element but received something of type "${typeof element}".`)
	return element
}

// useLatest is used to directly store a value in a ref. This is useful when you have use-only functions in a useEffect function: plug them in a ref, apply the ref in the useEffect function and the function isn't triggered so much. (Note: this is different from the @react-hook/latest, which uses an event and is hence too slow.)
export function useLatest(value, initialValue = value) {
	const ref = useRef(initialValue)
	ref.current = value
	return ref
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

// useEqualRefOnEquality will check if a value equals its previous value. If so, the reference is maintained. The difference between useConsistentValue and this function is that this has its own equality check.
export function useEqualRefOnEquality(value, equalityCheck = (a, b) => a && a.equals(b)) {
	const ref = useRef()
	if (value !== ref.current && !equalityCheck(value, ref.current))
		ref.current = value
	return ref.current
}

// useImmutableValue will ensure that the given property remains exactly the same. If it changes, an error is thrown. It's also not allowed to be undefined. This is useful for properties that are not allowed to change.
export function useImmutableValue(value) {
	const ref = useRef(undefined)
	if (value === undefined)
		throw new Error(`Invalid property value: undefined is not allowed for this property.`)
	if (ref.current === undefined)
		ref.current = value
	if (value !== ref.current)
		throw new Error(`Unallowed property change: the given property is not allowed to change value. However, it changed from "${ref.current}" to "${value}".`)
	return value // Return the value for potential chaining.
}

// useCounter is a function that returns [counter, increment], where counter is an integer and increment is a function that, when called, increments said counter.
export function useCounter(initialValue = 0) {
	const [counter, setCounter] = useState(initialValue)
	return [counter, () => setCounter(counter + 1)]
}

// useUpdater is like useEffect(func, [params]) but then can have dependencies without giving warnings. It is called whenever some of the dependencies change.
export function useUpdater(func, dependencies) {
	dependencies = useConsistentValue(dependencies)
	const funcRef = useLatest(func)
	useEffect(() => funcRef.current(), [funcRef, dependencies])
}

// useStableCallback is like useCallback(func, []) but then can have dependencies without giving warnings. It's a constant-reference function that just looks up which function is registered to it whenever it's called. If any of the optional dependencies changes, then the callback is changed though.
export function useStableCallback(func, dependencies) {
	dependencies = useConsistentValue(dependencies)
	const funcRef = useLatest(func) // eslint-disable-next-line react-hooks/exhaustive-deps
	return useCallback((...args) => funcRef.current(...args), [funcRef, dependencies])
}

// useMountedRef returns whether the object is mounted. It returns the actual reference object.
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

// useEnsureRef takes a ref object that comes in and assume that it actually is a ref. This is useful when using forwardRef and wanting to make sure you get an existing ref right at the start.
export function useEnsureRef(ref) {
	const backupRef = useRef()
	return ref || backupRef
}

// useUniqueNumber gives a number that's unique for this page. It keeps it constant. Usually the first object gets 1, the second 2, and so forth.
export function useUniqueNumber() {
	const ref = useRef()
	if (ref.current === null || ref.current === undefined)
		ref.current = getCounterNumber()
	return ref.current
}

// useEventListener sets up event listeners for the given elements, executing the given handler. It ensures to efficiently deal with registering and unregistering listeners. The element parameter can be a DOM object or an array of DOM objects. It is allowed to insert ref objects whose "current" parameter is a DOM object. In addition, the eventName attribute may be an array. The handler may be a single function (in which case it's used for all eventNames) or an array with equal length as the eventName array.
export function useEventListener(eventName, handler, elements = window, options = {}) {
	// If the handler changes, remember it within the ref. This allows us to change the handler without having to reregister listeners.
	eventName = useConsistentValue(eventName)
	const handlerRef = useLatest(handler)
	elements = useConsistentValue(elements)
	options = useConsistentValue(options)

	// Ensure that the elements parameter is an array of existing objects.
	elements = (Array.isArray(elements) ? elements : [elements])
	elements = elements.map(element => {
		if (!element)
			return false // No element. Throw it out.
		if (element.addEventListener)
			return element // The element can listen. Keep it.
		if (element.current && element.current.addEventListener)
			return element.current // There is a "current" property that can listen. The object is most likely a ref.
		return false // No idea. Throw it out.
	})
	elements = elements.filter(element => element) // Throw out non-existing elements or elements without an event listener.
	elements = useConsistentValue(elements)

	// Set up the listeners using another effect.
	useEffect(() => {
		// Set up redirecting handlers (one for each event name) which calls the latest functions in the handlerRef. 
		const eventNames = Array.isArray(eventName) ? eventName : [eventName]
		const redirectingHandlers = eventNames.map((_, index) => {
			return (event) => {
				const handler = handlerRef.current
				const currHandler = Array.isArray(handler) ? handler[index] : handler
				currHandler(event)
			}
		})

		// Add event listeners for each of the handlers, to each of the elements.
		eventNames.forEach((eventName, index) => {
			const redirectingHandler = redirectingHandlers[index]
			elements.forEach(element => element.addEventListener(eventName, redirectingHandler, options))
		})

		// Make sure to remove all handlers upon a change in settings or upon a dismount.
		return () => {
			eventNames.forEach((eventName, index) => {
				const redirectingHandler = redirectingHandlers[index]
				elements.forEach(element => element.removeEventListener(eventName, redirectingHandler))
			})
		}
	}, [eventName, handlerRef, elements, options]) // Reregister only when the event type or the listening objects change.
}

// useEventListeners takes an object like { mouseenter: (evt) => {...}, mouseleave: (evt) => {...} } and applies event listeners to it.
export function useEventListeners(handlers, elements, options) {
	useEventListener(Object.keys(handlers), Object.values(handlers), elements, options)
}

// useRefWithEventListeners takes an object like { mouseenter: (evt) => {...}, mouseleave: (evt) => {...} } and returns a ref. If the ref is coupled to a DOM object, this DOM object listens to the relevant events.
export function useRefWithEventListeners(handlers, options) {
	const ref = useRef()
	useEventListeners(handlers, ref, options)
	return ref
}

// useMouseData returns the last-known data related to mouse motion, with the position in client coordinates. The format is { position: new Vector(x, y), keys: { shift: true, alt: false, ctrl: false } }.
export function useMouseData() {
	const [data, setData] = useState({})

	// Track the position of the mouse.
	const storeData = (event) => setData({ position: getEventPosition(event), keys: getUtilKeys(event) })
	useEventListener(['mousemove', 'touchstart', 'touchmove'], storeData)

	// Track additional key-down/up for the utility keys.
	const processKeyPress = (event) => setData(data => ({ ...data, keys: getUtilKeys(event) }))
	useEventListener(['keydown', 'keyup'], processKeyPress)

	// Return the known data.
	return data
}

// useMousePosition returns the position of the mouse in client coordinates, as a Vector.
export function useMousePosition() {
	return useMouseData().position
}

// useMousePositionRelative returns the position of the mouse in client coordinates relative to a given element reference. In case anything is not known yet, null is returned.
export function useMousePositionRelative(element) {
	// Acquire all data.
	const position = useMousePosition()
	const elementRect = useBoundingClientRect(element)

	// Combine data where possible.
	if (!position || !elementRect)
		return null
	return new Vector(position.x - elementRect.x, position.y - elementRect.y)
}

// useBoundingClientRect takes an element and tracks the BoundingClientRect. It only updates it on changes to the element and on scrolls, improving efficiency.
export function useBoundingClientRect(element) {
	const [rect, setRect] = useState(null)

	// Create a handler that updates the rect.
	const updateElementPosition = useStaggeredFunction(() => {
		if (element)
			setRect(element.getBoundingClientRect())
	}, [element, setRect])

	// Listen for updates to the rect.
	useEffect(() => updateElementPosition(), [element, updateElementPosition]) // Changes in the rectangle.
	useResizeObserver(window?.document?.body, updateElementPosition) // Window/body resize.
	useResizeObserver(element, updateElementPosition) // Element resize.
	useEventListener('scroll', updateElementPosition) // Window scrolling.
	useEventListener('swipe', updateElementPosition) // Swiper swiping.
	useEventListener('swipeEnd', updateElementPosition) // Swiper swiping.

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

// useForceUpdateEffect forces an update of the component as an effect, updating it after its render. This is useful if we need an update after the references have been established.
export function useForceUpdateEffect() {
	const forceUpdate = useForceUpdate()
	useEffect(() => forceUpdate(), [forceUpdate])
}

// useDimension takes a field ref and a function that returns a dimension. (Or the function can also be the name of a property, like "offsetWidth".) This function is called on every resize of the said object. If required, an extra useUpdateCallback can be implemented. This is for instance a listener that listens to other events and fires the update function on a change in the value it itself is monitoring.
export function useDimension(fieldRef, dimensionFunc, useUpdateCallback = () => { }) {
	const [dimension, setDimension] = useState()
	if (typeof dimensionFunc === 'string') {
		const dimensionString = dimensionFunc
		dimensionFunc = elem => elem[dimensionString]
	}
	const update = () => fieldRef.current && setDimension(dimensionFunc(fieldRef.current))

	// Update upon field loading.
	const field = fieldRef.current
	const updateRef = useLatest(update)
	useEffect(() => {
		if (field)
			updateRef.current()
	}, [field, updateRef])

	// Apply remaining updates.
	useResizeObserver(fieldRef, () => update()) // Update upon a resize of the app window.
	useUpdateCallback(() => update()) // Update on specifically indicated events too.
	return dimension
}

// getHTMLElement will take an HTML element or a ref to one and ensures that it returns an HTML element, or null if it cannot find one.
export function getHTMLElement(obj) {
	if (obj instanceof HTMLElement)
		return obj
	if (obj && obj.current instanceof HTMLElement)
		return obj.current
	return null
}

// ensureHTMLElement will take an HTML element or a ref to one and ensures that it returns an HTML element. It throws an error if it cannot find one.
export function ensureHTMLElement(obj) {
	const result = getHTMLElement(obj)
	if (!result)
		throw new Error(`Invalid HTML Element: could not find an HTML element in the given object. Its type was "${typeof obj}".`)
	return result
}

// useFontFaceObserver checks whether the given font-faces are loaded. This is a copy of the NPM-package use-font-face-observer, which is bugged due to including an outdated version of Javascript in its dev-dependencies. 
export function useFontFaceObserver(fontFaces, options = {}) {
	const { testString, timeout } = options

	const [isResolved, setIsResolved] = useState(false)
	const fontFacesString = JSON.stringify(fontFaces)

	useEffect(() => {
		const promises = JSON.parse(fontFacesString).map(({ family, weight, style, stretch }) => new FontFaceObserver(family, { weight, style, stretch }).load(testString, timeout))
		Promise.all(promises).then(() => setIsResolved(true))
	}, [fontFacesString, testString, timeout])

	return isResolved
}

// useStaggeredFunction turns a function into a staggered function. First of all, when calling the function, it's not called directly, but on a zero-timeout. Second of all, if it is called multiple times before being executed, it's only executed once.
export function useStaggeredFunction(func) {
	const funcRef = useLatest(func)
	const timeoutRef = useRef()
	return useStableCallback((...args) => {
		if (timeoutRef.current === undefined) {
			timeoutRef.current = setTimeout(() => {
				func(...args)
				timeoutRef.current = undefined
			}, [timeoutRef])
		}
	}, [funcRef, timeoutRef])
}

// useThrottledFunction takes a function to be called. It returns a function to call this function. However, this function is throttled: only when it's not been called recently will the call go through. Here "recently" means "within the last [time] milliseconds". Optionally, an "onDeny" function can be given too, which is called whenever a call is blocked.
export function useThrottledFunction(func, time = 25, onDeny) {
	const lastTimeRef = useRef()
	return useStableCallback((...args) => {
		const lastTime = lastTimeRef.current
		const currentTime = new Date().getTime()
		if (lastTime === undefined || lastTime + time <= currentTime) {
			lastTimeRef.current = currentTime
			func(...args)
		} else {
			if (onDeny) {
				onDeny(...args)
			}
		}
	})
}

// Portal takes a target parameter - a DOM object - and then renders the children in there. It checks when the target changes and rerenders when that happens.
export function Portal({ target, children }) {
	return target ? createPortal(children, target) : null
}

// useAnimation takes an animation function and calls it several times per second with both (1) the time since mounting, and (2) the time difference dt since the last call. On the first call dt is undefined.
export function useAnimation(animationFunc) {
	const startTimeRef = useRef()
	const previousTimeRef = useRef()
	const requestRef = useRef()
	const animationFuncRef = useLatest(animationFunc)

	// Set up an animate function that keeps calling itself.
	const animate = useCallback(pageTime => {
		// Calculate all relevant times.
		let dt, time
		if (startTimeRef.current === undefined) {
			startTimeRef.current = pageTime // Remember the starting time.
			time = 0
		} else {
			time = pageTime - startTimeRef.current
			dt = pageTime - previousTimeRef.current
		}
		previousTimeRef.current = pageTime

		// Call the given animation function, and then call itself a tiny bit later.
		animationFuncRef.current(time, dt)
		requestRef.current = requestAnimationFrame(animate)
	}, [startTimeRef, previousTimeRef, animationFuncRef])

	// Start the animation cycle upon mounting.
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(requestRef.current)
	}, [requestRef, animate])
}
