import React from 'react'

import { Par, SubHead, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ p1, p2, V1, V2, T1 }) => <>
	<Par>Een fietspomp heeft de hendel omhoog, en heeft hiermee een inwendig volume van <M>{V1}.</M> De lucht in de fietspomp heeft dezelfde eigenschappen als de omgevingslucht: een temperatuur van <M>{T1}</M> en een druk van <M>{p1}.</M></Par>
	<Par>Vervolgens wordt de hendel van de fietspomp ingedrukt, tot het ventiel richting de fietsband net opengaat. De drukmeter van de pomp geeft <M>{p2}</M> aan. Het volume van de lucht in de pomp is door deze compressie <M>{V2}</M> geworden. Wat is de temperatuur van de gecomprimeerde lucht in de pomp?</Par>
	<InputSpace><Par><FloatUnitInput id="T2" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk de beginsituatie: de fietspomp met de hendel omhoog. Bereken hiervoor, via de gaswet, de massa van de lucht die in de pomp zit.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="m" prelabel={<M>m=</M>} label="Massa" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1s, V1s, T1s, Rs, m }) => {
			return <Par>We zetten allereerst de gegevens van het beginpunt in standaard eenheden. Hiermee vinden we
				<BMList>
					<BMPart>p_1 = {p1s},</BMPart>
					<BMPart>V_1 = {V1s},</BMPart>
					<BMPart>T_1 = {T1s}.</BMPart>
				</BMList>
				Vervolgens zoeken we de gasconstante van lucht op. Deze is <BM>R_s = {Rs}.</BM> De gaswet zegt dat <M>pV = mR_sT.</M> We passen dit toe op punt 1: de fietspomp met de hendel omhoog. Om <M>m</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>R_sT.</M> Het resultaat is <BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1s.float} \cdot {V1s.float})({Rs.float} \cdot {T1s.float}) = {m}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk de eindsituatie: de fietspomp met de hendel ingedrukt. Bereken hiervoor, wederom via de gaswet, de temperatuur van de lucht.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="T2" prelabel={<M>T=</M>} label="Temperatuur" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: ({ p1, V1, T1, p2, V2, p2s, V2s, T1s, T2, m, Rs }) => {
			return <>
				<Par>Als eerste zetten we de eigenschappen van het eindpunt in standaard eenheden: <BMList>
					<BMPart>p_2 = {p2s},</BMPart>
					<BMPart>V_2 = {V2s}.</BMPart>
				</BMList>
					Vervolgens passen we de gaswet <M>pV = mR_sT</M> toe op punt 2: de fietspomp met de hendel ingedrukt. Om deze wet op te lossen voor de temperatuur <M>T</M> delen we beide kanten van de vergelijking door <M>mR_s.</M> Zo vinden we <BM>T_2 = \frac(p_2V_2)(mR_s) = \frac({p2s.float} \cdot {V2s.float})({m.float} \cdot {Rs.float}) = {T2}.</BM>Je kunt dit eventueel nog omrekenen naar <M>{T2.setUnit('dC').setDecimals(0)}.</M> Dit is een stuk warmer dan de begintemperatuur van <M>{T1}.</M> Zo zien we dat lucht bij compressie best veel kan opwarmen.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden dit gehele probleem ook in één keer op kunnen lossen door de dubbele gaswet toe te passen, <BM>\frac(p_1V_1)(T_1) = \frac(p_2V_2)(T_2).</BM> Als we deze vergelijking oplossen voor <M>T_2</M> vinden we direct <BM>T_2 = T_1 \cdot \frac(p_2)(p_1) \cdot \frac(V_2)(V_1) = {T1s.float} \cdot \frac{p2.float}{p1.float} \cdot \frac{V2.float}{V1.float} = {T2}.</BM> Merk op dat we hier zelfs de druk in bar kunnen invullen en het volume in liters, omdat de conversiefactoren toch tegen elkaar weggedeeld worden. De temperatuur moet wel zeker in Kelvin en niet in graden Celsius.</Par>
			</>
		},
	},
]
