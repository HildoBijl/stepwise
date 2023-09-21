import React from 'react'

import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import StepExercise from '../types/StepExercise'
import Substep from '../types/StepExercise/Substep'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p1, p2, T1, T3, etai, P }) => {
	return <>
		<Par>In een gasturbine doorloopt lucht een kringproces van Brayton. Aan het begin is de druk <M>{p1}</M> en de temperatuur <M>{T1}.</M> Een compressor comprimeert de lucht naar <M>{p2}.</M> Hierna wordt de lucht isobaar verwarmd tot <M>{T3}.</M> Na een turbine, waarin arbeid door de lucht geleverd wordt, wordt de lucht weer isobaar gekoeld tot het beginpunt. (In de praktijk wordt de lucht uitgestoten en wordt nieuwe lucht aangezogen.)</Par>
		<Par>Voor deze gasturbine geldt verder dat de compressor en de turbine <em>niet</em> isentroop werken: ze hebben elk een isentropisch rendement van <M>{etai}.</M> Bereken het thermodynamisch rendement van deze gasturbine. Bereken ook de massastroom lucht <M>\dot(m)</M>, gegeven dat het geleverde (netto) asvermogen <M>{P}</M> is.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massadebiet" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Neem eerst aan dat de compressor en de turbine <em>wel</em> isentroop werken. Maak een overzicht van de gaseigenschappen in elk punt.</Par>
			<InputSpace>
				<InputTable
					colHeads={['Druk', 'Temperatuur']}
					rowHeads={['Punt 1', 'Punt 2\'', 'Punt 3', 'Punt 4\'']}
					fields={[[
						<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
						<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
					], [
						<FloatUnitInput id="p2" label={<M>p_(2')</M>} size="l" />,
						<FloatUnitInput id="T2p" label={<M>T_(2')</M>} size="l" />,
					], [
						<FloatUnitInput id="p3" label={<M>p_3</M>} size="l" />,
						<FloatUnitInput id="T3" label={<M>T_3</M>} size="l" />,
					], [
						<FloatUnitInput id="p4" label={<M>p_(4')</M>} size="l" />,
						<FloatUnitInput id="T4p" label={<M>T_(4')</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { k, p1, T1, p2, T2p, p3, T3, p4, T4p } = useSolution()
			return <>
				<Par>In punt 1 is al bekend dat <M>p_1 = {p1}</M> en <M>T_1 = {T1}.</M> We bereiken het fictieve punt <M>2'</M> via isentrope compressie. Met <M>p_(2') = p_2 = {p2}</M> vinden we
					<BM>T_(2') = T_1 \left(\frac(p_(2'))(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2p}.</BM>
					Voor punt 3 is gegeven dat <M>T_3 = {T3}</M> en omdat stap 2-3 isobaar is geldt ook <M>p_3 = p_2 = {p3}.</M> Stap 4-1 is ook isobaar, waardoor <M>p_(4') = p_4 = p_1 = {p4}.</M> We vinden <M>T_(4')</M> wederom via Poisson's wet als
					<BM>T_(4') = T_3 \left(\frac(p_(4'))(p_3)\right)^(\frac(n-1)(n)) = {T3.float} \cdot \left(\frac{p4.float}{p3.float}\right)^(\frac({k}-1)({k})) = {T4p}.</BM>
					Hiermee is overal de druk en de temperatuur bekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via het isentropisch rendement de werkelijke temperaturen na de compressor en turbine.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2 =</M>} label="Temperatuur na compressor" size="s" />
					<FloatUnitInput id="T4" prelabel={<M>T_4 =</M>} label="Temperatuur na turbine" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T2p, T3, T4, T4p, etai } = useSolution()
			return <Par>Bij de compressor heb je vanwege frictie in werkelijkheid meer arbeid nodig dan in de perfecte (isentrope) situatie. Dit isentropisch rendement is dus
				<BM>\eta_(i_c) = \frac(w_(t_i))(w_t) = \frac(c_p \left(T_(2') - T_1\right))(c_p \left(T_2 - T_1\right)) = \frac(T_(2') - T_1)(T_2 - T_1).</BM>
				De oplossing voor <M>T_2</M> volgt als
				<BM>T_2 = T_1 + \frac(T_(2') - T_1)(\eta_(i_c)) = {T1.float} + \frac({T2p.float} - {T1.float})({etai.float}) = {T2}.</BM>
				Bij de turbine is het andersom: daar heb je vanwege frictie in werkelijkheid juist minder geleverde arbeid dan in de perfecte (isentrope) situatie. Hier is het isentropisch rendement dus
				<BM>\eta_(i_t) = \frac(w_t)(w_(t_i)) = \frac(c_p \left(T_4 - T_3\right))(c_p \left(T_(4') - T_3\right)) = \frac(T_4 - T_3)(T_(4') - T_3).</BM>
				De oplossing voor <M>T_4</M> is
				<BM>T_4 = T_3 - \eta_(i_t) \left(T_3 - T_(4')\right) = {T3.float} - {etai.float} \cdot \left({T3.float} - {T4p.float}\right) = {T4}.</BM>
				Zo hebben we de werkelijke temperaturen na de compressor en turbine berekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Maak een overzicht van de toegevoerde specifieke warmte en de geleverde technische arbeid in elk proces.</Par>
			<InputSpace>
				<InputTable
					colHeads={[<span>Specifieke warmte <M>q</M></span>, <span>Technische arbeid <M>w_t</M></span>]}
					rowHeads={['Stap 1-2', 'Stap 2-3', 'Stap 3-4', 'Stap 4-1']}
					fields={[[
						<FloatUnitInput id="q12" label={<M>q_(1-2)</M>} size="l" />,
						<FloatUnitInput id="wt12" label={<M>w_(t,1-2)</M>} size="l" />,
					], [
						<FloatUnitInput id="q23" label={<M>q_(2-3)</M>} size="l" />,
						<FloatUnitInput id="wt23" label={<M>w_(t,2-3)</M>} size="l" />,
					], [
						<FloatUnitInput id="q34" label={<M>q_(3-4)</M>} size="l" />,
						<FloatUnitInput id="wt34" label={<M>w_(t,3-4)</M>} size="l" />,
					], [
						<FloatUnitInput id="q41" label={<M>q_(4-1)</M>} size="l" />,
						<FloatUnitInput id="wt41" label={<M>w_(t,4-1)</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T1, T2, T3, T4, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn } = useSolution()
			return <>
				<Par>Bij de compressor (stap 1-2) wordt geen warmte toegevoerd waardoor <M>q_(1-2) = {q12}.</M> Vervolgens geldt vanuit de eerste hoofdwet
					<BM>w_(t,1-2) = -\Delta h = -c_p \left(T_2 - T_1\right) = -{cp.float} \cdot \left({T2.float} - {T1.float}\right) = {wt12}.</BM>
					Bij de isobare stap 2-3 geldt <M>w_(t,2-3) = {wt23}</M> en
					<BM>q_(2-3) = c_p \left(T_3 - T_2\right) = {cp.float} \cdot \left({T3.float} - {T2.float}\right) = {q23}.</BM>
					Bij de turbine (stap 3-4) wordt geen warmte toegevoerd waardoor <M>q_(3-4) = {q34}.</M> Vervolgens geldt vanuit de eerste hoofdwet
					<BM>w_(t,3-4) = -\Delta h = -c_p \left(T_4 - T_3\right) = -{cp.float} \cdot \left({T4.float} - {T3.float}\right) = {wt34}.</BM>
					Bij de isobare stap 4-1 geldt <M>w_(t,4-1) = {wt41}</M> en
					<BM>q_(4-1) = c_p \left(T_1 - T_4\right) = {cp.float} \cdot \left({T1.float} - {T4.float}\right) = {q41}.</BM>
					Zo zijn alle energiestromen bekend.</Par>
				<Par>Als check controleren we de energiebalans. Zo vinden we
					<BMList>
						<BMPart>q_(netto) = q_(1-2) + q_(2-3) + q_(3-4) + q_(4-1) = {q12.float} {q23.float.texWithPM} {q34.float.texWithPM} {q41.float.texWithPM} = {wn},</BMPart>
						<BMPart>w_(netto) = w_(t,1-2) + w_(t,2-3) + w_(t,3-4) + w_(t,4-1) = {wt12.float} {wt23.float.texWithPM} {wt34.float.texWithPM} {wt41.float.texWithPM} = {wn}.</BMPart>
					</BMList>
					Deze waarden zijn gelijk aan elkaar, dus we hebben geen rekenfout gemaakt.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken, gebaseerd op de energiestromen, het rendement van de gasturbine. Bereken ook via het gegeven asvermogen de gebruikte massastroom.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={FloatUnitInput.validation.any} /></Substep>
					<Substep ss={2}><FloatUnitInput id="mdot" prelabel={<M>\dot(m) =</M>} label="Massadebiet" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { P, wn, qin, eta, mdot } = useSolution()
			return <Par>Er wordt alleen bij stap 2-3 warmte toegevoerd. De toegevoerde warmte is dus <M>q_(toe) = q_(2-3) = {qin}.</M> De netto arbeid is al bekend als <M>w_(netto) = {wn}.</M> Hiermee volgt het rendement als
				<BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(w_(netto))(q_(toe)) = \frac{wn.float}{qin.float} = {eta}.</BM>
				Dit komt neer op <M>{eta.setUnit('%')}</M> wat redelijk normaal is voor een gasturbine. We vinden de massastroom via de vergelijking <M>P = \dot(m) w_(netto).</M> Het resultaat is
				<BM>\dot(m) = \frac(P)(w_(netto)) = \frac{P.float}{wn.float} = {mdot}.</BM>
				Dit is een best grote hoeveelheid, maar een gasturbine van <M>{state.P}</M> is dan ook een flinke installatie.</Par>
		},
	},
]