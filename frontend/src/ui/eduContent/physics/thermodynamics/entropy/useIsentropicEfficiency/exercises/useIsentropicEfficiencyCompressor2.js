import React from 'react'

import { Par, SubHead, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} />
}

const Problem = ({ p1, p2, T1, etaio }) => <>
	<Par>Een compressor in een gasturbine comprimeert lucht van <M>{p1}</M> en <M>{T1}</M> tot <M>{p2}.</M> Deze compressie verloopt niet isentroop: het isentropisch rendement is <M>{etaio}.</M> Bereken de temperatuur van de lucht aan de uitgang van de compressor.</Par>
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
		Solution: ({ k, p1, p2, T1, T2p }) => {
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
			<Par>Bereken de specifieke technische arbeid die de compressor op de lucht uitoefent, in dit theoretische isentrope geval. (Merk op: je antwoorden moeten positieve getallen zijn.)</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wti" prelabel={<M>w_(t_i)=</M>} label="Theoretische specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cp, T1, T2p, wti }) => {
			return <>
				<Par>Bij de compressor wordt geen warmte toegevoerd, dus <M>q = 0.</M> De technische arbeid volgt vanuit de eerste hoofdwet als
					<BM>w_t = q - \Delta h = -\Delta h = -c_p \left(T_2 - T_1\right).</BM>
					Dit geldt zowel voor het theoretische isentrope geval als voor de werkelijkheid. Dit is echter de technische arbeid die <em>de lucht op de omgeving (compressor)</em> uitoefent. Als we de technische arbeid bekijken die <em>de compressor op de lucht</em> uitoefent, dan krijgen we het negatieve hiervan: het minteken hierboven valt weg. Zo vinden we
					<BM>w_(t_i) = c_p \left(T_(2') - T_1\right) = {cp.float} \cdot \left({T2p.float} - {T1.float}\right) = {wti}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik het isentropisch rendement om de werkelijke specifieke technische arbeid te berekenen die de compressor op de lucht uitoefent.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wt" prelabel={<M>w_t =</M>} label="Specifieke technische arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ wt, wti, etai }) => {
			return <Par>Bij een compressor is de technische arbeid in het theoretische isentrope geval altijd kleiner dan de technische arbeid in werkelijkheid. Het isentrope rendement van een compressor is dus gedefinieerd als
				<BM>\eta_i = \frac(w_(t_i))(w_t).</BM>
				Dit oplossen voor <M>w_t</M> geeft
				<BM>w_t = \frac(w_(t_i))(\eta_i) = \frac{wti.float}{etai.float} = {wt}.</BM>
				Deze technische arbeid is inderdaad hoger dan de technische arbeid in het isentrope geval.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken, aan de hand van de technische arbeid die de compressor in werkelijkheid op de lucht uitoefent, de temperatuur waarmee de lucht de compressor verlaat.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2=</M>} label="Temperatuur na compressor" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: ({ cp, T1, T2, T2p, wt, etai }) => {
			return <>
				<Par>De technische arbeid die de compressor in werkelijkheid op de lucht uitoefent voldoet nog steeds aan
					<BM>w_t = c_p \left(T_2 - T_1\right).</BM>
					Dit oplossen voor <M>T_2</M> geeft
					<BM>T_2 = T_1 + \frac(w_t)(c_p) = {T1.float} + \frac{wt.float}{cp.float} = {T2}.</BM>
					Dit is iets hoger dan de temperatuur in het isentrope geval, wat logisch is: extra frictie laat de temperatuur iets stijgen.</Par>
				<SubHead>Short-cut</SubHead>
				<Par>We hadden eventueel ook kunnen gebruiken dat
					<BM>\eta_i = \frac(w_(t_i))(w_t) = \frac(c_p \left(T_(2') - T_1\right))(c_p \left(T_2 - T_1\right)) = \frac(T_(2') - T_1)(T_2 - T_1).</BM>
					Als we dit oplossen voor <M>T_2</M> vinden we
					<BM>T_2 = T_1 + \frac(T_(2') - T_1)(\eta_i) = {T1.float} + \frac({T2p.float} - {T1.float})({etai.float}) = {T2}.</BM>
					Dan hadden we dus niet de technische arbeiden uit hoeven te rekenen.
				</Par>
			</>
		},
	},
]
