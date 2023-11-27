import React from 'react'

import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, Substep, useSolution, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ p1, T1, p2, T3, P }) => {
	return <>
		<Par>We bekijken een gasturbine-installatie. Hierin doorloopt lucht continu een Braytoncyclus: isentrope compressie, isobare verwarming, isentrope expansie en isobare koeling. Het koelen gebeurt door de warme lucht uit te stoten en nieuwe lucht aan te zuigen, maar dat is hier niet relevant.</Par>
		<Par>Bij aanvang (punt 1) heeft de lucht een druk van <M>{p1}</M> en een temperatuur van <M>{T1}.</M> Na de compressie is de druk <M>{p2}</M> en na de verwarming is de temperatuur <M>{T3}.</M> Bereken het rendement van deze gasturbine. Bereken ook de massastroom lucht <M>\dot(m)</M>, gegeven dat het geleverde (netto) asvermogen <M>{P}</M> is.</Par>
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
			<Par>Maak een overzicht van de gaseigenschappen in elk punt.</Par>
			<InputSpace>
				<InputTable
					colHeads={['Druk', 'Specifiek volume', 'Temperatuur']}
					rowHeads={['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']}
					fields={[[
						<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
						<FloatUnitInput id="v1" label={<M>v_1</M>} size="l" />,
						<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
					], [
						<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
						<FloatUnitInput id="v2" label={<M>v_2</M>} size="l" />,
						<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
					], [
						<FloatUnitInput id="p3" label={<M>p_3</M>} size="l" />,
						<FloatUnitInput id="v3" label={<M>v_3</M>} size="l" />,
						<FloatUnitInput id="T3" label={<M>T_3</M>} size="l" />,
					], [
						<FloatUnitInput id="p4" label={<M>p_4</M>} size="l" />,
						<FloatUnitInput id="v4" label={<M>v_4</M>} size="l" />,
						<FloatUnitInput id="T4" label={<M>T_4</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = useSolution()
			return <>
				<Par>In punt 1 is al bekend dat <M>p_1 = {p1}</M> en <M>T_1 = {T1}.</M> Voor punt 2 weten we <M>p_2 = {p2}.</M> We vinden <M>T_2</M> via Poisson's wet als
					<BM>T_2 = T_1 \left(\frac(p_2)(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2}.</BM>
					Voor punt 3 is gegeven dat <M>T_3 = {T3}</M> en omdat stap 2-3 isobaar is geldt ook <M>p_3 = p_2 = {p3}.</M> Stap 4-1 is ook isobaar, waardoor <M>p_4 = p_1 = {p4}.</M> We vinden <M>T_4</M> wederom via Poisson's wet als
					<BM>T_4 = T_3 \left(\frac(p_4)(p_3)\right)^(\frac(n-1)(n)) = {T3.float} \cdot \left(\frac{p4.float}{p3.float}\right)^(\frac({k}-1)({k})) = {T4}.</BM>
					Hiermee is overal de druk en de temperatuur bekend. Het specifieke volume volgt via de gaswet als
					<BMList>
						<BMPart>v_1 = \frac(R_sT_1)(p_1) = \frac({Rs.float} \cdot {T1.float})({p1.float}) = {v1},</BMPart>
						<BMPart>v_2 = \frac(R_sT_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2},</BMPart>
						<BMPart>v_3 = \frac(R_sT_3)(p_3) = \frac({Rs.float} \cdot {T3.float})({p3.float}) = {v3},</BMPart>
						<BMPart>v_4 = \frac(R_sT_4)(p_4) = \frac({Rs.float} \cdot {T4.float})({p4.float}) = {v4}.</BMPart>
					</BMList>
					Daarmee zijn alle eigenschappen bekend.</Par>
			</>
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
			const { cp, T1, T2, T3, T4, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn } = useSolution()
			return <>
				<Par>Bij de isentrope stap 1-2 geldt <M>q_(1-2) = {q12}</M> en
					<BM>w_(t,1-2) = -\Delta h = -c_p \left(T_2 - T_1\right) = -{cp.float} \cdot \left({T2.float} - {T1.float}\right) = {wt12}.</BM>
					Bij de isobare stap 2-3 geldt <M>w_(t,2-3) = {wt23}</M> en
					<BM>q_(2-3) = c_p \left(T_3 - T_2\right) = {cp.float} \cdot \left({T3.float} - {T2.float}\right) = {q23}.</BM>
					Bij de isentrope stap 3-4 geldt <M>q_(3-4) = {q34}</M> en
					<BM>w_(t,3-4) = -\Delta h = -c_p \left(T_4 - T_3\right) = -{cp.float} \cdot \left({T4.float} - {T3.float}\right) = {wt34}.</BM>
					Bij de isobare stap 4-1 geldt <M>w_(t,4-1) = {wt41}</M> en
					<BM>q_(4-1) = c_p \left(T_1 - T_4\right) = {cp.float} \cdot \left({T1.float} - {T4.float}\right) = {q41}.</BM>
					Zo zijn alle energiestromen bekend.</Par>
				<Par>Als check controleren we de energiebalans. Zo vinden we
					<BMList>
						<BMPart>q_(netto) = q_(1-2) + q_(2-3) + q_(3-4) + q_(4-1) = {q12.float} {q23.float.texWithPM} {q34.float.texWithPM} {q41.float.texWithPM} = {qn},</BMPart>
						<BMPart>w_(netto) = w_(t,1-2) + w_(t,2-3) + w_(t,3-4) + w_(t,4-1) = {wt12.float} {wt23.float.texWithPM} {wt34.float.texWithPM} {wt41.float.texWithPM} = {wn}.</BMPart>
					</BMList>
					Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.</Par>
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
				We vinden de massastroom via de vergelijking <M>P = \dot(m) w_(netto).</M> Het resultaat is
				<BM>\dot(m) = \frac(P)(w_(netto)) = \frac{P.float}{wn.float} = {mdot}.</BM>
				Dit is een best grote hoeveelheid, maar een gasturbine van <M>{state.P}</M> is dan ook een flinke installatie.</Par>
		},
	},
]