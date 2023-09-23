import { useInputValue } from '../../../Input'

import { Float } from './Float'

export function FloatInputInner() {
	const FI = useInputValue()
	return <Float {...FI} />
}
