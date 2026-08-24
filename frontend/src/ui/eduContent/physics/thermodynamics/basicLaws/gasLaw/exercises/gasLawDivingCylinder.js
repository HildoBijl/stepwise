import React from 'react'

import { celsiusToKelvinOffset as TConversion, cubicMetersToLitersFactor as VConversion } from '@step-wise/physics-data'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { QuantityInput } from 'ui/inputs'
import { StepExercise, Substep } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ V, m, T }) => <>
	<Par>Een duiker heeft een duikfles van <M>{V}</M> op zijn rug, gevuld met <M>{m}</M> zuurstof. Bij een temperatuur van <M>{T}</M>, bereken de druk in de fles.</Par>
	<InputSpace><Par><QuantityInput id="p" prelabel={<M>p=</M>} label="Druk" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><QuantityInput id="Vs" prelabel={<M>V=</M>} label="Volume" size="s" /></Substep>
					<Substep ss={2}><QuantityInput id="ms" prelabel={<M>m=</M>} label="Massa" size="s" /></Substep>
					<Substep ss={3}><QuantityInput id="Ts" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ V, m, T, Vs, Ts }) => {
			return <>
				<Par>De standaard eenheid van volume is de kubieke meter. We gebruiken hierbij een conversiefactor van <M>{VConversion}.</M> Het volume is vervolgens <BM>V = \frac{V}{VConversion} = {Vs}.</BM></Par>
				<Par>De standaard eenheid van massa is de kilogram. De massa staat al in die eenheid, waardoor we gelijk <M>m = {m}</M> op kunnen schrijven.</Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.value}</M> bij op. Hiermee krijgen we <BM>T = {T.value} + {TConversion.value} = {Ts}.</BM></Par>
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
			return <Par>De specifieke gasconstante van zuurstof is <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet de druk van het gas in de duikfles.</Par>
			<InputSpace>
				<Par><QuantityInput id="p" prelabel={<M>p=</M>} label="Druk" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: ({ p, Vs, m, Rs, Ts }) => {
			return <Par>De gaswet zegt dat <BM>pV = mR_sT.</BM> Om <M>p</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>V.</M> Het resultaat is <BM>p = \frac(mR_sT)(V) = \frac({m.value} \cdot {Rs.value} \cdot {Ts.value})({Vs.value}) = {p}.</BM> Dit is gelijk aan <M>{p.setUnit('bar').setDecimals(0)}</M> wat reëel is voor een duikfles.</Par>
		},
	},
]
