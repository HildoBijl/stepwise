import React from 'react'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ x }) {
	return <>
		<Par><Translation entry="text">Enter the number <M>{x}</M>.</Translation></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>{x}=</M>} label={<Translation entry="label">Enter <M>{x}</M> here</Translation>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par><Translation>You can click on the input field and type in the number <M>{x}</M>. For the decimal exponent you use the multiplication star "*". You then don't need to write the "10": the input field will understand automatically. Alternatively, the short-cut "e" (from the scientific notation) is also possible.</Translation></Par>
}
