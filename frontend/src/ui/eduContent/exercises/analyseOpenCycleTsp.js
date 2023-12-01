import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M, BM, BMList, BMPart, InputTable } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { StepExercise, Substep, useSolution, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ medium, mdot, p1, T1, p2 }) => {
	return <>
		<Par>Een uitvinder heeft een nieuw soort koelproces ontworpen. Hierbij wordt gebruik gemaakt van een kringproces waar continu {Dutch[medium]} doorstroomt. Bij aanvang heeft dit gas een druk van <M>{p1}</M> en een temperatuur van <M>{T1}.</M> Dit gas wordt isotherm gecomprimeerd tot <M>{p2}</M>, om vervolgens isentroop te expanderen tot de begindruk. De arbeid geleverd bij de expansie wordt teruggewonnen om te helpen bij de eerste compressiestap. Na deze isentropische expansie wordt het gas weer opgewarmd tot het de begintoestand bereikt heeft. Deze laatste stap is de stap waarbij de warmte uit de te koelen ruimte wordt onttrokken.</Par>
		<Par>Bepaal voor dit koelproces de koudefactor en de warmtefactor. Bepaal ook het koelvermogen, gegeven een massastroom {Dutch[medium]} van <M>{mdot}.</M></Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} />
				<FloatUnitInput id="Pc" prelabel={<M>P_(koel) =</M>} label="Koelvermogen" size="s" />
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
					rowHeads={['Punt 1', 'Punt 2', 'Punt 3']}
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
					]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3 } = useSolution()
			return <>
				<Par>In punt 1 is al gegeven dat <M>p_1 = {p1}</M> en <M>T_1 = {T1}.</M> Het specifieke volume <M>v_1</M> volgt via de gaswet als <BM>v_1 = \frac(R_sT_1)(p_1) = \frac({Rs.float} \cdot {T1.float})({p1.float}) = {v1}.</BM> In punt 2 geldt <M>p_2 = {p2}</M> en <M>T_2 = T_1 = {T2}</M> (isotherm proces). Via de gaswet volgt <BM>v_2 = \frac(R_sT_2)(p_2) = \frac({Rs.float} \cdot {T2.float})({p2.float}) = {v2}.</BM> In punt 3 is al bekend dat <M>p_3 = p_1 = {p3}.</M> Via Poisson's wet <M>p_2v_2^n = p_3v_3^n</M> vinden we <M>v_3</M> als <BM>v_3 = \left(\frac(p_2)(p_3)\right)^(\frac(1)(n)) \cdot v_2 = \left(\frac{p2.float}{p3.float}\right)^(\frac(1)({k})) \cdot {v2.float} = {v3}.</BM> Ten slotte volgt <M>T_3</M> via de gaswet als <BM>T_3 = \frac(p_3v_3)(R_s) = \frac({p3.float} \cdot {v3.float})({Rs.float}) = {T3}.</BM> Daarmee zijn alle eigenschappen bekend.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Maak een overzicht van de toegevoerde specifieke warmte en de geleverde technische arbeid in elk proces.</Par>
			<InputSpace>
				<InputTable
					colHeads={[<span>Specifieke warmte <M>q</M></span>, <span>Technische arbeid <M>w_t</M></span>]}
					rowHeads={['Stap 1-2', 'Stap 2-3', 'Stap 3-1']}
					fields={[[
						<FloatUnitInput id="q12" label={<M>q_(1-2)</M>} size="l" />,
						<FloatUnitInput id="wt12" label={<M>w_(t,1-2)</M>} size="l" />,
					], [
						<FloatUnitInput id="q23" label={<M>q_(2-3)</M>} size="l" />,
						<FloatUnitInput id="wt23" label={<M>w_(t,2-3)</M>} size="l" />,
					], [
						<FloatUnitInput id="q31" label={<M>q_(3-1)</M>} size="l" />,
						<FloatUnitInput id="wt31" label={<M>w_(t,3-1)</M>} size="l" />,
					]]} />
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, p1, v1, T1, v2, T2, T3, q12, wt12, q23, wt23, q31, wt31, qn, wn } = useSolution()
			return <>
				<Par>Voor de isotherme stap 1-2 zijn de energiestromen <BM>q_(1-2) = w_(t,1-2) = pv\ln\left(\frac(v_2)(v_1)\right) = {p1.float} \cdot {v1.float} \cdot \ln\left(\frac{v2.float}{v1.float}\right) = {q12}.</BM> Voor de isentrope stap 2-3 geldt <M>q_(2-3) = {q23}</M> en <BM>w_(t,2-3) = -c_p\left(T_3-T_2\right) = -{cp.float} \cdot \left({T3.float} - {T2.float}\right) = {wt23}.</BM> Ten slotte heeft de isobare stap 3-1 <BM>q_(3-1) = c_p\left(T_1 - T_3\right) = {cp.float} \cdot \left({T1.float} - {T3.float}\right) = {q31}</BM> en <M>w_(t,3-1) = {wt31}.</M></Par>
				<Par>Als check controleren we de energiebalans. Zo vinden we
					<BMList>
						<BMPart>q_(netto) = q_(1-2) + q_(2-3) + q_(3-1) = {q12.float} {q23.float.texWithPM} {q31.float.texWithPM} = {qn},</BMPart>
						<BMPart>w_(netto) = w_(t,1-2) + w_(t,2-3) + w_(t,3-1) = {wt12.float} {wt23.float.texWithPM} {wt31.float.texWithPM} = {wn}.</BMPart>
					</BMList>
					Deze waarden zijn gelijk aan elkaar, dus hebben we geen rekenfout gemaakt.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken, gebaseerd op de energiestromen, de koudefactor en de warmtefactor. Bereken ook via de massastroom het koelvermogen.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} /></Substep>
					<Substep ss={1}><FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} /></Substep>
					<Substep ss={2}><FloatUnitInput id="Pc" prelabel={<M>P_(koel) =</M>} label="Koelvermogen" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { mdot, wn, q12, qin, epsilon, COP, Pc } = useSolution()
			const qout = q12.abs()
			return <>
				<Par>De processtappen waarop warmte toegevoerd wordt (<M>q \gt 0</M>) is alleen stap 3-1. De toegevoerde warmte is dus <M>q_(toe) = q_(3-1) = {qin}.</M> De netto arbeid is al bekend als <M>w_(netto) = {wn}.</M> Hiermee volgt de koudefactor als
					<BM>\varepsilon = \frac(\rm nuttig)(\rm invoer) = \frac(q_(toe))(w_(netto)) = \frac{qin.float}{wn.abs().float} = {epsilon}.</BM>
					Voor de warmtefactor moeten we kijken naar de stappen waarop warmte afgevoerd wordt. Dit is alleen stap 1-2. De afgevoerde warmte is dus <M>q_(af) = q_(1-2) = {qout}.</M> (We negeren hier het minteken omdat we al in woorden zeggen dat dit afgevoerde warmte is.) Dit zorgt voor een warmtefactor van
					<BM>\varepsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(q_(af))(w_(netto)) = \frac{qout.float}{wn.abs().float} = {COP}.</BM>
					Of we hadden kunnen gebruiken dat de warmtefactor altijd één hoger is dan de koudefactor. Dat was hier sneller geweest. Bovenstaande factoren zijn overigens niet bepaald hoog. Het is immers ook geen heel efficiënt kringproces.</Par>
				<Par>Voor het koelvermogen gebruiken we de vergelijking <BM>P_(koel) = \dot(m) q_(in) = {mdot.float} \cdot {qin.float} = {Pc}.</BM> Dit is het vermogen aan warmte dat onttrokken wordt aan de te koelen ruimte.</Par>
			</>
		},
	},
]