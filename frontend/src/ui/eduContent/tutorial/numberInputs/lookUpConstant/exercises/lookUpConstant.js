import React from 'react'

import * as constants from 'step-wise/data/constants'

import { Translation, useGetTranslation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

import { tableValues } from '../References'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ constant }) {
	const getTranslation = useGetTranslation()
	return <>
		<Par><Translation entry="text">Look up {{ constantDescription: getTranslation(`references.constants.${constant}`, undefined, false) }} <M>{tableValues[constant].symbol}</M>.</Translation></Par>
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>{constant} =</M>} label={<Translation entry="label">Enter the constant here</Translation>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ constant }) {
	return <Par><Translation>As can be looked up in the attachment, the value of <M>{tableValues[constant].symbol}</M> is <M>{constants[constant]}</M>.</Translation></Par>
}
