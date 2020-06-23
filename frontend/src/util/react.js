import { useState, useRef } from 'react'

// useCounter is a function that returns [counter, increment], where counter is an integer and increment is a function that, when called, increments said counter.
export function useCounter(initialValue = 0) {
	const [counter, setCounter] = useState(initialValue)
	return [counter, () => setCounter(counter + 1)]
}

// useRefWithValue is used to directly store a value in a ref. This is useful when you have use-only functions in a useEffect function: plug them in a ref, apply the ref in the useEffect function and the function isn't triggered so much.
export function useRefWithValue(value) {
	const ref = useRef()
	ref.current = value
	return ref
}