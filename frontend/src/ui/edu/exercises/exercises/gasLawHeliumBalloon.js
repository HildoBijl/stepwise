import React from 'react'

import { massGram as mConversion, temperature as TConversion, pressure as pConversion } from 'step-wise/data/conversions'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ m, T, p }) => <>
	<Par>We blazen een ballon op met heliumgas. We gebruiken hierbij <M>{m}</M> van dit gas. Uiteindelijk is de temperatuur van de ballon <M>{T}</M> en de druk <M>{p}.</M> Hoe groot is de ballon dan?</Par>
	<InputSpace><Par><FloatUnitInput id="V" prelabel={<M>V=</M>} label="Volume" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet alle gegeven waarden in standaard eenheden.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="m" prelabel={<M>m=</M>} label="Massa" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="T" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Substep>
					<Substep ss={3}><FloatUnitInput id="p" prelabel={<M>p=</M>} label="Druk" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T, p }) => {
			const mInG = m
			const mInKG = m.setUnit('kg')
			const TInKelvin = T.setUnit('K')
			const pInBar = p
			const pInPa = p.setUnit('Pa')
			return <>
				<Par>De standaard eenheid van massa is de kilogram. Om van gram naar kilogram te gaan gebruiken we een conversiefactor van <M>{mConversion}.</M> Hiermee wordt de massa <BM>m = \frac{mInG}{mConversion} = {mInKG}.</BM></Par>
				<Par>De standaard eenheid van temperatuur is de Kelvin. Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we <BM>T = {T.float} + {TConversion.float} = {TInKelvin}.</BM></Par>
				<Par>De standaard eenheid van druk is Pascal. Om van bar naar Pascal te gaan gebruiken we een conversiefactor van <M>{pConversion}.</M> Hiermee wordt de druk <BM>p = {pInBar} \cdot {pConversion} = {pInPa}.</BM></Par>
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
			const { Rs } = useSolution()
			return <Par>De specifieke gasconstante van helium is <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gaswet het volume van het gas in de ballon.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="V" prelabel={<M>V=</M>} label="Volume" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { p, V, m, Rs, T } = useSolution()
			return <Par>De gaswet luidt <BM>pV = mR_sT.</BM> Om <M>V</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>p.</M> Het resultaat is <BM>V = \frac(mR_sT)(p) = \frac({m.float} \cdot {Rs.float} \cdot {T.float})({p.float}) = {V}.</BM> Om dit wat intuïtiever te krijgen kunnen we dit nog omrekenen naar liters: het is <M>{V.setUnit('l')}.</M> Dat is grofweg wat we zouden verwachten van een ballon.</Par>
		},
	},
]