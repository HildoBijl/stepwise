import React from 'react'

import { useInputValue } from 'ui/inputs'

import { InputLoad } from './InputLoad'

export function InputLoads() {
	const loads = useInputValue()
	return loads.map((load, index) => <InputLoad key={index} index={index} load={load} />)
}
