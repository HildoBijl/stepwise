import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ type, h1, h2, W1, W2, h, W }) => type === 1 ? <>
	<Par>We bekijken een opgroeiend kind. Op een bepaald moment meten we het kind op: het gewicht is <M>{W1}</M> en de hoogte is <M>{h1}</M> groot. Enkele jaren later meten we opnieuw en vinden we <M>{W2}</M> en <M>{h2}</M>. Hoeveel woog het kind toen het <M>{h}</M> groot was? Ga uit van een lineair verband tussen hoogte en gewicht.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span>Gewicht bij <M>{h}</M></span>} size="s" />
		</Par>
	</InputSpace>
</> : <>
	<Par>We bekijken de manier waarop een kind groeit. Op een bepaald moment meten we het kind op: het gewicht is <M>{W1}</M> en de hoogte is <M>{h1}</M> groot. Enkele jaren later meten we opnieuw en vinden we <M>{W2}</M> en <M>{h2}</M>. Hoe groot was het kind toen het <M>{W}</M> woog? Ga uit van een lineair verband tussen hoogte en gewicht.</Par>
	<InputSpace>
		<Par>
			<FloatUnitInput id="h" prelabel={<M>h =</M>} label={<span>Hoogte bij <M>{W}</M></span>} size="s" />
		</Par>
	</InputSpace>
</>

const steps = [
	{
		Problem: ({ type, h1, h2, W1, W2, h, W }) => type === 1 ? <>
			<Par>Bereken op welk deel <M>x</M> de hoogte <M>{h}</M> ligt, ten opzichte van de stijging van <M>{h1}</M> naar <M>{h2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatInput id="x" prelabel={<M>x=</M>} label="Deel van de hoogtestijging" size="s" />
				</Par>
			</InputSpace>
		</> : <>
			<Par>Bereken op welk deel <M>x</M> het gewicht <M>{W}</M> ligt, ten opzichte van de toename van <M>{W1}</M> tot <M>{W2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatInput id="x" prelabel={<M>x=</M>} label="Deel van de gewichtstoename" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { type, h1, h2, W1, W2, x, h, W } = useSolution()
			return type === 1 ? <>
				<Par>
					De hoogtestijging sinds de eerste meting is
					<BM>h - h_1 = {h.float} - {h1.float} = {h.subtract(h1)}.</BM>
					De totale hoogtestijging tussen de metingen is
					<BM>h_2 - h_1 = {h2.float} - {h1.float} = {h2.subtract(h1)}.</BM>
					Het deel van de eerste, ten opzichte van de tweede, is
					<BM>x = \frac(h - h_1)(h_2 - h_1) = \frac({h.float} - {h1.float})({h2.float} - {h1.float}) = \frac{h.subtract(h1).float}{h2.subtract(h1).float} = {x}.</BM>
					Dit is dus het deel van de hoogtestijging.
					</Par>
			</> : <>
				<Par>De gewichtstoename sinds de eerste meting is
					<BM>W - W_1 = {W.float} - {W1.float} = {W.subtract(W1)}.</BM>
					De totale gewichtstoename tussen de metingen is
					<BM>W_2 - W_1 = {W2.float} - {W1.float} = {W2.subtract(W1)}.</BM>
					Het deel van de eerste, ten opzichte van de tweede, is
					<BM>x = \frac(W - W_1)(W_2 - W_1) = \frac({W.float} - {W1.float})({W2.float} - {W1.float}) = \frac{W.subtract(W1).float}{W2.subtract(W1).float} = {x}.</BM>
					Dit is dus het deel van de gewichtstoename.
				</Par>
			</>
		},
	},
	{
		Problem: ({ type, h1, h2, W1, W2, h, W }) => type === 1 ? <>
			<Par>Uitgaande van dat ook dit deel van de gewichtstoename plaats heeft gevonden, bepaal het gewicht. Merk op dat het gewicht bij de eerste meting <M>{W1}</M> was en bij de tweede <M>{W2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="W" prelabel={<M>W =</M>} label={<span>Gewicht bij <M>{h}</M></span>} size="s" />
				</Par>
			</InputSpace>
		</> : <>
			<Par>Uitgaande van dat ook dit deel van de hoogtestijging plaats heeft gevonden, bepaal de hoogte. Merk op dat de hoogte bij de eerste meting <M>{h1}</M> was en bij de tweede <M>{h2}.</M></Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="h" prelabel={<M>h =</M>} label={<span>Hoogte bij <M>{W}</M></span>} size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { type, h1, h2, W1, W2, x, h, W } = useSolution()
			return type === 1 ?
				<Par>
					We hebben <M>{x}</M> deel van de gewichtstoename. De gehele gewichtstoename tussen de twee metingen is
					<BM>W_2 - W_1 = {W2.float} - {W1.float} = {W2.subtract(W1)}.</BM>
					Een deel <M>{x}</M> hiervan is
					<BM>x \left(W_2 - W_1\right) = {x} \cdot \left({W2.float} - {W1.float}\right) = {W2.subtract(W1).multiply(x)}.</BM>
					Dit is de toename sinds de eerste meting. Het gewicht zelf is dus
					<BM>W = W_1 + x \left(W_2 - W_1\right) = {W1.float} + {x} \cdot \left({W2.float} - {W1.float}\right) = {W}.</BM>
					Als controle kunnen we kijken of dit tussen de <M>{W1}</M> en de <M>{W2}</M> in ligt: dat doet het inderdaad.
				</Par> :
				<Par>
					We hebben <M>{x}</M> deel van de hoogtestijging. De gehele hoogtestijging tussen de twee metingen is
				<BM>h_2 - h_1 = {h2.float} - {h1.float} = {h2.subtract(h1)}.</BM>
				We hebben slechts een deel <M>{x}</M> hiervan, wat overeenkomt met een toename van
				<BM>x \left(h_2 - h_1\right) = {x} \cdot \left({h2.float} - {h1.float}\right) = {h2.subtract(h1).multiply(x)}.</BM>
				Dit is de stijging sinds de eerste meting. De hoogte zelf is dus
				<BM>h = h_1 + x \left(h_2 - h_1\right) = {h1.float} + {x} \cdot \left({h2.float} - {h1.float}\right) = {h}.</BM>
				Als controle kunnen we kijken of dit tussen de <M>{h1}</M> en de <M>{h2}</M> in ligt: dat doet het inderdaad.
			</Par>
		},
	},
]