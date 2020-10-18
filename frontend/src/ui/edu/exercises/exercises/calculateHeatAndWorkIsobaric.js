import React from 'react'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Dutch = {
	air: 'lucht',
	argon: 'argon',
	carbonDioxide: 'koolstofdioxide',
	carbonMonoxide: 'koolstofmonoxide',
	helium: 'helium',
	hydrogen: 'waterstof',
	methane: 'methaan',
	nitrogen: 'stikstof',
	oxygen: 'zuurstof',
}

const Problem = ({ gas, m, T1, T2 }) => {
	return <>
		<Par>Een hoeveelheid van <M>{m}</M> {Dutch[gas]} wordt bij gelijkblijvende druk verwarmd van <M>{T1}</M> tot <M>{T2}</M>. Hoeveel warmte <M>Q</M> is er in het gas gestopt en hoeveel arbeid <M>W</M> heeft het gas tijdens dit proces verricht?</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="ansQ" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
				<FloatUnitInput id="ansW" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Wat voor soort proces betreft het hier?</Par>
			<InputSpace>
				<MultipleChoice id="ansProcess" choices={[
					<span>Dit is een isobaar proces.</span>,
					<span>Dit is een isochoor proces.</span>,
					<span>Dit is een isotherm proces.</span>,
					<span>Dit is een isentroop proces.</span>,
					<span>Onbekend: het is alleen een polytroop proces.</span>,
				]} randomOrder={true} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er is gegeven dat het proces bij gelijkblijvende druk verloopt. De druk is dus constant, wat op een isobaar proces duidt.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Welke formules zijn het handigst om bij deze vraag te gebruiken?</Par>
			<InputSpace>
				<MultipleChoice id="ansEq" choices={[
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
				]} randomOrder={true} pick={5} include={[0, 1]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Dit is een isobaar proces. Verder weten we alleen de temperatuur en niet de druk of het volume. De formules die we willen gebruiken zijn dus <M>Q = mc_p\left(T_2-T_1\right)</M> en <M>W = mR_s\left(T_2-T_1\right)</M>.</Par>
		},
	},
	{
		Problem: ({ gas }) => {
			return <>
				<Par>Zoek voor {Dutch[gas]} de waarden van <M>c_p</M> en <M>R_s</M> op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="anscp" prelabel={<M>c_p =</M>} label={<span><M>c_p</M></span>} size="s" />
						<FloatUnitInput id="ansRs" prelabel={<M>R_s =</M>} label={<span><M>R_s</M></span>} size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { gas } = state
			const { shared: { getCorrect } } = useExerciseData()
			const { cp, Rs } = getCorrect(state)

			return <Par>Voor {Dutch[gas]} geldt <M>c_p = {cp}</M> en <M>R_s = {Rs}</M>.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we kunnen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansm" prelabel={<M>m =</M>} label="Massa" size="s" />
					<FloatUnitInput id="ansT1" prelabel={<M>T_1 =</M>} label="Temperatuur" size="s" />
					<FloatUnitInput id="ansT2" prelabel={<M>T_2 =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T1, T2 }) => {
			return <Par>De massa moet in standaard eenheden. Immers, de soortelijke warmte is ook "per kilogram" gegeven. Dus noteren we <M>m = {m.useUnit('kg')}</M>. Bij de temperaturen gaat het alleen om een temperatuurverschil, en dan mogen we ook in graden Celsius rekenen. Het is dus voldoende om <M>T_1 = {T1}</M> en <M>T_2 = {T2}</M> te schrijven.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken met de gegevens formules en bekende waarden de warmte <M>Q</M> en de arbeid <M>W</M>.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ansQ" prelabel={<M>Q =</M>} label={<span><M>Q</M></span>} size="s" />
					<FloatUnitInput id="ansW" prelabel={<M>W =</M>} label={<span><M>W</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { cp, Rs, m, T1, T2, Q, W } = getCorrect(state)

			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we <BM>Q = mc_p\left(T_2-T_1\right) = {m.float} \cdot {cp.float} \cdot \left({T2.float} - {T1.float}\right) = {Q},</BM><BM>W = mR_s\left(T_2-T_1\right) = {m.float} \cdot {Rs.float} \cdot \left({T2.float} - {T1.float}\right) = {W}.</BM> Het is lastig om te controleren of dit logisch is. De richtlijn is dat bij processen met enkele grammen gas we enkele honderden Joules nodig hebben, en zodra we met kilogrammen gaan werken we rond de honderden kilo-Joules zitten. Dit lijkt te kloppen met onze waarden, waardoor de antwoorden logisch lijken.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	const { input, progress } = exerciseData

	const feedback = getDefaultFeedback(['m', 'T1', 'T2', 'cp', 'Rs', 'Q', 'W'], exerciseData)

	if (input.ansProcess) {
		const mcStep = 1
		const [ansProcess] = input.ansProcess
		feedback.ansProcess = {
			'0': progress[mcStep] && progress[mcStep].done,
			[ansProcess]: {
				correct: !!(progress[mcStep] && progress[mcStep].solved),
				text: [
					'Ja, dit is inderdaad een isobaar proces, want de druk blijft constant.',
					'Nee, dan zou het volume constant moeten blijven.',
					'Nee, dan zou de temperatuur constant moeten blijven.',
					'Nee, dan zou er geen warmte toegevoerd mogen worden.',
					'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
				][ansProcess]
			},
		}
	}

	if (input.ansEq) {
		const mcStep = 2
		const [ansEq] = input.ansEq
		feedback.ansEq = {
			'1': progress[mcStep] && progress[mcStep].done,
			[ansEq]: {
				correct: !!(progress[mcStep] && progress[mcStep].solved),
				text: [
					'Net niet! Dit zijn wel de formules voor een isobaar proces, maar we weten de druk en het volume niet.',
					'Ja! Dit zijn de formules voor een isobaar proces, en ze gebruiken de temperatuur, die in de vraag gegeven is.',
					'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isochoor proces.',
					'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isotherm proces.',
					'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een isentroop proces.',
					'Nee, dit zijn de formules voor een polytroop proces, maar dat is te algemeen. Daarnaast weten we de druk en het volume helemaal niet.',
					'Nee, dit zijn de formules voor een polytroop proces, maar dat is te algemeen.',
				][ansEq]
			},
		}
	}

	return feedback
}
