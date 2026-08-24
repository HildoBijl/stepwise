import React from 'react'

import { kilogramsToGramsFactor as mConversion, celsiusToKelvinOffset as TConversion, barToPascalFactor as pConversion } from '@step-wise/physics-data'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { QuantityInput } from 'ui/inputs'
import { StepExercise, Substep } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ m, T, p }) => <>
	<Par>We blazen een ballon op met heliumgas. We gebruiken hierbij <M>{m}</M> van dit gas. Uiteindelijk is de temperatuur van de ballon <M>{T}</M> en de druk <M>{p}.</M> Hoe groot is de ballon dan?</Par>
	<InputSpace><Par><QuantityInput id="V" prelabel={<M>V=</M>} label="Volume" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><QuantityInput id="ms" prelabel={<M>m=</M>} label="Massa" size="s" /></Substep>
					<Substep ss={2}><QuantityInput id="Ts" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
					<Substep ss={3}><QuantityInput id="ps" prelabel={<M>p=</M>} label="Druk" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T, p, ms, Ts, ps }) => {
			return <>
				<Par>De standaard eenheid van massa is de kilogram. Om van gram naar kilogram te gaan gebruiken we een conversiefactor van <M>{mConversion}.</M> Hiermee wordt de massa <BM>m = \frac{m}{mConversion} = {ms}.</BM></Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.value}</M> bij op. Hiermee krijgen we <BM>T = {T.value} + {TConversion.value} = {Ts}.</BM></Par>
				<Par>De standaard eenheid van druk is Pascal. Om van bar naar Pascal te gaan gebruiken we een conversiefactor van <M>{pConversion}.</M> Hiermee wordt de druk <BM>p = {p} \cdot {pConversion} = {ps}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de specifieke gasconstante van het gas op, in standaard eenheden.</Par>
			<InputSpace>
				<Par><QuantityInput id="Rs" prelabel={<M>R_s=</M>} label="Specifieke gasconstante" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: ({ Rs }) => {
			return <Par>De specifieke gasconstante van helium is <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet het volume van het gas in de ballon.</Par>
			<InputSpace>
				<Par><QuantityInput id="V" prelabel={<M>V=</M>} label="Volume" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: ({ ps, V, ms, Rs, Ts }) => {
			return <Par>De gaswet luidt <BM>pV = mR_sT.</BM> Om <M>V</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>p.</M> Het resultaat is <BM>V = \frac(mR_sT)(p) = \frac({ms.value} \cdot {Rs.value} \cdot {Ts.value})({ps.value}) = {V}.</BM> Om dit wat intuïtiever te krijgen kunnen we dit nog omrekenen naar liters: het is <M>{V.setUnit('l')}.</M> Dat is grofweg wat we zouden verwachten van een ballon.</Par>
		},
	},
]
