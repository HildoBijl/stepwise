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

const Problem = ({ gas, T, p1, p2 }) => {
	return <>
		<Par>In een centrifugaalcompressor wordt continu {Dutch[gas]} gecomprimeerd. Dit gebeurt van <M>{p1}</M> naar <M>{p2}.</M> De temperatuur wordt hierbij op <M>{T}</M> gehouden. Bereken hoeveel specifieke warmte <M>q</M> er in het gas is gestopt en hoeveel specifieke technische arbeid <M>w_t</M> het gas heeft verricht tijdens dit proces.</Par>
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
			return <Par>De temperatuur wordt op een constante waarde gehouden. Het is dus een isotherm proces.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isotherm proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
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
				]} randomOrder={true} pick={5} include={[4, 5]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isotherm proces. We weten hier de temperatuur, waardoor de handigste formules hier dus <M>q = R_sT \ln\left(\frac(v_2)(v_1)\right)</M> en <M>w_t = R_sT \ln\left(\frac(v_2)(v_1)\right)</M> zijn.</Par>
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
			<Par>In de formule staat ook de verhouding <M>v_2/v_1.</M> Bereken deze verhouding. Gebruik hiervoor eventueel de gaswet, wetende dat de temperatuur constant blijft.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ratio" prelabel={<M>\frac(v_2)(v_1) =</M>} label="Volumeverhouding" size="s" validate={any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { p1, p2, ratio } = useSolution()
			return <Par>De gaswet zegt dat <M>pv = R_sT.</M> We weten hier dat <M>R_s</M> en <M>T</M> beiden constant blijven. Dus moet ook <M>pv</M> constant blijven. Er geldt dus <BM>p_1v_1 = p_2v_2.</BM> Hieruit kunnen we de volumeverhouding halen. Deze is het omgekeerde van de drukverhouding. Oftewel, <BM>\frac(v_2)(v_1) = \frac(p_1)(p_2) = \frac{p1.float}{p2.float} = {ratio}.</BM> Dit kunnen we straks in de formule voor <M>q</M> en <M>w_t</M> invullen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven temperatuur in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T" prelabel={<M>T =</M>} label="Temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ T }) => {
			return <Par>Bij deze formules is het cruciaal dat de temperatuur in standaard eenheden staat. We schrijven dus <M>T = {T.setUnit('K')}</M> op.</Par>
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
			const { Rs, T, ratio, q } = useSolution()
			return <Par>We hoeven alleen maar de formules in te vullen. Zo vinden we <BM>q = wt = R_sT \ln\left(\frac(v_2)(v_1)\right) = {Rs.float} \cdot {T.float} \cdot \ln\left({ratio.float}\right) = {q}.</BM> Het minteken hier betekent dat er warmte <strong>uit het gas</strong> stroomt, en dat er arbeid <strong>op het gas</strong> wordt verricht. Dit klopt, want we zijn het gas aan het comprimeren, dus dit kost arbeid. Het minteken moet dus zeker wel vermeld worden, want het geeft de richting van deze energiestroom aan.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getInputFieldFeedback(['Rs', 'ratio', 'T', 'q', 'wt'], exerciseData),
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
				'Ja! We weten de temperatuur, dus hier komen we een heel eind mee.',
				'Nee, dit zijn de formules voor een isentroop proces. Daarnaast weten we het volume helemaal niet.',
				'Nee, dit zijn de formules voor een isentroop proces.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave. Daarnaast weten we het volume helemaal niet.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze opgave.',
			],
		})
	}
}
