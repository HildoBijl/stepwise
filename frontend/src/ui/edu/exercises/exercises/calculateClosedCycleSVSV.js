import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par, SubHead } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'
import { InputTable } from 'ui/components/misc/InputTable'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const colHeads = ['Druk', 'Volume', 'Temperatuur']
const rowHeads = ['Punt 1', 'Punt 2', 'Punt 3', 'Punt 4']
const fields = [[
	<FloatUnitInput id="p1" label={<M>p_1</M>} size="l" />,
	<FloatUnitInput id="V1" label={<M>V_1</M>} size="l" />,
	<FloatUnitInput id="T1" label={<M>T_1</M>} size="l" />,
], [
	<FloatUnitInput id="p2" label={<M>p_2</M>} size="l" />,
	<FloatUnitInput id="V2" label={<M>V_2</M>} size="l" />,
	<FloatUnitInput id="T2" label={<M>T_2</M>} size="l" />,
], [
	<FloatUnitInput id="p3" label={<M>p_3</M>} size="l" />,
	<FloatUnitInput id="V3" label={<M>V_3</M>} size="l" />,
	<FloatUnitInput id="T3" label={<M>T_3</M>} size="l" />,
], [
	<FloatUnitInput id="p4" label={<M>p_4</M>} size="l" />,
	<FloatUnitInput id="V4" label={<M>V_4</M>} size="l" />,
	<FloatUnitInput id="T4" label={<M>T_4</M>} size="l" />,
]]

const Problem = ({ p1, V1, T1, p2, p3 }) => <>
	<Par>We bekijken een viertaktmotor die een Otto-cyclus uitvoert. Eerst zuigt de motor <M>{V1}</M> lucht aan op <M>{p1}</M> en <M>{T1}</M> (punt 1). Bij het omhoog gaan van de zuiger wordt deze lucht isentropisch gecomprimeerd tot <M>{p2}.</M> Vervolgens vindt de verbranding plaats, die de druk isochoor verder ophoogt tot <M>{p3}.</M> Hierna wordt de zuiger isentropisch weer terug omlaag geduwd tot het beginvolume. Ten slotte wordt de lucht uitgestoten en wordt weer verse lucht aangezogen. (Je kunt deze stap zien als "isochore koeling".) Bereken de gaseigenschappen voor elk punt in dit kringproces.</Par>
	<InputSpace>
		<InputTable {...{ colHeads, rowHeads, fields }} />
	</InputSpace>
</>

const steps = [
	{
		Problem: () => <>
			<Par>Omdat er waarden in punten 1 en 2 gegeven zijn, is het het handigst om eerst proces 1-2 te bekijken. Reken dit isentrope proces door.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[0], rowHeads[1]]} fields={[fields[0], fields[1]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, k, p1, V1, T1, p2, V2, T2 } = useSolution()
			return <>
				<Par>
					In punt 1 is alles bekend behalve de massa. Het is dus handig om hieruit de massa te berekenen. Via de gaswet vinden we
					<BM>m = \frac(p_1V_1)(R_sT_1) = \frac({p1.float} \cdot {p2.float})({Rs.float} \cdot {T1.float}) = {m}.</BM>
					In punt 2 was al gegeven dat <M>p_2 = {p2}.</M> Omdat proces 1-2 isentroop is geldt hierbij <M>n = k</M> en voor lucht geldt <M>k = {k}.</M> Via Poisson's wet <M>p_1V_1^n = p_2V_2^n</M> vinden we zo
					<BM>V_2^n = \frac(p_1)(p_2) V_1^n,</BM>
					<BM>V_2 = \left(\frac(p_1)(p_2) V_1^n\right)^(\frac(1)(n)) = \left(\frac(p_1)(p_2)\right)^(\frac(1)(n)) V_1 = \left(\frac{p1.float}{p2.float}\right)^(\frac{1}{k}) \cdot {V1.float} = {V2}.</BM>
					De temperatuur <M>T_2</M> volgt via de gaswet als
					<BM>T_2 = \frac(p_2V_2)(mR_s) = \frac({p2.float} \cdot {V2.float})({m.float} \cdot {Rs.float}) = {T2}.</BM>
					Hiermee is ook punt 2 doorgerekend.
					<SubHead>Short-cut</SubHead>
					We konden <M>T_2</M> ook vinden met de kennis dat <M>\frac(pV)(T)</M> constant blijft. Oftewel,
					<BM>\frac(p_1V_1)(T_1) = \frac(p_2V_2)(T_2),</BM>
					<BM>T_2 = \frac(p_1)(p_2) \cdot \frac(V_1)(V_2) \cdot T_1 = \frac{p1.float}{p2.float} \cdot \frac{V1.float}{V2.float} \cdot {T1.float} = {T2}.</BM>
					Het voordeel is dat we nu de massa van het gas niet hoefden te berekenen. Desondanks is de massa bij de latere stappen ook handig (hoewel deze short-cut daar ook werkt) dus is het mooi dat we deze nu weten.
				</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>In punt 3 is de druk gegeven. Gebruik dit om het isochore proces 2-3 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, p3, V3, T3 } = useSolution()
			return <Par>Gegeven is dat <M>p_3 = {p3}.</M> Omdat proces 2-3 isochoor is geldt verder <M>V_3 = V_2 = {V3}.</M> Via de gaswet volgt <BM>T_3 = \frac(p_3V_3)(mR_s) = \frac({p3.float} \cdot {V3.float})({m.float} \cdot {Rs.float}) = {T3}.</BM> Daarmee is punt 3 bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Gebruik het feit dat proces 3-4 isentroop is en proces 4-1 isochoor om punt 4 door te rekenen.</Par>
			<InputSpace>
				<InputTable colHeads={colHeads} rowHeads={[rowHeads[2]]} fields={[fields[2]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { m, Rs, k, p3, V3, p4, V4, T4 } = useSolution()
			return <Par>
				Omdat proces 4-1 isotherm is geldt <M>V_4 = V_1 = {V4}.</M> Proces 3-4 is isentroop, wat betekent dat we Poisson's wet moeten gebruiken. Via <M>p_3V_3^n = p_4V_4^n</M> vinden we zo
				<BM>V_4^n = \frac(p_3)(p_4) V_3^n,</BM>
				<BM>V_4 = \left(\frac(p_3)(p_4) V_3^n\right)^(\frac(1)(n)) = \left(\frac(p_3)(p_4)\right)^(\frac(1)(n)) V_3 = \left(\frac{p3.float}{p4.float}\right)^(\frac{1}{k}) \cdot {V3.float} = {V4}.</BM>
				Ten slotte volgt via de gaswet <M>T_4</M> als
				<BM>T_4 = \frac(p_4V_4)(mR_s) = \frac({p4.float} \cdot {V4.float})({m.float} \cdot {Rs.float}) = {T4}.</BM>
				En zo is het probleem volledig opgelost.
			</Par>
		},
	},
]