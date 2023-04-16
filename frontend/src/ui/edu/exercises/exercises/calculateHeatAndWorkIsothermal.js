import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form/FormPart'
import FloatUnitInput, { any } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ gas, m, T, p1, p2 }) => {
	return <>
		<Par>Een hoeveelheid van <M>{m}</M> {Dutch[gas]} wordt gecomprimeerd van <M>{p1}</M> naar <M>{p2}.</M> De temperatuur wordt hierbij op <M>{T}</M> gehouden. Bereken hoeveel warmte <M>Q</M> er in het gas is gestopt en hoeveel arbeid <M>W</M> het gas heeft verricht tijdens dit proces.</Par>
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
			return <Par>De temperatuur wordt op een constante waarde gehouden. Het is dus een isotherm proces.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isotherm proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
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
				]} randomOrder={true} pick={5} include={[4, 5]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isotherm proces. We weten hier de massa en de temperatuur, waardoor de handigste formules hier dus <M>Q = mR_sT \ln\left(\frac(V_2)(V_1)\right)</M> en <M>W = mR_sT \ln\left(\frac(V_2)(V_1)\right)</M> zijn.</Par>
		},
	},
	{
		Problem: ({ gas }) => {
			return <>
				<Par>Zoek voor {Dutch[gas]} de specifieke gasconstante <M>R_s</M> op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="Rs" prelabel={<M>R_s =</M>} label="Specifieke gasconstante" size="s" />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { gas, Rs } = useSolution()

			return <Par>Voor {Dutch[gas]} geldt <M>R_s = {Rs}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>In de formule staat ook de verhouding <M>V_2/V_1.</M> Bereken deze verhouding. Gebruik hiervoor eventueel de gaswet, wetende dat de temperatuur constant blijft.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ratio" prelabel={<M>\frac(V_2)(V_1) =</M>} label="Volumeverhouding" size="s" validate={any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { p1, p2, ratio } = useSolution()
			return <Par>De gaswet zegt dat <M>pV = mR_sT.</M> We weten hier dat <M>m</M>, <M>R_s</M> en <M>T</M> allen constant blijven. Dus moet ook <M>pV</M> constant blijven. Er geldt dus <BM>p_1V_1 = p_2V_2.</BM> Hieruit kunnen we de volumeverhouding halen. Deze is het omgekeerde van de drukverhouding. Oftewel, <BM>\frac(V_2)(V_1) = \frac(p_1)(p_2) = \frac{p1.float}{p2.float} = {ratio}.</BM> Dit kunnen we straks in de formule voor <M>Q</M> en <M>W</M> invullen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="m" prelabel={<M>m =</M>} label="Massa" size="s" />
					<FloatUnitInput id="T" prelabel={<M>T =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ m, T }) => {
			return <Par>Zowel de massa als de temperatuur moeten in standaard eenheden. De massa <M>m = {m}</M> staat al in standaard eenheden. De temperatuur kunnen we schrijven als <M>T = {T.setUnit('K')}.</M></Par>
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
		Solution: () => {
			const { Rs, m, T, ratio, Q } = useSolution()
			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we <BM>Q = W = mR_sT \ln\left(\frac(V_2)(V_1)\right) = {m.float} \cdot {Rs.float} \cdot {T.float} \cdot \ln\left({ratio.float}\right) = {Q}.</BM> Het minteken hier betekent dat er warmte <strong>uit het gas</strong> stroomt, en dat er arbeid <strong>op het gas</strong> wordt verricht. Dit klopt, want we zijn het gas aan het comprimeren, dus dit kost arbeid. Het minteken moet dus zeker wel vermeld worden, want het geeft de richting van deze energiestroom aan.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getInputFieldFeedback(['Rs', 'ratio', 'm', 'T', 'Q', 'W'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 1,
			text: [
				'Nee, dan zou de druk constant moeten blijven.',
				'Nee, dan zou het volume constant moeten blijven, maar het gas wordt gecomprimeerd.',
				'Ja, de temperatuur blijft immers constant.',
				'Nee, dan zou er geen warmte toegevoerd/afgevoerd mogen worden. Maar om de temperatuur gelijk te blijven wordt er hier zeker wel warmte afgevoerd.',
				'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
			],
		}),
		...getMCFeedback('eq', exerciseData, {
			step: 2,
			text: [
				'Nee, dit zijn de formules voor een isobaar proces. Daarnaast weten we het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isobaar proces.',
				'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isochoor proces.',
				'Net niet! Dit zijn wel de formules voor een isotherm proces, maar we weten het volume niet, en dus is dit niet handig om te gebruiken.',
				'Ja! We weten de massa en de temperatuur, dus hier komen we een heel eind mee.',
				'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isentroop proces.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave. Daarnaast weten we het volume helemaal niet.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave.',
			],
		})
	}
}
