import { useFormPartSettings } from './FormPart'

// InputSpace is used to show or hide the input space for forms. It checks if the input space should be shown and then either shows or hides itself.
export function InputSpace({ children }) {
	const { showInputSpace } = useFormPartSettings()
	return showInputSpace ? children : null
}

// AntiInputSpace is the opposite of InputSpace: it shows itself when the input space is NOT visible. Perhaps the text is slightly different in this case, and this component comes in helpful.
export function AntiInputSpace({ children }) {
	const { showInputSpace } = useFormPartSettings()
	return showInputSpace ? null : children
}
