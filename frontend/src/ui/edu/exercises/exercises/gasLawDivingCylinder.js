import React from 'react'

import { temperature as TConversion, volumeLiter as VConversion } from 'step-wise/data/conversions'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useCorrect } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ V, m, T }) => <>
	<Par>Een duiker heeft een duikfles van <M>{V}</M> op zijn rug, gevuld met <M>{m}</M> zuurstof. Bij een temperatuur van <M>{T}</M>, bereken de druk in de fles.</Par>
	<InputSpace><Par><FloatUnitInput id="p" prelabel={<M>p=</M>} label="Druk" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="V" prelabel={<M>V=</M>} label="Volume" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="m" prelabel={<M>m=</M>} label="Massa" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="T" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ V, m, T }) => {
			return <>
				<Par>De standaard eenheid van volume is de kubieke meter. We gebruiken hierbij een conversiefactor van <M>{VConversion}.</M> Het volume is vervolgens <BM>V = \frac{V}{VConversion} = {V.simplify()}.</BM></Par>
				<Par>De standaard eenheid van massa is de kilogram. De massa staat al in die eenheid, waardoor we gelijk <M>m = {m}</M> op kunnen schrijven.</Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we <BM>T = {T.float} + {TConversion.float} = {T.setUnit('K')}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de specifieke gasconstante van het gas op, in standaard eenheden.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="Rs" prelabel={<M>R_s=</M>} label="Specifieke gasconstante" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs } = useCorrect()
			return <Par>De specifieke gasconstante van zuurstof is <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet de druk van het gas in de duikfles.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="p" prelabel={<M>p=</M>} label="Druk" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { p, V, m, Rs, T } = useCorrect()
			return <Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Om <M>p</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>V.</M> Het resultaat is <BM>p = \frac(mR_sT)(V) = \frac({m.float} \cdot {Rs.float} \cdot {T.float})({V.float}) = {p}.</BM> Dit is gelijk aan <M>{p.setUnit('bar').useDecimals(0)}</M> wat reëel is voor een duikfles.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['p', 'V', 'm', 'Rs', 'T'], exerciseData)
}

