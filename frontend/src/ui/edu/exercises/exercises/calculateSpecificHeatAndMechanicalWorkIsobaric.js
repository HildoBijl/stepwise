import React from 'react'

import { Par, M, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'

import { StepExercise } from 'ui/eduTools'
import { useSolution } from 'ui/eduTools'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ T1, T2 }) => {
	return <>
		<Par>In de verbrandingskamer van een vliegtuigmotor wordt continu lucht verwarmd van <M>{T1}</M> tot <M>{T2}.</M> Dit gebeurt bij gelijkblijvende druk. Bereken hoeveel specifieke warmte <M>q</M> er in de lucht wordt gestopt en hoeveel specifieke technische arbeid <M>w_t</M> de lucht verricht tijdens dit proces.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="q" prelabel={<M>q =</M>} label="Specifieke warmte" size="s" />
				<FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke technische arbeid" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Bepaal het soort proces.</Par>
			<InputSpace>
				<MultipleChoice id="process" choices={[
					<span>Dit is een isobaar proces.</span>,
					<span>Dit is een isochoor proces.</span>,
					<span>Dit is een isotherm proces.</span>,
					<span>Dit is een isentroop proces.</span>,
					<span>Dit is alleen een polytroop proces: specifieker kunnen we niet zijn.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er is gegeven dat het proces bij gelijkblijvende druk verloopt. De druk is dus constant, wat op een isobaar proces duidt.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isobaar proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
			<InputSpace>
				<MultipleChoice id="eq" choices={[
					<span><M>q = \frac(k)(k-1) p \left(v_2 - v_1\right)</M> en <M>w_t = 0</M></span>,
					<span><M>q = c_p\left(T_2-T_1\right)</M> en <M>w_t = 0</M></span>,
					<span><M>q = \frac(1)(k-1) v \left(p_2 - p_1\right)</M> en <M>w_t = -\left(p_2v_2 - p_1v_1\right)</M></span>,
					<span><M>q = c_v\left(T_2 - T_1\right)</M> en <M>w_t = -R_s\left(T_2 - T_1\right)</M></span>,
					<span><M>q = pv \ln\left(\frac(v_2)(v_1)\right)</M> en <M>w_t = pv \ln\left(\frac(v_2)(v_1)\right)</M></span>,
					<span><M>q = R_sT \ln\left(\frac(v_2)(v_1)\right)</M> en <M>w_t = R_sT \ln\left(\frac(v_2)(v_1)\right)</M></span>,
					<span><M>q = 0</M> en <M>w_t = -\frac(k)(k-1)\left(p_2v_2 - p_1v_1\right)</M></span>,
					<span><M>q = 0</M> en <M>w_t = -\frac(kR_s)(k-1)\left(T_2 - T_1\right)</M></span>,
					<span><M>q = \frac(c)(R_s) \left(p_2v_2 - p_1v_1\right)</M> en <M>w_t = -\frac(n)(n-1) \left(p_2v_2 - p_1v_1\right)</M></span>,
					<span><M>q = mc\left(T_2 - T_1\right)</M> en <M>w_t = -\frac(nR_s)(n-1)\left(T_2 - T_1\right)</M></span>,
				]} randomOrder={true} pick={5} include={[0, 1]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isobaar proces. We weten echter alleen de temperatuur, en niet de druk of het volume. De formules die we willen gebruiken zijn dus <M>q = c_p\left(T_2-T_1\right)</M> en <M>w_t = 0.</M></Par>
		},
	},
	{
		Problem: ({ gas }) => {
			return <>
				<Par>Zoek voor lucht de waarde van <M>c_p</M> op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="cp" prelabel={<M>c_p =</M>} label={<span><M>c_p</M></span>} size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { cp } = useSolution()

			return <Par>Voor lucht geldt <M>c_p = {cp}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T1" prelabel={<M>T_1 =</M>} label="Temperatuur" size="s" />
					<FloatUnitInput id="T2" prelabel={<M>T_2 =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ T1, T2 }) => {
			return <Par>In de formules staat alleen een temperatuursverschil. Als we een temperatuursverschil berekenen, dan maakt het niet uit of we in graden Celsius of in Kelvin rekenen. We mogen dus <M>T_1 = {T1}</M> en <M>T_2 = {T2}</M> gebruiken.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met de gegeven formules en bekende waarden de specifieke warmte <M>q</M> en de specifieke technische arbeid <M>w_t.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="q" prelabel={<M>q =</M>} label="Specifieke warmte" size="s" />
					<FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T1, T2, q, wt } = useSolution()
			const qUnit = q.setUnit('kJ/kg')

			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we
				<BMList>
					<BMPart>q = c_p\left(T_2-T_1\right) = {cp.float} \cdot \left({T2.float} - {T1.float}\right) = {q},</BMPart>
					<BMPart>w_t = {wt}.</BMPart>
				</BMList>
				Het is de gewoonte om de specifieke warmte te schrijven als <M>q = {qUnit}</M>, omdat we vaak waarden van enkele honderden <M>{qUnit.unit}</M> hebben. Dat is hier ook het geval, dus qua orde van grootte is dit een logische waarde.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getInputFieldFeedback(['T1', 'T2', 'cp', 'q', 'wt'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 1,
			text: [
				'Ja, dit is inderdaad een isobaar proces, want de druk blijft constant.',
				'Nee, dan zou het volume constant moeten blijven.',
				'Nee, dan zou de temperatuur constant moeten blijven.',
				'Nee, dan zou er geen warmte toegevoerd mogen worden.',
				'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
			],
		}),
		...getMCFeedback('eq', exerciseData, {
			step: 2,
			text: [
				'Net niet! Dit zijn wel de formules voor een isobaar proces, maar we weten de druk en het volume niet. Dus zijn deze niet handig om te gebruiken.',
				'Ja! Dit zijn de formules voor een isobaar proces, en ze gebruiken de temperatuur, die in de vraag gegeven is.',
				'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isochoor proces.',
				'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isotherm proces.',
				'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isentroop proces.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave.',
			],
		})
	}
}
