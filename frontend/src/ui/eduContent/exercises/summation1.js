import React from 'react'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <Translation>
		<Par>Calculate the addition <M>{a} + {b}</M>.</Par>
		<InputSpace>
			<Par><IntegerInput id="ans" label="Answer" prelabel={<M>{a} + {b} =</M>} size="s" /></Par>
		</InputSpace>
	</Translation>
}

function Solution({ a, b }) {
	return <Par><Translation>The solution is <M>{a} + {b} = {a + b}</M>.</Translation></Par>
}
