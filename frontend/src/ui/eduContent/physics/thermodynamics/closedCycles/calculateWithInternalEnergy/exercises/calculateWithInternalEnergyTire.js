import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ T1, p2, V2, T2 }) => <>
	<Par>Een bij aanvang lege fietsband wordt opgepompt met lucht. De ingaande lucht heeft de omgevingstemperatuur, <M>{T1}.</M> Na afloop heeft de lucht in de fietsband een druk van <M>{p2}</M>, een volume van <M>{V2}</M> en een temperatuur van <M>{T2}.</M> Wat is de toename <M>\Delta U</M> in inwendige energie van de lucht die in de fietsband is gepompt?</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="dU" prelabel={<M>\Delta U=</M>} label={<span>Verandering in <M>U</M></span>} size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken eerst via de gaswet de massa van de lucht die na afloop in de fietsband zit.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="m" prelabel={<M>m=</M>} label="Massa" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ Rs, p2s, V2s, T2s, m }) => {
			return <Par>
				Na het oppompen van de band heeft de lucht in de band een druk <M>p_2 = {p2s},</M> een volume <M>V_2 = {V2s}</M> en een temperatuur <M>T_2 = {T2s}.</M> De gaswet zegt nu dat de massa van deze lucht gelijk is aan
				<BM>m = \frac(p_2V_2)(R_sT_2) = \frac({p2s.float} \cdot {V2s.float})({Rs.float} \cdot {T2s.float}) = {m}.</BM>
				Dit is niet een erg hoge massa, wat logisch is: lucht weegt ook niet zoveel.
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de soortelijke warmte bij constant volume <M>c_v</M> op voor lucht.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="cv" prelabel={<M>c_v =</M>} label={<span><M>c_v</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cv }) => {
			return <>
				<Par>Voor lucht geldt <M>c_v = {cv}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de temperatuurstoename <M>\Delta T</M> hoeveel de inwendige energie van de lucht is toegenomen bij het oppompen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dU" prelabel={<M>\Delta U=</M>} label={<span>Verandering in <M>U</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cv, T1s, T2s, m, dU }) => {
			return <Par>
				De formule die we hierbij kunnen gebruiken is
				<BM>\Delta U = mc_v \Delta T.</BM>
				Getallen invullen geeft
				<BM>\Delta U = mc_v \left(T_2 - T_1\right) = {m.float} \cdot {cv.float} \cdot \left({T2s.float} - {T1s.float}\right) = {dU}.</BM>
				Het was niet handig om dit te berekenen via <M>Q</M> en <M>W.</M> Immers weten we de exacte beginsituatie van de lucht niet; alleen de temperatuur. Maar omdat voor ideale gassen de inwendige energie direct gelinkt is aan de temperatuur konden we dit toch zo berekenen.
			</Par>
		},
	},
]
