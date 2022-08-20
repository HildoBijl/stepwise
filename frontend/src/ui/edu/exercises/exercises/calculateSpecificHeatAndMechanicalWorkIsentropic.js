import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import FloatUnitInput, { any } from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1, v1, p2, v2 }) => {
	return <>
		<Par>We bekijken een grote gasturbine. De instromende lucht heeft een specifiek volume van <M>{v1}</M> op <M>{p1}.</M> De uitgaande lucht heeft een specifiek volume van <M>{v2}</M> op <M>{p2}.</M> De turbine is goed geïsoleerd en heeft een verwaarloosbare interne frictie. Bereken hoeveel specifieke warmte <M>q</M> er in het gas is gestopt en hoeveel specifieke technische arbeid <M>w_t</M> het gas heeft verricht tijdens dit proces.</Par>
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
			return <Par>Er is geen warmteuitwisseling (de turbine is goed geïsoleerd) en er is geen interne warmte-ontwikkeling, bijvoorbeeld vanuit frictie. Dus is dit een isentroop proces.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek de formules op die horen bij een isentroop proces en kies degenen die het handigst zijn om hier te gebruiken.</Par>
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
				]} randomOrder={true} pick={5} include={[6, 7]} />
			</InputSpace>
		</>,
		Solution: () => {
			return <Par>Er zijn verschillende formules die horen bij een isentroop proces. We weten hier het volume en de druk, waardoor de handigste formules hier dus <M>q = 0</M> en <M>w_t = -\frac(k)(k-1)\left(p_2v_2 - p_1v_1\right)</M> zijn.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Zoek voor lucht de <M>k</M>-waarde op.</Par>
				<InputSpace>
					<Par>
						<FloatUnitInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M></span>} size="s" validate={any} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { k } = useSolution()

			return <Par>Voor lucht geldt <M>k = {k}.</M></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zet de gegeven waarden in eenheden waarmee we hier mogen rekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="v1" prelabel={<M>v_1 =</M>} label="Specifiek volume" size="s" />
					<FloatUnitInput id="v2" prelabel={<M>v_2 =</M>} label="Specifiek volume" size="s" />
					<FloatUnitInput id="p1" prelabel={<M>p_1 =</M>} label="Druk" size="s" />
					<FloatUnitInput id="p2" prelabel={<M>p_2 =</M>} label="Druk" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ p1, v1, p2, v2 }) => {
			return <Par>De specifieke volumes staan al in standaard eenheden: <M>v_1 = {v1}</M> en <M>v_2 = {v2}.</M> De druk moet nog in Pascal gezet worden. Zo vinden we <M>p_1 = {p1.setUnit('Pa')}</M> en <M>p_2 = {p2.setUnit('Pa')}.</M></Par>
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
			const { k, p1, p2, v1, v2, q, wt } = useSolution()
			const wtUnit = wt.setUnit('kJ/kg').setDecimals(0)

			return <Par>We hoeven alleen maar de formules in te vullen. Er geldt <M>q = {q}</M> omdat dat per definitie zo is bij een isentropisch proces. Verder vinden we <BM>w_t = -\frac(k)(k-1)\left(p_2v_2 - p_1v_1\right) = -\frac({k})({k}-1)\left({p2.float} \cdot {v2.float} - {p1.float} \cdot {v1.float}\right) = {wt}.</BM> Het is de gewoonte om specifieke technische arbeid te schrijven als <M>w_t = {wtUnit}</M> omdat de grootte vaak enkele honderden <M>{wtUnit.unit}</M> is. Dat is hier ook zo, wat ons vertelt dat het antwoord qua orde van grootte in ieder geval correct is.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return {
		...getInputFieldFeedback(['k', 'v1', 'v2', 'p1', 'p2', 'q', 'wt'], exerciseData),
		...getMCFeedback('process', exerciseData, {
			step: 1,
			text: [
				'Nee, dan zou de druk constant moeten blijven.',
				'Nee, dan zou het volume constant moeten blijven.',
				'Nee, dan zou de temperatuur constant moeten blijven, maar bij expansie koelt lucht over het algemeen af.',
				'Ja! Er is immers geen warmtetoevoer (want er is goede isolatie) en ook geen interne warmte-ontwikkeling.',
				'Nee, dat is bij een algemeen proces waarbij niets constant blijft.',
			],
		}),
		...getMCFeedback('eq', exerciseData, {
			step: 2,
			text: [
				'Nee, dit zijn de formules voor een isobaar proces.',
				'Nee, dit zijn de formules voor een isobaar proces. Daarnaast weten we de temperatuur helemaal niet.',
				'Nee, dit zijn de formules voor een isochoor proces.',
				'Nee, dit zijn de formules voor een isochoor proces. Daarnaast weten we de temperatuur helemaal niet.',
				'Nee, dit zijn de formules voor een isotherm proces.',
				'Nee, dit zijn de formules voor een isotherm proces. Daarnaast weten we de temperatuur helemaal niet.',
				'Ja! Dit zijn de formules voor een isentroop proces die we kunnen gebruiken.',
				'Net niet! Dit zijn wel de formules voor een isentroop proces. We weten alleen de temperatuur niet, waardoor deze formules niet handig zijn.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze vraag.',
				'Nee, dit zijn de formules voor een polytroop proces, wat een te algemeen antwoord is voor deze vraag. Daarnaast weten we de temperatuur helemaal niet.',
			],
		})
	}
}
