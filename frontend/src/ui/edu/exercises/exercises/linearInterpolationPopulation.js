import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useCorrect } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

import { interpolate, gridInterpolate } from 'step-wise/util/interpolation'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

console.log(interpolate(1965, [10, 13], [1950, 1970]))
console.log(interpolate([7, 4], [[0, 20], [100, 200]], [0, 10], [0, 5]))
console.log(interpolate(3, [0, 5], [0, 1]))
console.log(interpolate([3], [0, 5], [0, 1]))
console.log(gridInterpolate(1963, [10, 11.5, 13, 15], [1950, 1960, 1970, 1980]))
console.log(gridInterpolate([1963, 19], [[10, 11, 12, 13], [9, 12, 14, 17], [6, 7, 9, 10]], [1950, 1960, 1970, 1980], [18, 20, 22]))

const boilingPressure = {
	labels: ['Temperature'],
	headers: [[0, 10, 20, 30, 40, 50].map(x => new FloatUnit({ float: x, unit: 'dC' }).makeExact())],
	grid: ['0.0061', '0.0123', '0.0234', '0.0424', '0.0737', '0.1233'].map(x => new FloatUnit({ float: x, unit: 'bar' })),
}
console.log(gridInterpolate(new FloatUnit('22 dC'), boilingPressure.grid, ...boilingPressure.headers).str)

const enthalpy = {
	labels: ['Temperature', 'Pressure'],
	headers: [
		[20, 22, 24, 26].map(x => new FloatUnit({ float: x, unit: 'bar' }).makeExact()),
		[220, 240, 260].map(x => new FloatUnit({ float: x, unit: 'dC' }).makeExact()),
	],
	grid: [
		['2824.6', '2811.7', undefined, undefined],
		['2880.0', '2870.6', '2860.6', '2850.1'],
		['2930.0', '2922.4', '2914.5', '2906.4'],
	].map(arr => arr.map(x => x === undefined ? undefined : new FloatUnit({ float: x, unit: 'kJ/kg' }))),
}
const res = gridInterpolate([new FloatUnit('22.1 bar'), new FloatUnit('239 dC')], enthalpy.grid, ...enthalpy.headers)
console.log(res && res.str)

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ h1, h2p, h2 }) => <>
	<Par>Een turbine in een stoominstallatie gebruikt stoom om arbeid te genereren. Bij dit proces daalt de specifieke enthalpie van de stoom van <M>{h1}</M> naar <M>{h2}.</M> De turbine werkt niet isentropisch: als deze wel isentropisch zou werken zou de enthalpie dalen tot <M>{h2p}.</M> Bereken het isentropisch rendement van de turbine.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" />
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
			const { h1, h2p, h2, wti, wt } = useCorrect()
			return <>
				<Par>In een turbine wordt geen warmte toegevoerd of afgevoerd, waardoor <M>q = 0</M>. De technische arbeid volgt vanuit de eerste hoofdwet als
				<BM>w_t = q - \Delta h = -(h_2 - h_1) = h_1 - h_2.</BM>
				Dit geldt zowel voor het theoretische isentrope geval als voor de werkelijkheid. Zo vinden we
				<BM>w_(t_i) = h_1 - h_(2') = {h1.float} - {h2p.float} = {wti},</BM>
					<BM>w_t = h_1 - h_2 = {h1.float} - {h2.float} = {wt}.</BM>
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
					<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { wt, wti, etai } = useCorrect()
			return <Par>Het isentropisch rendement is altijd een getal tussen de <M>0</M> en de <M>1.</M> We moeten bij een turbine dus de werkelijke technische arbeid (het kleinere getal) delen door de theoretische technische arbeid (het grotere getal). Zo vinden we <BM>\eta_i = \frac(w_t)(w_(t_i)) = \frac{wt.float}{wti.float} = {etai}.</BM> Een isentropisch rendement van <M>{etai.setUnit('%')}</M> is redelijk reëel voor een turbine.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['wti', 'wt', 'etai'], exerciseData)
}

