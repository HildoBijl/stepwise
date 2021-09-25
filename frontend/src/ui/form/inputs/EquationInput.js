import React from 'react'

import ExpressionInput from './ExpressionInput'

export default function EquationInput(props) {
	// Make sure that the settings allow for an equals sign.
	const settings = {
		...(props.settings || {}),
		equals: true,
	}

	return <ExpressionInput {...props} settings={settings} />
}

// ToDo: add in a default validate function that checks if an equation is provided.