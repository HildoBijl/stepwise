import { useFieldControllerContext } from '../provider'

// useKeyboardRef and useKeyboard expose the keyboard API to input fields. The useKeyboardRef is more useful for input fields that need a static reference.
export function useKeyboardRef() {
	return useFieldControllerContext().keyboardRef
}
export function useKeyboard() {
	return useKeyboardRef().current
}
