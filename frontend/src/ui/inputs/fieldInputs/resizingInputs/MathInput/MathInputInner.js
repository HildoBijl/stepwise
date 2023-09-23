import { useInputValue } from '../../../Input'

import { MathWithCursor } from './MathWithCursor'

export const defaultMathInputInnerOptions = {}

export function MathInputInner() {
	const FI = useInputValue()
	return <MathWithCursor {...FI} />
}
