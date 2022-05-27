import React from 'react'

import { temperature as TConversion } from 'step-wise/data/conversions'

import { M, BM, BMList, BMPart } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ Q, Tw, Tc }) => <>
	<Par>In een fabriekshal staan twee grote drukvaten. Het warme vat heeft een temperatuur van <M>{Tw}</M> en het koude vat zit op <M>{Tc}.</M> Vanwege dit temperatuursverschil stroomt er <M>{Q}</M> aan warmte van het warme vat naar het koude. Bereken de totale entropieverandering vanwege deze warmtestroom. Je mag ervan uitgaan dat de vaten groot genoeg zijn dat de temperatuur ervan niet verandert.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dS" prelabel={<M>\Delta S=</M>} label="Entropieverandering" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet de temperaturen in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Tw" prelabel={<M>T_w=</M>} label="Temperatuur warme vat" size="s" />
					<FloatUnitInput id="Tc" prelabel={<M>T_k=</M>} label="Temperatuur koude vat" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Tw, Tc }) => {
			return <Par>We moeten temperaturen gebruiken in Kelvin. Het omzetten gaat via
				<BMList>
					<BMPart>T_w = {Tw.float} + {TConversion.float} = {Tw.simplify()},</BMPart>
					<BMPart>T_k = {Tc.float} + {TConversion.float} = {Tc.simplify()}.</BMPart>
				</BMList>
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de entropieverandering van het koude vat.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dSc" prelabel={<M>\Delta S_k =</M>} label="Entropieverandering koude vat" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { Qc, Tc, dSc } = useSolution()
			return <>
				<Par>De ingaande warmtestroom voor het koude vat is <BM>Q_k = Q = {Qc}.</BM> De entropieverandering valt nu direct te berekenen via de definitie van entropie. Immers, de temperatuur is constant. Zo vinden we,
					<BM>\Delta S_k = \frac(Q_k)(T_k) = \frac{Qc.float}{Tc.float} = {dSc}.</BM>
					Omdat we de warmtestroom in <M>{Qc.unit}</M> hebben ingevoerd, is de eenheid van de entropieverandering ook <M>{dSc.unit}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de entropieverandering van het warme vat.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dSw" prelabel={<M>\Delta S_w =</M>} label="Entropieverandering warme vat" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { Qw, Tw, dSw } = useSolution()
			return <>
				<Par>De ingaande warmtestroom voor het warme vat is hier <BM>Q_w = -Q = {Qw}.</BM> Immers, de warmte stroomt uit dit vat, en dus is de warmtestroom voor dit vat negatief. De entropieverandering volgt nu wederom via
					<BM>\Delta S_w = \frac(Q_w)(T_w) = \frac{Qw.float}{Tw.float} = {dSw}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de totale entropieverandering.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dS" prelabel={<M>\Delta S =</M>} label="Totale entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { dSc, dSw, dS } = useSolution()
			return <>
				<Par>De totale entropieverandering is simpelweg de som van de entropietoenamen op alle plekken. Oftewel, <BM>\Delta S = \Delta S_k + \Delta S_w = {dSc.float} {dSw.float.texWithPM} = {dS}.</BM> Deze waarde is positief, wat volgens de tweede hoofdwet altijd het geval moet zijn.</Par>
			</>
		},
	},
]