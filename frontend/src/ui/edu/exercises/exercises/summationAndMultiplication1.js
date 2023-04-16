import React from 'react'

import { Par, M } from 'ui/components'
import IntegerInput from 'ui/form/inputs/IntegerInput'
import { InputSpace } from 'ui/form/FormPart'

import StepExercise from '../types/StepExercise'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ a, b, c }) => <>
	<Par>Bereken <M>{a} \cdot {b} + {c}.</M></Par>
	<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a} \cdot {b} + {c} =</M>} label="Antwoord" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: ({ a, b, c }) => <>
			<Par>Bereken <M>{a} \cdot {b}.</M></Par>
			<InputSpace><Par><IntegerInput id="ab" prelabel={<M>{a} \cdot {b} =</M>} label="Tussenantwoord" size="s" /></Par></InputSpace>
		</>,
		Solution: ({ a, b, c }) => <Par>Merk op dat vermenigvuldigen voorrang heeft op optellen. Eerst berekenen we dus <M>{a} \cdot {b} = {a * b}.</M></Par>,
	},
	{
		Problem: ({ a, b, c }) => <>
			<Par>Bereken <M>{a * b} + {c}.</M></Par>
			<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a * b} + {c} =</M>} label="Antwoord" size="s" /></Par></InputSpace>
		</>,
		Solution: ({ a, b, c }) => <Par>Dan tellen we alles bij elkaar op. Hiermee vinden we het eindantwoord <M>{a * b} + {c} = {a * b + c}.</M></Par>,
	},
]
