import { useInputValue } from '../../Input'

import { Unit } from './Unit'

export function UnitInputInner() {
	const FI = useInputValue()
	return <Unit {...FI} />
}
