import React from 'react'

import { Par, SubHead, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p1, p2, T1, T2, V1 }) => <>
	<Par>Een grote weerballon wordt met helium gevuld. Bij de grond is de druk <M>{p1}</M> en de temperatuur <M>{T1}.</M> In deze omstandigheden is het volume van de weerballon <M>{V1}.</M></Par>
	<Par>Vervolgens wordt de weerballon opgelaten. Op tientallen kilometers hoogte is de druk nog maar <M>{p2}</M> en de temperatuur <M>{T2}.</M> Wat is op deze hoogte het volume van de weerballon?</Par>
	<InputSpace><Par><FloatUnitInput id="V2" prelabel={<M>V=</M>} label="Volume" size="s" /></Par></InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bekijk de beginsituatie: de weerballon op de grond. Bereken hiervoor, via de gaswet, de massa van het helium in de ballon.</Par>
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
				Vervolgens zoeken we de gasconstante van helium op. Deze is <BM>R_s = {Rs}.</BM> De gaswet zegt dat <M>pV = mR_sT.</M> We passen dit toe op punt 1: de weerballon op de grond. Om <M>m</M> hieruit op te lossen delen we beide kanten van de vergelijking door <M>R_sT.</M> Het resultaat is <BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1s.float} \cdot {V1s.float})({Rs.float} \cdot {T1s.float}) = {m}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bekijk de eindsituatie: de weerballon op grote hoogte. Bereken hiervoor, wederom via de gaswet, het volume van het helium in de ballon.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="V2" prelabel={<M>V=</M>} label="Volume" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: ({ T1, T2, p1s, p2s, V1s, V2, T2s, m, Rs }) => {
			return <>
				<Par>Als eerste zetten we de eigenschappen van het eindpunt in standaard eenheden:
					<BMList>
						<BMPart>p_2 = {p2s},</BMPart>
						<BMPart>T_2 = {T2s}.</BMPart>
					</BMList>
					Vervolgens passen we de gaswet <M>pV = mR_sT</M> toe op punt 2: de weerballon hoog in de lucht. Om deze wet op te lossen voor het volume <M>V</M> delen we beide kanten van de vergelijking door <M>p.</M> Zo vinden we <BM>V_2 = \frac(mR_sT_2)(p_2) = \frac({m.float} \cdot {Rs.float} \cdot {T2s.float})({p2s.float}) = {V2}.</BM> Dit is een stuk groter dan voorheen, maar dat is logisch gezien de erg lage druk hoog in de lucht.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden dit gehele probleem ook in één keer op kunnen lossen door de dubbele gaswet toe te passen, <BM>\frac(p_1V_1)(T_1) = \frac(p_2V_2)(T_2).</BM> Als we deze vergelijking oplossen voor <M>V_2</M> vinden we direct <BM>V_2 = V_1 \cdot \frac(p_1)(p_2) \cdot \frac(T_2)(T_1) = {V1s.float} \cdot \frac{p1s.float}{p2s.float} \cdot \frac{T2.float}{T1.float} = {V2}.</BM> Merk op dat we hier zelfs de druk in bar hadden kunnen invullen, omdat de conversiefactoren toch tegen elkaar weggedeeld worden. De temperatuur moet wel zeker in Kelvin en niet in graden Celsius.</Par>
			</>
		},
	},
]
