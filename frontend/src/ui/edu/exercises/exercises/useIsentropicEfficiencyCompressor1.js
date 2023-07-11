import React from 'react'

import { Par, SubHead, M, BM, BMList, BMPart } from 'ui/components'
import FloatUnitInput, { any } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p1, p2, T1, T2 }) => <>
	<Par>Een compressor in een gasturbine comprimeert lucht van <M>{p1}</M> en <M>{T1}</M> tot <M>{p2}</M> en <M>{T2}.</M> Deze compressie verloopt niet isentroop. Bereken het isentropisch rendement.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={any} />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Stel dat de compressor <em>wel</em> isentroop werkt. Bereken in dit geval de temperatuur van de lucht aan de uitgang van de compressor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2p" prelabel={<M>T_(2')=</M>} label="Theoretische temperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { k, p1, p2, T1, T2p } = useSolution()
			return <Par>Poisson's wet zegt dat in dit geval <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_(2')^n)(p_2^(n-1)).</BM> Het oplossen van de theoretische temperatuur <M>T_(2')</M> gaat via
				<BMList>
					<BMPart>T_(2')^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BMPart>
					<BMPart>T_(2') = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2p}.</BMPart>
				</BMList>
				Dit is de temperatuur na de compressor als de compressor isentroop zou werken.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de specifieke technische arbeid die de compressor op de lucht uitoefent, zowel voor het theoretische isentrope geval als in werkelijkheid. (Merk op: je antwoorden moeten positieve getallen zijn.)</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wti" prelabel={<M>w_(t_i)=</M>} label="Theoretische specifieke technische arbeid" size="s" />
					<FloatUnitInput id="wt" prelabel={<M>w_t=</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T1, T2, T2p, wt, wti } = useSolution()
			return <>
				<Par>Bij de compressor wordt geen warmte toegevoerd, dus <M>q = 0.</M> De technische arbeid volgt vanuit de eerste hoofdwet als
					<BM>w_t = q - \Delta h = -\Delta h = -c_p \left(T_2 - T_1\right).</BM>
					Dit geldt zowel voor het theoretische isentrope geval als voor de werkelijkheid. Dit is echter de technische arbeid die <em>de lucht op de omgeving (compressor)</em> uitoefent. Voor de arbeid die <em>de compressor op de lucht</em> uitoefent, is het teken omgekeerd: het minteken hierboven valt weg. Zo vinden we
					<BMList>
						<BMPart>w_(t_i) = c_p \left(T_(2') - T_1\right) = {cp.float} \cdot \left({T2p.float} - {T1.float}\right) = {wti},</BMPart>
						<BMPart>w_t = c_p \left(T_2 - T_1\right) = {cp.float} \cdot \left({T2.float} - {T1.float}\right) = {wt}.</BMPart>
					</BMList>
					Merk op dat de werkelijke technische arbeid groter is dan de technische arbeid in het optimale geval. Dit is logisch: als er frictie aanwezig is, heeft een compressor meer arbeid nodig.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken het isentropisch rendement door de theoretische isentrope situatie met de werkelijkheid te vergelijken.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T2p, wt, wti, etai } = useSolution()
			return <>
				<Par>Het isentropisch rendement is altijd een getal tussen de <M>0</M> en de <M>1.</M> We moeten bij een compressor dus de theoretische technische arbeid (het kleinere getal) delen door de werkelijke technische arbeid (het grotere getal). Zo vinden we <BM>\eta_i = \frac(w_(t_i))(w_t) = \frac{wti.float}{wt.float} = {etai}.</BM> Merk op dat een eventueel minteken in de waarden van <M>w_(t_i)</M> en <M>w_t</M> hier geen effect gehad zou hebben. Ook geldt dat een isentropisch rendement van <M>{etai.setUnit('%')}</M> redelijk reëel is voor een compressor.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden eventueel ook het isentropisch rendement gelijk vanuit de temperaturen kunnen berekenen via
					<BM>\eta_i = \frac(w_(t_i))(w_t) = \frac(c_p \left(T_(2') - T_1\right))(c_p \left(T_2 - T_1\right)) = \frac(T_(2') - T_1)(T_2 - T_1) = \frac({T2p.float} - {T1.float})({T2.float} - {T1.float}) = {etai}.</BM>
				</Par>
			</>
		},
	},
]