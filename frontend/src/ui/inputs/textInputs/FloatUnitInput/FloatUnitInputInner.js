import { useInputValue } from '../../Input'

import { FloatUnit } from './FloatUnit'

export function FloatUnitInputInner() {
	const FI = useInputValue()
	return <FloatUnit {...FI} />
}
