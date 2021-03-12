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

const Problem = ({ p1, T1, p2, q23, etai, mdot }) => {
	return <>
		<Par>In een gasturbine doorloopt lucht een kringproces van Brayton. Aan het begin is de druk <M>{p1}</M> en de temperatuur <M>{T1}.</M> Een compressor comprimeert de lucht naar <M>{p2}.</M> Hierna wordt de lucht isobaar verwarmd, waarbij er <M>{q23}</M> aan warmte wordt toegevoerd. Na een turbine, waarin arbeid door de lucht geleverd wordt, wordt de lucht weer isobaar gekoeld tot het beginpunt. (In de praktijk wordt de lucht uitgestoten en wordt nieuwe lucht aangezogen.)</Par>
		<Par>Voor deze gasturbine geldt verder dat de compressor en de turbine <em>niet</em> isentroop werken: ze hebben elk een isentropisch rendement van <M>{etai}.</M> Bereken het thermodynamisch rendement van de gasturbine. Bereken ook het geleverde (netto) asvermogen, gegeven dat de massastroom lucht <M>{mdot}</M> is.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={validNumberAndUnit} />
				<FloatUnitInput id="P" prelabel={<M>P =</M>} label="Asvermogen" size="s" />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => <>
			<Par>Neem eerst aan dat de compressor <em>wel</em> isentroop werkt. Vind de temperatuur aan de uitgang van deze fictieve compressor.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="T2p" prelabel={<M>T_(2') =</M>} label="Temperatuur na isentrope compressie" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { k, p1, T1, p2, T2p } = useCorrect()
			return <>
				<Par>In punt 1 is al bekend dat <M>p_1 = {p1}</M> en <M>T_1 = {T1}.</M> We bereiken het fictieve punt <M>2'</M> via isentrope compressie. Met <M>p_(2') = p_2 = {p2}</M> vinden we via Poisson's wet
				<BM>T_(2') = T_1 \left(\frac(p_(2'))(p_1)\right)^(\frac(n-1)(n)) = {T1.float} \cdot \left(\frac{p2.float}{p1.float}\right)^(\frac({k}-1)({k})) = {T2p}.</BM></Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via het isentropisch rendement de werkelijke temperatuur na de compressor.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T2" prelabel={<M>T_2 =</M>} label="Temperatuur na compressor" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T2p, etai } = useCorrect()
			return <Par>Bij de compressor heb je vanwege frictie in werkelijkheid meer arbeid nodig dan in de perfecte (isentrope) situatie. Dit isentropisch rendement is dus
				<BM>\eta_(i_c) = \frac(w_(t_i))(w_t) = \frac(c_p \left(T_(2') - T_1\right))(c_p \left(T_2 - T_1\right)) = \frac(T_(2') - T_1)(T_2 - T_1).</BM>
				De oplossing voor <M>T_2</M> volgt als
				<BM>T_2 = T_1 + \frac(T_(2') - T_1)(\eta_(i_c)) = {T1.float} + \frac({T2p.float} - {T1.float})({etai.float}) = {T2}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via de toegevoerde warmte de temperatuur na de verbrandingskamer.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T3" prelabel={<M>T_3 =</M>} label="Temperatuur na verwarming" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T2, q23, T3 } = useCorrect()
			return <Par>In de verbrandingskamer wordt de lucht isobaar verwarmd. De toegevoerde warmte is dus <BM>q_(2-3) = c_p \left(T_3 - T_2\right).</BM> Dit oplossen voor <M>T_3</M> geeft <BM>T_3 = T_2 + \frac(q_(2-3))(c_p) = {T2.float} + \frac{q23.float}{cp.float} = {T3}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Neem aan dat de turbine <em>wel</em> isentroop werkt. Vind de temperatuur aan de uitgang van deze fictieve turbine.</Par>
			<InputSpace>
				<Par><FloatUnitInput id="T4p" prelabel={<M>T_(4') =</M>} label="Temperatuur na isentrope expansie" size="s" /></Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { k, p3, T3, p4, T4p } = useCorrect()
			return <Par>Omdat stap 2-3 isobaar is geldt <M>p_3 = p_2 = {p3}.</M> Net zo geldt voor stap 4-1 dat <M>p_(4') = p_4 = p_1 = {p4}.</M> We kunnen <M>T_(4')</M> nu vinden via Poisson's wet. Het resultaat is
				<BM>T_(4') = T_3 \left(\frac(p_(4'))(p_3)\right)^(\frac(n-1)(n)) = {T3.float} \cdot \left(\frac{p4.float}{p3.float}\right)^(\frac({k}-1)({k})) = {T4p}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken via het isentropisch rendement de werkelijke temperatuur na de turbine.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T4" prelabel={<M>T_4 =</M>} label="Temperatuur na turbine" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T3, T4, T4p, etai } = useCorrect()
			return <Par>Bij de turbine is de formule voor het isentropisch rendement andersom ten opzichte van de compressor: je hebt nu vanwege frictie in werkelijkheid juist minder geleverde arbeid dan in de perfecte (isentrope) situatie. Hier is het isentropisch rendement dus
				<BM>\eta_(i_t) = \frac(w_t)(w_(t_i)) = \frac(c_p \left(T_4 - T_3\right))(c_p \left(T_(4') - T_3\right)) = \frac(T_4 - T_3)(T_(4') - T_3).</BM>
				De oplossing voor <M>T_4</M> is
				<BM>T_4 = T_3 - \eta_(i_t) \left(T_3 - T_(4')\right) = {T3.float} - {etai.float} \cdot \left({T3.float} - {T4p.float}\right) = {T4}.</BM>
				Hiermee zijn alle werkelijke temperaturen in de cyclus bekend.</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken de netto specifieke arbeid die is toegevoerd bij dit kringproces.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="wn" prelabel={<M>w_(netto) =</M>} label="Netto specifieke arbeid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { cp, T1, T2, T3, T4, wt12, wt23, wt34, wt41, wn } = useCorrect()
			return <Par>
				De verwarming en afkoeling zijn isobare processen, waardoor daar geen technische arbeid is. Dus <M>w_(t,2-3) = w_(t,4-1) = {wt23}.</M> Bij de compressor is de specifieke technische arbeid, vanuit de eerste hoofdwet,
				<BM>w_(t,1-2) = -\Delta h = -c_p \left(T_2 - T_1\right) = -{cp.float} \cdot \left({T2.float} - {T1.float}\right) = {wt12}.</BM>
				Net zo is bij de turbine de specifieke technische arbeid
				<BM>w_(t,3-4) = -\Delta h = -c_p \left(T_4 - T_3\right) = -{cp.float} \cdot \left({T4.float} - {T3.float}\right) = {wt34}.</BM>
				De totale (netto) specifieke technische arbeid is dus
					<BM>w_(netto) = w_(t,1-2) + w_(t,2-3) + w_(t,3-4) + w_(t,4-1) = {wt12.float} {wt23.float.texWithPM} {wt34.float.texWithPM} {wt41.float.texWithPM} = {wn}.</BM>
			</Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bereken, gebaseerd op de energiestromen, het rendement van de gasturbine. Bereken ook via het gegeven asvermogen de gebruikte massastroom.</Par>
			<InputSpace>
				<Par>
					<Substep ss={1}><FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={validNumberAndUnit} /></Substep>
					<Substep ss={2}><FloatUnitInput id="P" prelabel={<M>P =</M>} label="Asvermogen" size="s" /></Substep>
				</Par>
			</InputSpace>
		</>,
		Solution: (state) => {
			const { P, wn, qin, eta, mdot } = useCorrect()
			return <Par>Er wordt alleen bij stap 2-3 warmte toegevoerd. De toegevoerde warmte is dus al gegeven als <M>q_(toe) = q_(2-3) = {qin}.</M> Hiermee volgt het rendement als
				<BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(w_(netto))(q_(toe)) = \frac{wn.float}{qin.float} = {eta}.</BM>
				Dit komt neer op <M>{eta.setUnit('%')}</M> wat redelijk normaal is voor een gasturbine. We vinden het asvermogen via
				<BM>P = \dot(m) w_(netto) = {mdot.float} \cdot {wn.float} = {P}.</BM>
				Een vermogen van <M>{P.setUnit('MW')}</M> geeft aan dat het een best grote installatie is.</Par>
		},
	},
]