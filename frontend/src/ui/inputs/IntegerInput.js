import React, { useContext } from 'react'

import { filterToInteger } from '../../util/numbers'
import { ExerciseContext } from '../components/Exercise'

export default function IntegerInput({ name, positive = false }) {
	const { input, prevInput, result, setInputParameter, done } = useContext(ExerciseContext)

	const value = (input && input[name]) || ''
	const editable = !done && (!result || result[name] === undefined)

	const handleChange = evt => {
		const input = evt.target.value
		let number = filterToInteger(input, positive)
		if (number !== '' && number !== '-')
			number = parseInt(number)
		setInputParameter(name, number)
	}

	// ToDo next: provide feedback on input, prevInput, result.

	return <input type="text" name={name} value={value} disabled={!editable} onChange={handleChange} />
}