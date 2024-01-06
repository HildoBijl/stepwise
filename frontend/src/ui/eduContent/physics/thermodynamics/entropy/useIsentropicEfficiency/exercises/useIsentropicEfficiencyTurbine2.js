import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, useSolution } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ h1, h2p, etai }) => <>
	<Par>Een turbine in een stoominstallatie gebruikt stoom om arbeid te genereren. Dit gebeurt niet isentroop. Bij een isentroop proces zou de specifieke enthalpie van de stoom dalen van <M>{h1}</M> naar <M>{h2p}.</M> Nu is er echter een isentropisch rendement van <M>{etai}</M> van toepassing. Bereken in dit geval de specifieke enthalpie die de stoom werkelijk heeft bij het verlaten van de turbine.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie na turbine" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken de specifieke technische arbeid die de stoom in de turbine levert voor het theoretische isentrope geval.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wti" prelabel={<M>w_(t_i)=</M>} label="Theoretische specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ h1, h2p, wti }) => {
			return <>
				<Par>In een turbine wordt geen warmte toegevoerd of afgevoerd, waardoor <M>q = 0.</M> De technische arbeid volgt vanuit de eerste hoofdwet als
					<BM>w_t = q - \Delta h = -\left(h_2 - h_1\right) = h_1 - h_2.</BM>
					Dit geldt zowel voor het theoretische isentrope geval als voor de werkelijkheid. Voor het theoretische geval vinden we zo
					<BM>w_(t_i) = h_1 - h_(2') = {h1.float} - {h2p.float} = {wti}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via het isentropisch rendement de werkelijke specifieke technische arbeid die de stoom in de turbine levert.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wt" prelabel={<M>w_t=</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ wti, wt, etai }) => {
			return <>
				<Par>In een turbine is de werkelijk geleverde arbeid altijd kleiner dan de in theorie haalbare technische arbeid. Het isentropisch rendement van een turbine is dus gedefinieerd als <BM>\eta_i = \frac(w_t)(w_(t_i)).</BM> Dit oplossen voor <M>w_t</M> geeft <BM>w_t = \eta_i w_(t_i) = {etai.float} \cdot {wti.float} = {wt}.</BM> Dit is inderdaad ietsje kleiner dan de specifieke technische arbeid in het isentropische geval.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken aan de hand van de specifieke technische arbeid de enthalpie die de stoom bij het verlaten van de turbine heeft.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label="Specifieke enthalpie na turbine" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ wt, h1, h2 }) => {
			return <Par>Er geldt nog steeds <BM>w_t = h_1 - h_2.</BM> De oplossing voor <M>h_2</M> volgt als <BM>h_2 = h_1 - w_t = {h1.float} - {wt.float} = {h2}.</BM> Dit is ietsje groter dan <M>h_(2')</M> wat logisch is.</Par>
		},
	},
]