import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p1, p2, T1, etai }) => <>
	<Par>Een compressor in een gasturbine comprimeert lucht van <M>{p1}</M> en <M>{T1}</M> tot <M>{p2}.</M> Deze compressie verloopt niet isentroop: het isentropisch rendement is <M>{etai}.</M> Bereken de temperatuur van de lucht aan de uitgang van de compressor.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="T2" prelabel={<M>T_2 =</M>} label="Temperatuur na compressor" size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Stel dat de compressor <em>wel</em> isentroop was. Bereken in dit geval de temperatuur van de lucht aan de uitgang van de compressor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2p" prelabel={<M>T_(2')=</M>} label="Theoretische temperatuur na compressor" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { k, p1, p2, T1, T2p } = useCorrect()
			return <Par>Poisson's wet zegt dat in dit geval <BM>\frac(T_1^n)(p_1^(n-1)) = \frac(T_(2')^n)(p_2^(n-1)).</BM> Het oplossen van de theoretische temperatuur <M>T_(2')</M> gaat via
			<BM>T_(2')^n = T_1^n \frac(p_2^(n-1))(p_1^(n-1)) = T_1^n \left(\frac(p_2)(p_1)\right)^(n-1),</BM>
				<BM>T_(2') = \left(T_1^n \left(\frac(p_2)(p_1)\right)^(n-1)\right)^(\frac(1)(n)) = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2p}.</BM>
				Dit is de temperatuur na de compressor als de compressor isentroop zou werken.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de specifieke technische arbeid die de lucht in de compressor levert, in dit theoretische isentrope geval.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wti" prelabel={<M>w_(t_i)=</M>} label="Theoretische specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T1, T2p, wti } = useCorrect()
			return <>
				<Par>Bij de compressor wordt geen warmte toegevoerd, dus <M>q = 0.</M> De technische arbeid volgt vanuit de eerste hoofdwet als
				<BM>w_t = q - \Delta h = -\Delta h = -c_p \left(T_2 - T_1\right).</BM>
				Dit geldt zowel voor het theoretische isentrope geval als voor de werkelijkheid. Zo vinden we
				<BM>w_(t_i) = -c_p \left(T_(2') - T_1\right) = -{cp.float} \cdot \left({T2p.float} - {T1.float}\right) = {wti}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik het isentropisch rendement om de werkelijke specifieke technische arbeid die de lucht in de compressor levert te berekenen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { wt, wti, etai } = useCorrect()
			return <Par>Bij een compressor is de technische arbeid in het theoretische isentrope geval altijd kleiner dan de technische arbeid in werkelijkheid. Het isentrope rendement van een compressor is dus gedefinieerd als
					<BM>\eta_i = \frac(w_(t_i))(w_t).</BM>
					Dit oplossen voor <M>w_t</M> geeft
					<BM>w_t = \frac(w_(t_i))(\eta_i) = \frac{wti.float}{etai.float} = {wt}.</BM>
					Deze technische arbeid is inderdaad hoger dan de technische arbeid in het isentrope geval.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de specifieke technische arbeid van de compressor in dit theoretische isentrope geval.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Temperatuur na compressor" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T1, T2, T2p, wt, etai } = useCorrect()
			return <>
				<Par>Voor de werkelijke situatie geldt ook
					<BM>w_t = -\Delta h = -c_p \left(T_2 - T_1\right).</BM>
					Dit oplossen voor <M>T_2</M> geeft
					<BM>T_2 = T_1 - \frac(w_t)(c_p) = {T1.float} - \frac{wt.float}{cp.float} = {T2}.</BM>
					Dit is iets hoger dan de temperatuur in het isentrope geval, wat logisch is: extra frictie laat de temperatuur iets stijgen.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden eventueel ook kunnen gebruiken dat
				<BM>\eta_i = \frac(w_(t_i))(w_t) = \frac(c_p \left(T_(2') - T_1\right))(c_p \left(T_2 - T_1\right)) = \frac(T_(2') - T_1)(T_2 - T_1) = \frac({T2p.float} - {T1.float})({T2.float} - {T1.float}) = {etai}.</BM>
				Als we dit oplossen voor <M>T_2</M> vinden we
				<BM>T_2 = T_1 + \frac(T_(2') - T_1)(\eta_i) = {T1.float} + \frac({T2p.float} - {T1.float})({etai.float}) = {T2}.</BM>
				Dan hadden we dus niet de technische arbeiden uit hoeven te rekenen.
				</Par>
			</>
		},
	},
]