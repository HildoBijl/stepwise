import { useInputData } from '../provider'

export function useActive() {
	return useInputData().active
}

export function useActivateDeactivate() {
	const { activateField, deactivateField } = useInputData()
	return [activateField, deactivateField]
}
