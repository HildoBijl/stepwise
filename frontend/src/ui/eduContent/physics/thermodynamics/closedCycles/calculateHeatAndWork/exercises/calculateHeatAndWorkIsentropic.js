import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1, V1, p2, V2 }) => {
	return <>
		<Par>We bekijken een grote gasturbine voor een gehele minuut. In deze minuut stroomt er <M>{V1}</M> lucht in, op <M>{p1}.</M> De uitgaande lucht heeft een volume van <M>{V2}</M>, op <M>{p2}.</M> De turbine is goed geïsoleerd en heeft een verwaarloosbare interne frictie. Bereken hoeveel warmte <M>Q</M> er in het gas is gestopt en hoeveel arbeid <M>W</M> het gas heeft verricht tijdens dit proces.</Par>
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
			return <Par>Er is geen warmteuitwisseling (de turbine is goed geïsoleerd) en er is geen interne warmte-ontwikkeling, bijvoorbeeld vanuit frictie. Dus is dit een isentroop proces.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isentroop proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
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
				]} randomOrder={true} pick={5} include={[6, 7]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isentroop proces. We weten hier het volume en de druk, waardoor de handigste formules hier dus <M>Q = 0</M> en <M>W = -\frac(1)(k-1)\left(p_2V_2 - p_1V_1\right)</M> zijn.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Zoek voor lucht de <M>k</M>-waarde op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M></span>} size="s" validate={FloatUnitInput.validation.any} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ k }) => {
			return <Par>Voor lucht geldt <M>k = {k}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="V1s" prelabel={<M>V_1 =</M>} label="Volume" size="s" />
					<FloatUnitInput id="V2s" prelabel={<M>V_2 =</M>} label="Volume" size="s" />
					<FloatUnitInput id="p1s" prelabel={<M>p_1 =</M>} label="Druk" size="s" />
					<FloatUnitInput id="p2s" prelabel={<M>p_2 =</M>} label="Druk" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1s, V1s, p2s, V2s }) => {
			return <Par>De volumes staan al in standaard eenheden: <M>V_1 = {V1s}</M> en <M>V_2 = {V2s}.</M> De druk moet nog in Pascal gezet worden. Zo vinden we <M>p_1 = {p1s}</M> en <M>p_2 = {p2s}.</M></Par>
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
		Solution: ({ k, p1s, p2s, V1s, V2s, Q, W }) => {
			return <Par>We hoeven alleen maar de formules in te vullen. Er geldt <M>Q = {Q}</M> omdat dat per definitie zo is bij een isentropisch proces. Verder vinden we <BM>W = -\frac(1)(k-1)\left(p_2V_2 - p_1V_1\right) = -\frac(1)({k}-1)\left({p2s.float} \cdot {V2s.float} - {p1s.float} \cdot {V1s.float}\right) = {W}.</BM> Dit is een erg grote hoeveelheid arbeid. We hebben hier echter ook te maken met een grote gasturbine die een volle minuut draait. Dit kan dus goed kloppen.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getFieldInputFeedback(exerciseData, ['k', 'V1s', 'V2s', 'p1s', 'p2s', 'Q', 'W']),
		...getMCFeedback(exerciseData, {
			process: {
				step: 1,
				text: [
					'Nee, dan zou de druk constant moeten blijven.',
					'Nee, dan zou het volume constant moeten blijven.',
					'Nee, dan zou de temperatuur constant moeten blijven, maar bij expansie koelt lucht over het algemeen af.',
					'Ja! Er is immers geen warmtetoevoer (want er is goede isolatie) en ook geen interne warmte-ontwikkeling.',
					'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
				],
			},
			eq: {
				step: 2,
				text: [
					'Nee, dit zijn de formules voor een isobaar proces.',
					'Nee, dit zijn de formules voor een isobaar proces. Daarnaast weten we de massa en de temperatuur helemaal niet.',
					'Nee, dit zijn de formules voor een isochoor proces.',
					'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we de massa en de temperatuur helemaal niet.',
					'Nee, dit zijn de formules voor een isotherm proces.',
					'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de massa en de temperatuur helemaal niet.',
					'Ja! Dit zijn de formules voor een isentroop proces die we kunnen gebruiken.',
					'Net niet! Dit zijn wel de formules voor een isentroop proces. We weten alleen de massa en de temperatuur niet, waardoor deze formules niet handig zijn.',
					'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze vraag.',
					'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze vraag. Daarnaast weten we de massa en de temperatuur helemaal niet.',
				],
			}
		}),
	}
}
