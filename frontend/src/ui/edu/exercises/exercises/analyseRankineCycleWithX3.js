import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ type, pc, pe, T2, x3, mdot, P }) => {
	return <>
		<Par>Een stoomturbine gebruikt een Rankine-cyclus. Hierbij wordt het water eerst met een pomp gecomprimeerd naar <M>{pe}</M> (punt 1). De bijbehorende pomparbeid mag worden verwaarloosd. Op deze druk wordt het water verwarmd, verdampt en oververhit tot <M>{T2}</M> (punt 2). Van hieruit gaat de stoom in de turbine, waar het expandeert tot een druk van <M>{pc}</M> (punt 3). De stoomturbine werkt niet isentroop, maar wel is bekend dat de dampfractie na deze expansie <M>{x3}</M> is. Tenslotte wordt de stoom isobaar gecondenseerd tot water, tot de vloeistoflijn bereikt wordt (punt 4). Vanaf hier begint alles opnieuw. De stoomturbine heeft een {type === 1 ? <>massadebiet van <M>{mdot}.</M></> : <>geleverd vermogen van <M>{P}.</M></>} Bereken het isentropisch rendement van de turbine, en het (thermodynamisch) rendement en {type === 1 ? `het geleverde vermogen` : `het massadebiet`} van de gehele Rankine-cyclus.</Par>
		<Par></Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={validNumberAndUnit} />
				<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Thermodynamisch rendement" size="s" validate={validNumberAndUnit} />
				{type === 1 ?
					<FloatUnitInput id="P" prelabel={<M>P =</M>} label="Geleverd vermogen" size="s" /> :
					<FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massadebiet" size="s" />}
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>We bekijken eerst de ideale Rankine-cyclus, waarbij de expansie in de turbine isentropisch verloopt. Hierbij hebben we niet een werkelijk punt <M>3</M> maar een fictief punt <M>3'.</M> Vind voor deze cyclus alle eigenschappen.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h1" prelabel={<M>h_1 =</M>} label={<span>Specifieke enthalpie in punt <M>1</M></span>} size="s" />
					<FloatUnitInput id="h2" prelabel={<M>h_2 =</M>} label={<span>Specifieke enthalpie in punt <M>2</M></span>} size="s" />
					<FloatUnitInput id="h3p" prelabel={<M>h_(3') =</M>} label={<span>Specifieke enthalpie in punt <M>3'</M></span>} size="s" />
					<FloatUnitInput id="h4" prelabel={<M>h_4 =</M>} label={<span>Specifieke enthalpie in punt <M>4</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { pc, pe, T2, hx0, hx1, sx0, sx1, h1, h2, s2, s3p, x3p, h3p, h4 } = useCorrect()
			return <>
				<Par>Om deze ideale cyclus door te rekenen is het handig om in punt 4 te beginnen. Dit punt ligt op een druk van <M>{pc}</M> op de vloeistoflijn, waardoor <BM>h_4 = h_(x=0) = {h4}.</BM> Het water wordt via een pomp op een druk van <M>{pe}</M> gebracht, waarbij de pomparbeid te verwaarlozen is. Dit betekent dat <BM>h_1 = h_4 = {h1}.</BM> Vanaf hier wordt het water op constante druk aan het koken gebracht, verdampt en oververhit tot <M>{T2}.</M> De eigenschappen van het stoom kunnen we opzoeken als <BM>h_2 = {h2},</BM><BM>s_2 = {s2}.</BM> In deze ideale Rankine-cyclus verloopt de expansie in de turbine isentroop. Zo komen we op het fictieve punt <M>3'.</M> Dit punt heeft als entropie dus <BM>s_(3') = s_2 = {s3p}.</BM> De dampfractie die hierbij hoort is <BM>x_(3') = \frac(s_(3') - s_(x=0))(s_(x=1) - s_(x=0)) = \frac({s3p.float} - {sx0.float})({sx1.float} - {sx0.float}) = {x3p.setDecimals(3)}.</BM> Via deze dampfractie vinden we de specifieke enthalpie in punt <M>3'</M> als <BM>h_(3') = h_(x=0) + x_(3') \left(h_(x=1) - h_(x=0)\right) = {hx0.float} + {x3p.setDecimals(3).float} \cdot \left({hx1.float} - {hx0.float}\right) = {h3p}.</BM> Hiermee zijn alle eigenschappen van deze ideale Rankine-cyclus bekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de gegeven dampfractie de werkelijke specifieke enthalpie in punt <M>3.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h3" prelabel={<M>h_3 =</M>} label="Specifieke enthalpie in punt 3" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { hx0, hx1, x3, h3 } = useCorrect()
			return <Par>Via de dampfractie <M>x_3</M> kunnen we direct de specifieke enthalpie <M>h_3</M> vinden als <BM>h_3 = h_(x=0) + x_3 \left(h_(x=1) - h_(x=0)\right) = {hx0.float} + {x3.float} \cdot \left({hx1.float} - {hx0.float}\right) = {h3}.</BM></Par>
		},
	},
	{
		Problem: ({ type }) => <>
			<Par>Bereken met behulp van de enthalpie-waarden het isentropisch rendement van de turbine en het (thermodynamisch) rendement van de cyclus. {type === 1 ? `Gebruik ook het massadebiet om het geleverde vermogen te berekenen.` : `Gebruik ook het geleverde vermogen om het massadebiet te berekenen.`}</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="etai" prelabel={<M>\eta_i =</M>} label="Isentropisch rendement" size="s" validate={validNumberAndUnit} /></Substep>
					<Substep ss={2}><FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={validNumberAndUnit} /></Substep>
					<Substep ss={3}>{type === 1 ?
						<FloatUnitInput id="P" prelabel={<M>P =</M>} label="Geleverd vermogen" size="s" /> :
						<FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massadebiet" size="s" />}</Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { type, h1, h2, h3p, h3, etai, wt, q, eta, mdot, P } = useCorrect()
			return <>
				<Par>We kunnen het isentropisch rendement van de turbine direct vinden via de definitie <BM>\eta_i = \frac(w_t)(w_t') = \frac(h_2 - h_3)(h_2 - h_(3')) = \frac({h2.float} - {h3.float})({h2.float} - {h3p.float}) = {etai}.</BM> Een isentropisch rendement van <M>{etai.setUnit('%')}</M> is redelijk realistisch voor een stoomturbine.</Par>
				<Par>Vervolgens berekenen we het (thermodynamisch) rendement van de cyclus. De technische arbeid die in de turbine geleverd wordt is <BM>w_t = h_2 - h_3 = {h2.float} - {h3.float} = {wt}.</BM> De warmte die wordt toegevoerd is <BM>q = h_2 - h_1 = {h2.float} - {h1.float} = {q}.</BM> Hiermee vinden we een rendement van <BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(w_t)(q) = \frac{wt.float}{q.float} = {eta}.</BM> Een thermodynamisch rendement van <M>{eta.setUnit('%')}</M> is ook realistisch voor een stoomturbine.</Par>
				{type === 1 ?
					<Par>Om het geleverde vermogen te berekenen gebruiken we het massadebiet. Dit gaat via <BM>P = \dot(m) w_t = {mdot.float} \cdot {wt.float} = {P.setUnit('kW')}.</BM> Een vermogen van <M>{P}</M> is een realistische waarde voor een redelijk grote stoomturbine.</Par> :
					<Par>Om het massadebiet te berekenen gebruiken we het geleverde vermogen. We weten dat <M>P = \dot(m) w_t</M> waardoor <BM>\dot(m) = \frac(P)(w_t) = \frac{P.setUnit('kW').float}{wt.float} = {mdot}.</BM> Dit is een realistische waarde voor een redelijk grote stoomturbine.</Par>}
			</>
		},
	},
]