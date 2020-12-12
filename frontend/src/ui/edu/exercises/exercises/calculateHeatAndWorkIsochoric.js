import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { Dutch } from 'ui/lang/gases'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ gas, V, p1, p2 }) => {
	return <>
		<Par>Een solide gesloten gastank gevuld met <M>{V}</M> {Dutch[gas]} wordt sterk verwarmd. Hierdoor stijgt de druk van <M>{p1}</M> tot <M>{p2}.</M> Bereken hoeveel warmte <M>Q</M> er in het gas is gestopt en hoeveel arbeid <M>W</M> het gas heeft verricht tijdens dit proces.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="Q" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
				<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
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
			return <Par>Je mag aannemen dat de gesloten gastank niet opeens van formaat verandert. Dus blijft het volume constant en is dit een isochoor proces.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isochoor proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
			<InputSpace>
				<MultipleChoice id="eq" choices={[
					<span><M>Q = \frac(k)(k-1) p \left(V_2 - V_1\right)</M> en <M>W = p\left(V_2 - V_1\right)</M></span>,
					<span><M>Q = mc_p\left(T_2-T_1\right)</M> en <M>W = mR_s\left(T_2-T_1\right)</M></span>,
					<span><M>Q = \frac(1)(k-1) V \left(p_2 - p_1\right)</M> en <M>W = 0</M></span>,
					<span><M>Q = mc_v\left(T_2 - T_1\right)</M> en <M>W = 0</M></span>,
					<span><M>Q = pV \ln\left(\frac(V_2)(V_1)\right)</M> en <M>W = pV \ln\left(\frac(V_2)(V_1)\right)</M></span>,
					<span><M>Q = mR_sT \ln\left(\frac(V_2)(V_1)\right)</M> en <M>W = mR_sT \ln\left(\frac(V_2)(V_1)\right)</M></span>,
					<span><M>Q = 0</M> en <M>W = -\frac(1)(k-1)\left(p_2V_2 - p_1V_1\right)</M></span>,
					<span><M>Q = 0</M> en <M>W = -\frac(mR_s)(k-1)\left(T_2 - T_1\right)</M></span>,
					<span><M>Q = \frac(c)(R_s) \left(p_2V_2 - p_1V_1\right)</M> en <M>W = -\frac(1)(n-1) \left(p_2V_2 - p_1V_1\right)</M></span>,
					<span><M>Q = mc\left(T_2 - T_1\right)</M> en <M>W = -\frac(mR_s)(n-1)\left(T_2 - T_1\right)</M></span>,
				]} randomOrder={true} pick={5} include={[2, 3]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isochoor proces. We weten echter alleen het volume en de druk, en niet de massa of de temperatuur. De formules die we willen gebruiken zijn dus <M>Q = \frac(1)(k-1) V \left(p_2 - p_1\right)</M> en <M>W = 0.</M></Par>
		},
	},
	{
		Problem: ({ gas }) => {
			return <>
				<Par>Zoek voor {Dutch[gas]} de <M>k</M>-waarde op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M></span>} size="s" validate={validNumberAndUnit} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { gas } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { k } = getCorrect(state)

			return <Par>Voor {Dutch[gas]} geldt <M>k = {k}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="V" prelabel={<M>V =</M>} label="Volume" size="s" />
					<FloatUnitInput id="p1" prelabel={<M>p_1 =</M>} label="Druk" size="s" />
					<FloatUnitInput id="p2" prelabel={<M>p_2 =</M>} label="Druk" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ V, p1, p2 }) => {
			return <Par>Zowel het volume als de druk moeten in standaard eenheden. Zo vinden we <M>V = {V.setUnit('m^3')}</M>, <M>p_1 = {p1.setUnit('Pa')}</M> en <M>p_2 = {p2.setUnit('Pa')}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met de gegeven formules en bekende waarden de warmte <M>Q</M> en de arbeid <M>W.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Q" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
					<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { k, V, p1, p2, Q, W } = getCorrect(state)

			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we <BM>Q = \frac(1)(k-1) V \left(p_2 - p_1\right) = \frac(1)({k.float}-1) \cdot {V.float} \cdot \left({p2.float} - {p1.float}\right) = {Q},</BM><BM>W = {W}.</BM> Dit is een grote hoeveelheid warmte, maar de druktoename is ook significant, dus dit lijkt logisch.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getDefaultFeedback(['k', 'V', 'p1', 'p2', 'Q', 'W'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 1,
			text: [
				'Nee, dan zou de druk constant moeten blijven.',
				'Ja, dit is inderdaad een isochoor proces, want de solide gastank groeit niet opeens.',
				'Nee, dan zou de temperatuur constant moeten blijven.',
				'Nee, dan zou er geen warmte toegevoerd mogen worden.',
				'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
			],
		}),
		...getMCFeedback('eq', exerciseData, {
			step: 2,
			text: [
				'Nee, dit zijn de formules voor een isobaar proces.',
				'Nee, dit zijn de formules voor een isobaar proces. Daarnaast weten we de massa en de temperatuur helemaal niet.',
				'Ja! Dit zijn de formules voor een isochoor proces, en ze gebruiken het volume en de druk, die in de vraag gegeven zijn.',
				'Net niet! Dit zijn wel de formules voor een isochoor proces, maar weten we de massa en de temperatuur helemaal niet. Dus zijn deze niet handig om te gebruiken.',
				'Nee, dit zijn de formules voor een isotherm proces.',
				'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de massa en de temperatuur helemaal niet.',
				'Nee, dit zijn de formules voor een isentroop proces.',
				'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we de massa en de temperatuur helemaal niet.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave. Daarnaast weten we de massa en de temperatuur helemaal niet.',
			],
		})
	}
}
