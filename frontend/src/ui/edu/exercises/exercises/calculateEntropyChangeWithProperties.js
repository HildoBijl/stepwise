import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useCorrect } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ p1, T1, p2, n }) => <>
	<Par>In de compressor van een gasturbine wordt continu lucht gecomprimeerd van <M>{p1}</M> tot <M>{p2}.</M> De temperatuur van de lucht bij de ingang is <M>{T1}.</M> De compressor werkt niet isentroop: ga uit van een procescoëfficiënt van <M>n={n}.</M> Bereken de specifieke entropieverandering die de lucht in de compressor ondergaat.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="ds" prelabel={<M>\Delta s=</M>} label="Specifieke entropieverandering" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Bereken via Poisson's wet de temperatuur van de lucht bij de uitgang van de compressor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Uitgangstemperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { n, p1, p2, T1, T2 } = useCorrect()
			return <Par>Poisson's wet zegt dat <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_2^n)(p_2^(n-1)).</BM> Hierbij moet <M>T_1 = {T1}</M> uiteraard in Kelvin staan. Het bovenstaande oplossen voor <M>T_2</M> gaat via <BM>T_2^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BM>
				<BM>T_2 = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \left(\frac{p2.float}{p1.float}\right)^(\frac({n}-1)({n})) = {T2}.</BM>
			Merk op dat we de druk in <M>{p1.unit}</M> mogen laten staan, omdat we met een drukverhouding rekenen.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Zoek voor lucht de specifieke gasconstante en de soortelijke warmte bij constante druk op.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="Rs" prelabel={<M>R_s=</M>} label="Specifieke gasconstante" size="s" /></Substep>
					<Substep ss={2}><FloatUnitInput id="cp" prelabel={<M>c_p=</M>} label="Soortelijke warmte (isobaar)" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, cp } = useCorrect()
			return <>
				<Par>Voor lucht geldt <M>R_s = {Rs}</M> en <M>c_p = {cp}.</M></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Vind via de druk en de temperatuur de specifieke entropieverandering.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="ds" prelabel={<M>\Delta s =</M>} label="Specifieke entropieverandering" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { n, p1, p2, T1, T2, ds, cv, cp, Rs, c } = useCorrect()
			return <>
				<Par>De entropieverandering valt te berekenen vanuit de druk en de temperatuur volgens <BM>\Delta s = c_p \ln\left(\frac(T_2)(T_1)\right) - R_s \ln\left(\frac(p_2)(p_1)\right) = {cp.float} \cdot \ln\left(\frac{T2.float}{T1.float}\right) - {Rs.float} \cdot \ln\left(\frac{p2.float}{p1.float}\right) = {ds}.</BM> Dit is negatief, wat logisch is. De procescoëfficiënt zit tussen <M>n=k</M> (isentroop, geen warmte-uitwisseling) en <M>n=1</M> (isotherm: veel warmte lozen om de temperatuur niet te laten stijgen) in. Er wordt dus een beetje warmte geloosd, wat zorgt voor een beperkte entropieafname.</Par>
				<SubHead>Alternatieve oplossing</SubHead>
				<Par>Er is ook een andere manier om dit vraagstuk op te lossen. We konden ook de soortelijke warmte van dit proces berekenen via <BM>c = c_v - \frac(R_s)(n-1) = {cv.float} - \frac{Rs.float}({n.float} - 1) = {c}.</BM> Vervolgens volgt de entropieverandering via <BM>\Delta s = c \ln\left(\frac(T_2)(T_1)\right) = {c.float} \cdot \ln\left(\frac{T2.float}{T1.float}\right) = {ds}.</BM></Par>
			</>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['T2', 'Rs', 'cp', 'ds'], exerciseData)
}

