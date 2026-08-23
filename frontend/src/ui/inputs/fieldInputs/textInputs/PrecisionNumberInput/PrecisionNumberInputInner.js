import { useInputValue } from '../../../Input'

import { PrecisionNumber } from './PrecisionNumber'

export function PrecisionNumberInputInner() {
	const FI = useInputValue()
	return <PrecisionNumber {...FI} />
}
