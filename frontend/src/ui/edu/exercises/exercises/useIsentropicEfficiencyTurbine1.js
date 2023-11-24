import React from 'react'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import { StepExercise } from 'ui/eduTools'
import { useSolution } from 'ui/eduTools'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ h1, h2p, h2 }) => <>
	<Par>Een turbine in een stoominstallatie gebruikt stoom om arbeid te genereren. Bij dit proces daalt de specifieke enthalpie van de stoom van <M>{h1}</M> naar <M>{h2}.</M> De turbine werkt niet isentroop: als deze wel isentroop zou werken zou de enthalpie dalen tot <M>{h2p}.</M> Bereken het isentropisch rendement van de turbine.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={FloatUnitInput.validation.any} />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken de specifieke technische arbeid die de stoom in de turbine levert, zowel voor het theoretische isentrope geval als in werkelijkheid.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wti" prelabel={<M>w_(t_i)=</M>} label="Theoretische specifieke technische arbeid" size="s" />
					<FloatUnitInput id="wt" prelabel={<M>w_t=</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { h1, h2p, h2, wti, wt } = useSolution()
			return <>
				<Par>In een turbine wordt geen warmte toegevoerd of afgevoerd, waardoor <M>q = 0.</M> De technische arbeid volgt vanuit de eerste hoofdwet als
					<BM>w_t = q - \Delta h = -\left(h_2 - h_1\right) = h_1 - h_2.</BM>
					Dit geldt zowel voor het theoretische isentrope geval als voor de werkelijkheid. Zo vinden we
					<BMList>
						<BMPart>w_(t_i) = h_1 - h_(2') = {h1.float} - {h2p.float} = {wti},</BMPart>
						<BMPart>w_t = h_1 - h_2 = {h1.float} - {h2.float} = {wt}.</BMPart>
					</BMList>
					Merk op dat de werkelijke technische arbeid kleiner is dan de technische arbeid in het optimale geval. Dit is logisch: als er frictie aanwezig is, levert een turbine minder arbeid.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken het isentropisch rendement door de theoretische isentrope situatie met de werkelijkheid te vergelijken.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { wt, wti, etai } = useSolution()
			return <Par>Het isentropisch rendement is altijd een getal tussen de <M>0</M> en de <M>1.</M> We moeten bij een turbine dus de werkelijke technische arbeid (het kleinere getal) delen door de theoretische technische arbeid (het grotere getal). Zo vinden we <BM>\eta_i = \frac(w_t)(w_(t_i)) = \frac{wt.float}{wti.float} = {etai}.</BM> Een isentropisch rendement van <M>{etai.setUnit('%')}</M> is redelijk reëel voor een turbine.</Par>
		},
	},
]