import React from 'react'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import { useExerciseData } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'
import { getDefaultFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ m, T1, T2, n }) => {
	return <>
		<Par>In een fietspomp wordt tijdens één slag <M>{m}</M> lucht gecomprimeerd. De temperatuur van de lucht voor de compressie is <M>{T1}</M>, en na de compressie is dit <M>{T2}.</M> De compressie verloopt niet isentroop: via metingen is de procescoëfficiënt bepaald als <M>n = {n}.</M> Bereken hoeveel warmte <M>Q</M> er in het gas is gestopt en hoeveel arbeid <M>W</M> het gas heeft verricht tijdens dit proces.</Par>
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
			return <Par>Het is een isentroop proces (gegeven) maar ook geen isotherm proces (want de temperatuur neemt toe). Het moet dus een polytroop proces met een bepaalde procescoëfficiënt <M>n.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een polytroop proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
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
				]} randomOrder={true} pick={5} include={[8, 9]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een polytroop proces. We weten hier de massa en de temperatuur, waardoor de handigste formules hier dus <M>Q = mc\left(T_2 - T_1\right)</M> en <M>W = -\frac(mR_s)(n-1)\left(T_2 - T_1\right)</M> zijn.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Zoek voor lucht de specifieke gasconstante <M>R_s</M> en de soortelijke warmte bij constant volume <M>c_v</M> op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="Rs" prelabel={<M>R_s =</M>} label="Specifieke gasconstante" size="s" />
						<FloatUnitInput id="cv" prelabel={<M>c_v =</M>} label="Soortelijke warmte" size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { Rs, cv } = getCorrect(state)

			return <Par>Voor lucht geldt <M>R_s = {Rs}</M> en <M>c_v = {cv}.</M></Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bereken de soortelijke warmte <M>c</M> die hoort bij dit proces.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="c" prelabel={<M>c =</M>} label="Soortelijke warmte" size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { shared: { getCorrect } } = useExerciseData()
			const { n, Rs, cv, c } = getCorrect(state)

			return <Par>Voor elk proces met procescoëfficiënt <M>n</M> kunnen we de soortelijke warmte berekenen via <BM>c = c_v - \frac(R_s)(n-1).</BM> Getallen invullen geeft <BM>c = {cv.float} - \frac({Rs.float})({n.float} - 1) = {c}.</BM> Hiermee kunnen we zo de toegevoerde warmte berekenen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="m" prelabel={<M>m =</M>} label="Massa" size="s" />
					<FloatUnitInput id="T1" prelabel={<M>T_1 =</M>} label="Temperatuur" size="s" />
					<FloatUnitInput id="T2" prelabel={<M>T_2 =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T1, T2 }) => {
			return <Par>De massa moet zeker in standaard eenheden. Dus schrijven we <M>m = {m.setUnit('kg')}.</M> Bij de temperatuur moeten we alleen een temperatuursverschil in de formule invullen, en dus mogen we de temperatuur in graden Celsius laten staan. Oftewel, <M>T_1 = {T1}</M> en <M>T_2 = {T2}.</M> Natuurlijk is het ook prima om in Kelvin te rekenen.</Par>
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
			const { Rs, n, m, c, T1, T2, Q, W } = getCorrect(state)

			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we <BM>Q = mc\left(T_2 - T_1\right) = {m.float} \cdot {c.float} \cdot \left({T2.float} - {T1.float}\right) = {Q},</BM> <BM>W = -\frac(mR_s)(n-1)\left(T_2 - T_1\right) = -\frac({m.float} \cdot {Rs.float})({n.float} - 1) \cdot \left({T2.float} - {T1.float}\right) = {W}.</BM> De mintekens hier betekenen dat er warmte <strong>uit het gas</strong> stroomt en dat er arbeid <strong>op het gas</strong> wordt verricht. Dit klopt, want we zijn de lucht aan het comprimeren, dus dit kost arbeid. En omdat de lucht warmer wordt stroomt er warmte uit. De mintekens moeten dus zeker wel vermeld worden, want ze geven de richtingen van deze energiestromen aan.
			</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getDefaultFeedback(['Rs', 'cv', 'm', 'T1', 'T2', 'Q', 'W'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 1,
			text: [
				'Nee, dan zou de druk constant moeten blijven.',
				'Nee, dan zou het volume constant moeten blijven, maar het gas wordt gecomprimeerd.',
				'Nee, dan zou de temperatuur constant moeten blijven.',
				'Nee, dan zou er geen warmte toegevoerd/afgevoerd mogen worden. Maar om de temperatuur gelijk te blijven wordt er hier zeker wel warmte afgevoerd.',
				<span>Ja, dit is een algemeen proces waarbij niets constant blijft en we alleen kunnen rekenen met een procescoëfficiënt <M>n.</M></span>,
			],
		}),
		...getMCFeedback('eq', exerciseData, {
			step: 2,
			text: [
				'Nee, dit zijn de formules voor een isobaar proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isobaar proces.',
				'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isochoor proces.',
				'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isotherm proces.',
				'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we de druk en het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isentroop proces.',
				'Net niet! Dit zijn wel de formules voor een polytroop proces. We weten de druk en het volume alleen niet, en dus zijn deze formules niet handig om te gebruiken.',
				'Ja! Dit zijn inderdaad de formules voor een polytroop proces, en we weten de massa en de temperatuur, dus dat moet goed komen.',
			],
		})
	}
}
