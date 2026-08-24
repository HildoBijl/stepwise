import React from 'react'

import { celsiusToKelvinOffset as TConversion } from '@step-wise/physics-data'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { QuantityInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ Qo, Two, Tco }) => <>
	<Par>In een fabriekshal staan twee grote drukvaten. Het warme vat heeft een temperatuur van <M>{Two}</M> en het koude vat zit op <M>{Tco}.</M> Vanwege dit temperatuursverschil stroomt er <M>{Qo}</M> aan warmte van het warme vat naar het koude. Bereken de totale entropieverandering vanwege deze warmtestroom. Je mag ervan uitgaan dat de vaten groot genoeg zijn dat de temperatuur ervan niet verandert.</Par>
	<InputSpace>
		<Par>
			<QuantityInput id="dS" prelabel={<M>\Delta S=</M>} label="Entropieverandering" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Zet de temperaturen in eenheden waarmee we mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="Tw" prelabel={<M>T_w=</M>} label="Temperatuur warme vat" size="s" />
					<QuantityInput id="Tc" prelabel={<M>T_k=</M>} label="Temperatuur koude vat" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Tw, Tc }) => {
			return <Par>We moeten temperaturen gebruiken in Kelvin. Het omzetten gaat via
				<BMList>
					<BMPart>T_w = {Tw.value} + {TConversion.value} = {Tw.simplify()},</BMPart>
					<BMPart>T_k = {Tc.value} + {TConversion.value} = {Tc.simplify()}.</BMPart>
				</BMList>
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de entropieverandering van het koude vat.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="dSc" prelabel={<M>\Delta S_k =</M>} label="Entropieverandering koude vat" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Qc, Tc, dSc }) => {
			return <>
				<Par>De ingaande warmtestroom voor het koude vat is <BM>Q_k = Q = {Qc}.</BM> De entropieverandering valt nu direct te berekenen via de definitie van entropie. Immers, de temperatuur is constant. Zo vinden we,
					<BM>\Delta S_k = \frac(Q_k)(T_k) = \frac{Qc.value}{Tc.value} = {dSc}.</BM>
					Omdat we de warmtestroom in <M>{Qc.unit}</M> hebben ingevoerd, is de eenheid van de entropieverandering ook <M>{dSc.unit}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de entropieverandering van het warme vat.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="dSw" prelabel={<M>\Delta S_w =</M>} label="Entropieverandering warme vat" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Qw, Tw, dSw }) => {
			return <>
				<Par>De ingaande warmtestroom voor het warme vat is hier <BM>Q_w = -Q = {Qw}.</BM> Immers, de warmte stroomt uit dit vat, en dus is de warmtestroom voor dit vat negatief. De entropieverandering volgt nu wederom via
					<BM>\Delta S_w = \frac(Q_w)(T_w) = \frac{Qw.value}{Tw.value} = {dSw}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de totale entropieverandering.</Par>
			<InputSpace>
				<Par>
					<QuantityInput id="dS" prelabel={<M>\Delta S =</M>} label="Totale entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ dSc, dSw, dS }) => {
			return <>
				<Par>De totale entropieverandering is simpelweg de som van de entropietoenamen op alle plekken. Oftewel, <BM>\Delta S = \Delta S_k + \Delta S_w = {dSc.value} {dSw.value.texWithSign} = {dS}.</BM> Deze waarde is positief, wat volgens de tweede hoofdwet altijd het geval moet zijn.</Par>
			</>
		},
	},
]
