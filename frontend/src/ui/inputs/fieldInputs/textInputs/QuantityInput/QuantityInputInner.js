import { useInputValue } from '../../../Input'

import { Quantity } from './Quantity'

export function QuantityInputInner() {
	const FI = useInputValue()
	return <Quantity {...FI} />
}
