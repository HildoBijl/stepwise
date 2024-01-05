import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ gas, m, T1, T2 }) => {
	return <>
		<Par>Een hoeveelheid van <M>{m}</M> {Dutch[gas]} wordt bij gelijkblijvende druk verwarmd van <M>{T1}</M> tot <M>{T2}.</M> Bereken hoeveel warmte <M>Q</M> er in het gas is gestopt en hoeveel arbeid <M>W</M> het gas heeft verricht tijdens dit proces.</Par>
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
			return <Par>Er is gegeven dat het proces bij gelijkblijvende druk verloopt. De druk is dus constant, wat op een isobaar proces duidt.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isobaar proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
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
				]} randomOrder={true} pick={5} include={[0, 1]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isobaar proces. We weten echter alleen de temperatuur, en niet de druk of het volume. De formules die we willen gebruiken zijn dus <M>Q = mc_p\left(T_2-T_1\right)</M> en <M>W = mR_s\left(T_2-T_1\right).</M></Par>
		},
	},
	{
		Problem: ({ gas }) => {
			return <>
				<Par>Zoek voor {Dutch[gas]} de waarden van <M>c_p</M> en <M>R_s</M> op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="cp" prelabel={<M>c_p =</M>} label={<span><M>c_p</M></span>} size="s" />
						<FloatUnitInput id="Rs" prelabel={<M>R_s =</M>} label={<span><M>R_s</M></span>} size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ gas, cp, Rs }) => {
			return <Par>Voor {Dutch[gas]} geldt <M>c_p = {cp}</M> en <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ms" prelabel={<M>m =</M>} label="Massa" size="s" />
					<FloatUnitInput id="T1s" prelabel={<M>T_1 =</M>} label="Temperatuur" size="s" />
					<FloatUnitInput id="T2s" prelabel={<M>T_2 =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ ms, T1s, T2s }) => {
			return <Par>De massa moet in standaard eenheden. Immers, de soortelijke warmte is ook "per kilogram" gegeven. Dus noteren we <M>m = {ms}.</M> Bij de temperaturen gaat het alleen om een temperatuurverschil, en dan mogen we ook in graden Celsius rekenen. Het is dus voldoende om <M>T_1 = {T1s}</M> en <M>T_2 = {T2s}</M> te gebruiken.</Par>
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
		Solution: ({ cp, Rs, ms, T1s, T2s, Q, W }) => {
			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we
				<BMList>
					<BMPart>Q = mc_p\left(T_2-T_1\right) = {ms.float} \cdot {cp.float} \cdot \left({T2s.float} - {T1s.float}\right) = {Q},</BMPart>
					<BMPart>W = mR_s\left(T_2-T_1\right) = {ms.float} \cdot {Rs.float} \cdot \left({T2s.float} - {T1s.float}\right) = {W}.</BMPart>
				</BMList>
				Het is lastig om te controleren of dit logisch is. De richtlijn is dat het aantal Joules bij een proces vaak een stuk groter is (een factor 10 à 100) dan het aantal gram gas. Dit lijkt te kloppen met onze waarden, waardoor de antwoorden logisch lijken.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getFieldInputFeedback(exerciseData, ['ms', 'T1s', 'T2s', 'cp', 'Rs', 'Q', 'W']),
		...getMCFeedback(exerciseData, {
			process: {
				step: 1,
				text: [
					'Ja, dit is inderdaad een isobaar proces, want de druk blijft constant.',
					'Nee, dan zou het volume constant moeten blijven.',
					'Nee, dan zou de temperatuur constant moeten blijven.',
					'Nee, dan zou er geen warmte toegevoerd mogen worden.',
					'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
				],
			},
			eq: {
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
			}
		})
	}
}
