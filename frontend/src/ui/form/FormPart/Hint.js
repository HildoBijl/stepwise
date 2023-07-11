import { useFormPartSettings } from './FormPart'

// Hint is only visible when hints are set to be visible.
export function Hint({ children }) {
	const { showHints } = useFormPartSettings()
	return showHints ? children : null
}

// AntiHint is only visible when hints are set to be hidden.
export function AntiHint({ children }) {
	const { showHints } = useFormPartSettings()
	return showHints ? null : children
}
