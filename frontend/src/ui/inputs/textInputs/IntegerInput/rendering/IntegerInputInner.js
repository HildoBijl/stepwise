import { useInputValue } from '../../../Input'

import { CharString } from '../../TextInput'

export default function IntegerInputInner() {
	const { type, value, cursor } = useInputValue()
	if (type !== 'Integer')
		throw new Error(`Invalid type: tried to render an Integer inside an Input Field, but the Input Field had an object with type "${type}".`)
	return <CharString str={value} cursor={cursor} />
}
