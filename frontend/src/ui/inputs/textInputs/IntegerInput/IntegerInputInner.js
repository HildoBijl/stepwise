import { useInputValue } from '../../Input'

import { Integer } from './Integer'

export function IntegerInputInner() {
	const FI = useInputValue()
	return <Integer {...FI} />
}
