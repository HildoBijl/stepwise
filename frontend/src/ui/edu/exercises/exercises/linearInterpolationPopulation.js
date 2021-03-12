import React from 'react'

import { roundTo } from 'step-wise/util/numbers'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import IntegerInput from 'ui/form/inputs/IntegerInput'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useCorrect } from '../ExerciseContainer'
import { getInputFieldFeedback } from '../util/feedback'

// ToDo: remove below tests.

// import { interpolate, gridInterpolate } from 'step-wise/util/interpolation'
// import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

// console.log(interpolate(1965, [10, 13], [1950, 1970]))
// console.log(interpolate([7, 4], [[0, 20], [100, 200]], [0, 10], [0, 5]))
// console.log(interpolate(3, [0, 5], [0, 1]))
// console.log(interpolate([3], [0, 5], [0, 1]))
// console.log(gridInterpolate(1963, [10, 11.5, 13, 15], [1950, 1960, 1970, 1980]))
// console.log(gridInterpolate([1963, 19], [[10, 11, 12, 13], [9, 12, 14, 17], [6, 7, 9, 10]], [1950, 1960, 1970, 1980], [18, 20, 22]))

// const boilingPressure = {
// 	labels: ['Temperature'],
// 	headers: [[0, 10, 20, 30, 40, 50].map(x => new FloatUnit({ float: x, unit: 'dC' }).makeExact())],
// 	grid: ['0.0061', '0.0123', '0.0234', '0.0424', '0.0737', '0.1233'].map(x => new FloatUnit({ float: x, unit: 'bar' })),
// }
// console.log(gridInterpolate(new FloatUnit('22 dC'), boilingPressure.grid, ...boilingPressure.headers).str)

// const enthalpy = {
// 	labels: ['Temperature', 'Pressure'],
// 	headers: [
// 		[20, 22, 24, 26].map(x => new FloatUnit({ float: x, unit: 'bar' }).makeExact()),
// 		[220, 240, 260].map(x => new FloatUnit({ float: x, unit: 'dC' }).makeExact()),
// 	],
// 	grid: [
// 		['2824.6', '2811.7', undefined, undefined],
// 		['2880.0', '2870.6', '2860.6', '2850.1'],
// 		['2930.0', '2922.4', '2914.5', '2906.4'],
// 	].map(arr => arr.map(x => x === undefined ? undefined : new FloatUnit({ float: x, unit: 'kJ/kg' }))),
// }
// const res = gridInterpolate([new FloatUnit('22.1 bar'), new FloatUnit('239 dC')], enthalpy.grid, ...enthalpy.headers)
// console.log(res && res.str)

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ type, year1, year2, pop1, pop2, year, pop }) => type === 1 ? <>
	<Par>In het kleine fictieve dorpje Arcadia woonden in het jaar <M>{year1}</M> in totaal <M>{pop1}</M> mensen. In <M>{year2}</M> waren dit <M>{pop2}</M> mensen. Hoeveel mensen woonden er (afgerond) in <M>{year}</M>? Ga ervan uit dat alle metingen op 1 januari van het betreffende jaar uitgevoerd zijn en dat de populatie lineair toeneemt met de tijd.</Par>
	<InputSpace>
		<Par>
			<IntegerInput id="pop" prelabel={<M>(\rm Aantal) =</M>} label="Aantal mensen" size="s" />
		</Par>
	</InputSpace>
</> : <>
		<Par>In het fictieve dorpje Arcadia woonden op 1 januari <M>{year1}</M> in totaal <M>{pop1}</M> mensen. Op 1 januari <M>{year2}</M> waren dit <M>{pop2}</M> mensen. In welk jaar woonden er <M>{pop}</M> mensen? Ga ervan uit dat de populatie lineair toeneemt met de tijd.</Par>
		<InputSpace>
			<Par>
				<IntegerInput id="year" prelabel={<M>(\rm Jaar) =</M>} label={`Jaar met ${pop} mensen`} size="s" />
			</Par>
		</InputSpace>
	</>

const steps = [
	{
		Problem: ({ type, year1, year2, pop1, pop2, year, pop }) => type === 1 ? <>
			<Par>Bereken op welk deel <M>x</M> het jaar <M>{year}</M> ligt, ten opzichte van de periode <M>{year1}</M> tot <M>{year2}</M>.</Par>
			<InputSpace>
				<Par>
					<FloatInput id="x" prelabel={<M>x=</M>} label="Deel van de periode" size="s" />
				</Par>
			</InputSpace>
		</> : <>
				<Par>Bereken op welk deel <M>x</M> het bevolkingsaantal <M>{pop}</M> ligt, ten opzichte van de groei van <M>{pop1}</M> tot <M>{pop2}</M> mensen.</Par>
				<InputSpace>
					<Par>
						<FloatInput id="x" prelabel={<M>x=</M>} label="Deel van de groei" size="s" />
					</Par>
				</InputSpace>
			</>,
		Solution: () => {
			const { type, year1, year2, pop1, pop2, x, year, pop } = useCorrect()
			return type === 1 ? <>
				<Par>Stel, we zijn nu in het jaar <M>{year}.</M> Het aantal gepasseerde jaren sinds de eerste meting is <BM>t - t_1 = {year} - {year1} = {year - year1}.</BM> Het totaal aantal jaren tussen de metingen is <BM>t_2 - t_1 = {year2} - {year1} = {year2 - year1}.</BM> Als deel is dit <BM>x = \frac(t - t_1)(t_2 - t_1) = \frac({year} - {year1})({year2} - {year1}) = \frac({year - year1})({year2 - year1}) = {roundTo(x, 2)}.</BM> Dit is dus het deel van de gepasseerde tijd.</Par>
			</> : <>
					<Par>Stel, we zijn nu in het moment dat er <M>{pop}</M> inwoners zijn. De bevolkingsgroei sinds de eerste meting is <BM>n - n_1 = {pop} - {pop1} = {pop - pop1}.</BM> De totale bevolkingsgroei tussen de metingen is <BM>n_2 - n_1 = {pop2} - {pop1} = {pop2 - pop1}.</BM> Als deel is dit <BM>x = \frac(n - n_1)(n_2 - n_1) = \frac({pop} - {pop1})({pop2} - {pop1}) = \frac({pop - pop1})({pop2 - pop1}) = {roundTo(x, 2)}.</BM> Dit is dus het deel van de totaal behaalde bevolkingsgroei die we nu hebben.</Par>
				</>
		},
	},
	{
		Problem: ({ type, year1, year2, pop1, pop2, pop }) => type === 1 ? <>
			<Par>Uitgaande dat dit deel van de tijd gepasseerd is, wat is de bevolking (afgerond) op dit moment? Merk op dat de bevolking groeit van <M>{pop1}</M> tot <M>{pop2}.</M></Par>
			<InputSpace>
				<Par>
					<IntegerInput id="pop" prelabel={<M>(\rm Aantal) =</M>} label="Aantal mensen" size="s" />
				</Par>
			</InputSpace>
		</> : <>
				<Par>Uitgaande dat dit deel van de tijd gepasseerd is, wat is het jaartal op dit moment? Merk op dat de tijdsperiode van <M>{year1}</M> tot <M>{year2}</M> is.</Par>
				<InputSpace>
					<Par>
						<IntegerInput id="year" prelabel={<M>(\rm Jaar) =</M>} label={`Jaar met ${pop} mensen`} size="s" />
					</Par>
				</InputSpace>
			</>,
		Solution: () => {
			const { type, year1, year2, pop1, pop2, x, year, pop, yearFloored, popRounded } = useCorrect()
			return type === 1 ?
				<Par>We beginnen al op <M>n_1 = {pop1} (\rm\ mensen)</M>. Tijdens de gehele periode is de toename <BM>n_2 - n_1 = {pop2} - {pop1} = {pop2 - pop1} (\rm\ mensen).</BM> We hebben slechts een deel <M>x = {roundTo(x, 2)}</M> van deze toename. Dit is een toename van <BM>x \left(n_2 - n_1\right) = {roundTo(x, 2)} \cdot \left({pop2} - {pop1}\right) = {roundTo(x * (pop2 - pop1), 0)} (\rm\ mensen).</BM> De totale hoeveelheid mensen is hiermee <BM>n = n_1 + x\left(n_2 - n_1\right) = {pop1} + {roundTo(x, 2)} \cdot \left({pop2} - {pop1}\right) = {roundTo(pop, 1)} (\rm\ mensen).</BM> Merk op dat het aantal mensen een geheel getal moet zijn, waardoor we dit afronden naar <M>{popRounded} (\rm\ mensen).</M> Als controle kunnen we checken of dit getal wel tussen <M>{pop1}</M> en <M>{pop2}</M> valt. Dat is inderdaad het geval.</Par> :
				<Par>Het beginjaar is <M>t_1 = {year1} (\rm\ jaar)</M>. De gehele periode duurt <BM>t_2 - t_1 = {year2} - {year1} = {year2 - year1} (\rm\ jaar).</BM> Er is slechts een deel <M>x = {roundTo(x, 2)}</M> van deze periode gepasseerd. Dit komt neer op <BM>x \left(t_2 - t_1\right) = {roundTo(x, 2)} \cdot \left({year2} - {year1}\right) = {roundTo(x*(year2 - year1), 1)} (\rm\ jaar).</BM> Het exacte jaartal is hiermee <BM>t = t_1 + x\left(t_2 - t_1\right) = {year1} + {roundTo(x, 2)} \cdot \left({year2} - {year1}\right) = {roundTo(year, 1)}.</BM> Merk op dat alle metingen gedaan zijn op 1 januari (het begin van het jaar) waardoor we het deel achter de komma mogen negeren. Het jaartal is dus simpelweg <M>{yearFloored}.</M> Als controle kunnen we nog checken of dit jaartal inderdaad tussen <M>{year1}</M> en <M>{year2}</M> valt. Dat is inderdaad het geval.</Par>
		},
	},
]

const getFeedback = (exerciseData) => {
	return getInputFieldFeedback(['x', 'pop', 'year'], exerciseData)
}