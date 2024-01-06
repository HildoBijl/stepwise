import React from 'react'

import { temperature as TConversion } from 'step-wise/data/conversions'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ type, medium, T1o, T2o, mo }) => <>
	<Par>We voeren een {type === 0 ? 'isobaar' : type === 1 ? 'isochoor' : 'isentroop'} proces uit met <M>{mo}</M> {Dutch[medium]}. De temperatuur daalt bij dit proces van <M>{T1o}</M> naar <M>{T2o}.</M> Wat is de entropieverandering tijdens dit proces?</Par>
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
					<FloatUnitInput id="T1" prelabel={<M>T_1=</M>} label="Begintemperatuur" size="s" />
					<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Eindtemperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ T1, T2 }) => {
			return <Par>We moeten temperaturen gebruiken in Kelvin. Het omzetten gaat via
				<BMList>
					<BMPart>T_1 = {T1.float} + {TConversion.float} = {T1.simplify()},</BMPart>
					<BMPart>T_2 = {T1.float} + {TConversion.float} = {T2.simplify()}.</BMPart>
				</BMList>
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Vind de soortelijke warmte die bij dit proces hoort.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="c" prelabel={<M>c =</M>} label="Soortelijke warmte" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ type, medium, c }) => {
			if (type === 0)
				return <Par>Bij een isobaar proces geldt <M>c = c_p.</M> Verder geldt voor {Dutch[medium]} dat <M>c_p = {c}.</M></Par>
			if (type === 1)
				return <Par>Bij een isochoor proces geldt <M>c = c_v.</M> Verder geldt voor {Dutch[medium]} dat <M>c_v = {c}.</M></Par>
			return <Par>Bij een isentroop proces is er geen warmte-uitwisseling. Dus geldt altijd <M>c=0.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met behulp van deze waarde van <M>c</M> de verandering in entropie.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dS" prelabel={<M>\Delta S =</M>} label="Entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ type, m, c, T1, T2, dS }) => {
			if (type === 2)
				return <Par>De entropieverandering volgt direct uit de formule <BM>\Delta S = m c \ln\left(\frac(T_2)(T_1)\right) = {m.float} \cdot {c.float} \cdot \ln\left(\frac{T2.float}{T1.float}\right) = {dS}.</BM> Dit is logisch: bij een isentroop proces is er geen warmte-uitwisseling, waardoor dan altijd <M>Q = 0</M> geldt, en hiermee dus ook <M>\Delta S = 0.</M></Par>
			return <>
				<Par>De entropieverandering volgt direct uit de formule <BM>\Delta S = m c \ln\left(\frac(T_2)(T_1)\right) = {m.float} \cdot {c.float} \cdot \ln\left(\frac{T2.float}{T1.float}\right) = {dS}.</BM> Dit is negatief, wat logisch is: de temperatuur daalt en dus is het zeer waarschijnlijk dat er warmte afgevoerd wordt. Hiermee neemt de entropie dus af.</Par>
				<Par>Deze entropie-afname is overigens geen overtreding van de tweede hoofdwet. De warmte stroomt immers ergens naar toe, en daar zal de entropie ongetwijfeld meer toenemen. Het is dus niet zo dat de totale entropieverandering in het universum negatief is.</Par>
			</>
		},
	},
]
