import React from 'react'

import StepExercise from '../exerciseTypes/StepExercise'
import { Par } from '../exerciseTypes/util/containers'
import { M } from '../../../util/equations'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace } from '../form/InputSpace'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ a, b, c, d }) => <>
	<Par>Bereken <M>{a} \cdot {b} + {c} \cdot {d}.</M></Par>
	<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a} \cdot {b} + {c} \cdot {d} =</M>} label="Antwoord" size="s" autofocus={true} /></Par></InputSpace>
</>

const steps = [
	{
		Problem: ({ a, b, c, d }) => <>
			<Par>Bereken <M>{a} \cdot {b}.</M></Par>
			<InputSpace><Par><IntegerInput id="p1" prelabel={<M>{a} \cdot {b} =</M>} label="Tussenantwoord" size="s" autofocus={true} /></Par></InputSpace>
		</>,
		Solution: ({ a, b, c, d }) => <Par>Merk op dat vermenigvuldigen voorrang heeft op optellen. Eerst berekenen we dus <M>{a} \cdot {b} = {a * b}.</M></Par>,
	},
	{
		Problem: ({ a, b, c, d }) => <>
			<Par>Bereken <M>{c} \cdot {d}.</M></Par>
			<InputSpace><Par><IntegerInput id="p2" prelabel={<M>{c} \cdot {d} =</M>} label="Tussenantwoord" size="s" autofocus={true} /></Par></InputSpace>
		</>,
		Solution: ({ a, b, c, d }) => <Par>Net zo berekenen we eerst de andere vermenigvuldiging, waarmee we <M>{c} \cdot {d} = {c * d}</M> vinden.</Par>,
	},
	{
		Problem: ({ a, b, c, d }) => <>
			<Par>Bereken <M>{a * b} + {c * d}.</M></Par>
			<InputSpace><Par><IntegerInput id="ans" prelabel={<M>{a * b} + {c * d} =</M>} label="Antwoord" size="s" autofocus={true} /></Par></InputSpace>
		</>,
		Solution: ({ a, b, c, d }) => <Par>Tenslotte tellen we alles bij elkaar op. Hiermee vinden we het eindantwoord <M>{a * b} + {c * d} = {a * b + c * d}.</M></Par>,
	},
]
