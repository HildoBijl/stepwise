import React from 'react'

import { pressure as pConversion, volumeCubicCentimeter as VConversion, temperature as TConversion } from 'step-wise/data/conversions'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, Substep, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p, V, T }) => <>
	<Par>Een gloeilamp met inhoud <M>{V}</M> is met argongas gevuld. De druk binnen de gloeilamp is gemeten als <M>{p}.</M> De gloeilamp staat uit, waardoor zijn temperatuur gelijk is aan de omgevingstemperatuur <M>{T}.</M> Bereken de massa van het argongas.</Par>
	<InputSpace><Par><FloatUnitInput id="m" prelabel={<M>m=</M>} label="Massa" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="Vs" prelabel={<M>V=</M>} label="Volume" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="ps" prelabel={<M>p=</M>} label="Druk" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="Ts" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ V, Vs, p, ps, T, Ts }) => {
			const pInBar = p.setUnit('bar')
			return <>
				<Par>De standaard eenheid van volume is de kubieke meter. Om van kubieke centimeter naar kubieke meter te gaan gebruiken we een conversiefactor van <M>{VConversion}.</M> Het volume is daarmee <BM>V = \frac{V}{VConversion} = {Vs}.</BM></Par>
				<Par>De standaard eenheid van druk is Pascal. Als eerste schrijven we <M>p = {p}</M> als <M>p = {pInBar}.</M> Vervolgens zetten we dit om. De conversiefactor van bar naar Pascal is <M>{pConversion}.</M> Dit vertelt ons dat de druk gelijk is aan <BM>p = {pInBar} \cdot {pConversion} = {ps}.</BM></Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we <BM>T = {T.float} + {TConversion.float} = {Ts}.</BM></Par>
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
		Solution: ({ Rs }) => {
			return <Par>De specifieke gasconstante van argon is <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet de massa van het gas in de gloeilamp.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="m" prelabel={<M>m=</M>} label="Massa" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: ({ Rs, m, ps, Vs, Ts }) => {
			return <Par>De gaswet zegt <BM>pV = mR_sT.</BM> Om <M>m</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>R_sT.</M> Het resultaat is <BM>m = \frac(pV)(R_sT) = \frac({ps.float} \cdot {Vs.float})({Rs.float} \cdot {Ts.float}) = {m}.</BM></Par>
		},
	},
]
