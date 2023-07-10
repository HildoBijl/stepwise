import { useCallback } from 'react'

import { useFieldControllerContext } from '../provider'

// useFieldActivation can take a field ID and get tools to check if the field is active and activate/deactivate it.
export function useFieldActivation(id) {
	const { isActive, activate, deactivate } = useFieldControllerContext()
	const isFieldActive = isActive(id)
	const activateField = useCallback(() => activate(id), [id, activate])
	const deactivateField = useCallback(() => deactivate(id), [id, deactivate])
	return [isFieldActive, activateField, deactivateField]
}
