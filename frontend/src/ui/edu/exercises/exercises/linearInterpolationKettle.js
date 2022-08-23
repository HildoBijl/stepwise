import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/FormPart'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ type, T1, T2, t1, t2, T, t }) => type === 1 ? <>
	<Par>We gebruiken een waterkoker om wat water te koken. Hiervoor vullen we de waterkoker met water en zetten hem aan. Na <M>{t1}</M> zien we op de display dat de temperatuur <M>{T1}</M> is. Na <M>{t2}</M> zien we op de display dat de temperatuur <M>{T2}</M> is. Na hoeveel seconden was de temperatuur <M>{T}?</M> Ga ervan uit dat de temperatuur lineair toeneemt met de tijd.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="t" prelabel={<M>t =</M>} label={<span>Gepasseerde tijd bij <M>{T}</M></span>} size="s" />
		</Par>
	</InputSpace>
</> : <>
	<Par>We gebruiken een waterkoker om wat water te koken. Hiervoor vullen we de waterkoker met water en zetten hem aan. Na <M>{t1}</M> zien we op de display dat de temperatuur <M>{T1}</M> is. Na <M>{t2}</M> zien we op de display dat de temperatuur <M>{T2}</M> is. Wat was de temperatuur na <M>{t}?</M> Ga ervan uit dat de temperatuur lineair toeneemt met de tijd.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="T" prelabel={<M>T =</M>} label={<span>Temperatuur na <M>{t}</M></span>} size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: ({ type, T1, T2, t1, t2, T, t }) => type === 1 ? <>
			<Par>Bereken op welk deel <M>x</M> de temperatuur <M>{T}</M> ligt, ten opzichte van de stijging van <M>{T1}</M> naar <M>{T2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatInput id="x" prelabel={<M>x=</M>} label="Deel van de stijging" size="s" />
				</Par>
			</InputSpace>
		</> : <>
			<Par>Bereken op welk deel <M>x</M> de tijd <M>{t}</M> ligt, ten opzichte van de periode van <M>{t1}</M> tot <M>{t2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatInput id="x" prelabel={<M>x=</M>} label="Deel van de periode" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { type, T1, T2, t1, t2, x, T, t } = useSolution()
			return type === 1 ? <>
				<Par>
					De temperatuursstijging ten opzichte van de eerste meting is
					<BM>T - T_1 = {T.float} - {T1.float} = {T.subtract(T1)}.</BM>
					De totale temperatuursstijging tussen de metingen is
					<BM>T_2 - T_1 = {T2.float} - {T1.float} = {T2.subtract(T1)}.</BM>
					Het deel van de eerste, ten opzichte van de tweede, is
					<BM>x = \frac(T - T_1)(T_2 - T_1) = \frac({T.float} - {T1.float})({T2.float} - {T1.float}) = \frac{T.subtract(T1).float}{T2.subtract(T1).float} = {x.float}.</BM>
					Dit is dus het deel van de temperatuursstijging.
					</Par>
			</> : <>
				<Par>De gepasseerde tijd sinds de eerste meting is
					<BM>t - t_1 = {t.float} - {t1.float} = {t.subtract(t1)}.</BM>
					De totale tijd tussen de metingen is
					<BM>t_2 - t_1 = {t2.float} - {t1.float} = {t2.subtract(t1)}.</BM>
					Het deel van de eerste, ten opzichte van de tweede, is
					<BM>x = \frac(t - t_1)(t_2 - t_1) = \frac({t.float} - {t1.float})({t2.float} - {t1.float}) = \frac{t.subtract(t1).float}{t2.subtract(t1).float} = {x.float}.</BM>
					Dit is dus het deel van de gepasseerde tijd tussen de metingen.
				</Par>
			</>
		},
	},
	{
		Problem: ({ type, T1, T2, t1, t2, T, t }) => type === 1 ? <>
			<Par>Uitgaande van dat dit deel van de tijd gepasseerd is, bepaal dan het aantal seconden dat gepasseerd is sinds de waterkoker is aangezet. Merk op dat de eerste meting na <M>{t1}</M> was en de tweede na <M>{t2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="t" prelabel={<M>t =</M>} label={<span>Gepasseerde tijd bij <M>{T}</M></span>} size="s" />
				</Par>
			</InputSpace>
		</> : <>
			<Par>Uitgaande van dat dit deel van de tijd gepasseerd is, bepaal dan de temperatuur op dit moment. Merk op dat de temperatuur is gestegen van <M>{T1}</M> tot <M>{T2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T" prelabel={<M>T =</M>} label={<span>Temperatuur na <M>{t}</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { type, T1, T2, t1, t2, x, T, t } = useSolution()
			return type === 1 ?
				<Par>
					We zijn op <M>{x.float}</M> deel van de tijdsperiode. De gehele tijdsperiode is
					<BM>t_2 - t_1 = {t2.float} - {t1.float} = {t2.subtract(t1)}.</BM>
					Een deel <M>{x.float}</M> hiervan is
					<BM>x \left(t_2 - t_1\right) = {x.float} \cdot \left({t2.float} - {t1.float}\right) = {t2.subtract(t1).multiply(x)}.</BM>
					Dit is sinds de eerste meting. De tijd sinds dat de waterkoker aan is, is dan
					<BM>t = t_1 + x \left(t_2 - t_1\right) = {t1.float} + {x.float} \cdot \left({t2.float} - {t1.float}\right) = {t}.</BM>
					Als controle kunnen we kijken of dit tussen de <M>{t1}</M> en de <M>{t2}</M> in ligt: dat doet het inderdaad.
				</Par> :
				<Par>
					We zijn op <M>{x.float}</M> deel van de tijdsperiode. De gehele temperatuurtoename in deze periode is
				<BM>T_2 - T_1 = {T2.float} - {T1.float} = {T2.subtract(T1)}.</BM>
				We hebben slechts een deel <M>{x.float}</M> hiervan, wat overeenkomt met een toename van
				<BM>x \left(T_2 - T_1\right) = {x.float} \cdot \left({T2.float} - {T1.float}\right) = {T2.subtract(T1).multiply(x)}.</BM>
				Dit is de temperatuurstoename. De werkelijk aanwezige temperatuur is dan
				<BM>T = T_1 + x \left(T_2 - T_1\right) = {T1.float} + {x.float} \cdot \left({T2.float} - {T1.float}\right) = {T}.</BM>
				Als controle kunnen we kijken of dit tussen de <M>{T1}</M> en de <M>{T2}</M> in ligt: dat doet het inderdaad.
			</Par>
		},
	},
]