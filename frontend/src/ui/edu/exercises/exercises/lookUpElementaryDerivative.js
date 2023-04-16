import React from 'react'

import { Variable } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import ExpressionInput, { allMathSimpleVariables, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, f, func } = useSolution()
	return <>
		<Par>Gegeven is de functie <BM>{f}\left({x}\right) = {func}.</BM> Bepaal de afgeleide <M>{f}'\left({x}\right).</M></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="derivative" prelabel={<M>{f}'\left({x}\right)=</M>} label="Vul hier het resultaat in" size="l" settings={allMathSimpleVariables} validate={validWithVariables([x])} />
			</Par>
		</InputSpace>
	</>
}

const Solution = () => {
	const { f, x, func, derivative } = useSolution()

	// Check the various cases that we may have.
	if (func.isSubtype('Power') && func.exponent.isNumeric()) { // x^n
		const n = func.exponent.number
		return <>
			<Par>Merk op dat we de gegeven functie <M>{f}\left({x}\right) = {func}</M> kunnen schrijven als <M>{x}^n,</M> waarbij bij ons <M>n = {n}.</M> De afgeleide kunnen we hiermee opzoeken als <BM>{f}'\left({x}\right) = n{x}^(n-1) = {n}{x}^({n}-1).</BM> Of in woorden: we halen de macht <M>{n}</M> naar voren (als vermenigvuldiging) waarna we de macht zelf verlagen met één. Het bovenstaande kan eventueel nog gesimplificeerd worden tot <BM>{f}'\left({x}\right) = {derivative}.</BM></Par>
		</>
	}
	if (func.isSubtype('Fraction') && (func.denominator.equals(x) || (func.denominator.isSubtype('Power') && func.denominator.exponent.isNumeric()))) { // 1/x^n
		const n = func.denominator.equals(x) ? 1 : func.denominator.exponent.number
		return <>
			<Par>Merk op dat we de gegeven functie <M>{f}\left({x}\right) = {func} = {x}^(-{n})</M> kunnen schrijven als <M>{x}^n,</M> waarbij bij ons <M>n = -{n}.</M> De afgeleide kunnen we hiermee opzoeken als <BM>{f}'\left({x}\right) = n{x}^(n-1) = \left(-{n}\right){x}^(-{n}-1).</BM> Of in woorden: we halen de macht <M>-{n}</M> naar voren (als vermenigvuldiging) waarna we de macht zelf verlagen met één. Het bovenstaande kan eventueel nog gesimplificeerd worden tot <BM>{f}'\left({x}\right) = -{n}{x}^(-{n + 1}) = -\frac({n})({x}^({n + 1})).</BM></Par>
		</>
	}
	if (func.isSubtype('Sqrt')) { // sqrt(x)
		return <>
			<Par>We kunnen direct opzoeken dat de afgeleide van <M>{f}\left({x}\right) = {func}</M> gelijk is aan <BM>{f}'\left({x}\right) = \frac(1)(2\sqrt({x})).</BM> Hiermee is de opgave klaar.</Par>
			<Par>Een andere manier om het bovenstaande in te zien is door de wortel eerst als macht te schrijven, volgens <BM>{f}\left({x}\right) = {func} = {x}^(\frac(1)(2)).</BM> We kunnen nu de standaard regel voor de afgeleide van <M>{x}^n</M> toepassen, waarbij <M>n = \frac(1)(2).</M> We halen de macht naar voren (als vermenigvuldiging) waarna we de macht zelf verlagen met één. Oftewel, <BM>{f}'\left({x}\right) = \frac(1)(2) {x}^(\frac(1)(2)-1) = \frac(1)(2) {x}^(-\frac(1)(2)).</BM> Een negatieve macht betekent 'delen door het getal met positieve macht' waardoor we dit ook kunnen schrijven als<BM>{f}'\left({x}\right) = \frac(1)(2{x}^(\frac(1)(2))) = \frac(1)(2\sqrt({x})).</BM> En dit is hetzelfde als wat we eerder opgezocht hebben.</Par>
		</>
	}
	if (func.isSubtype('Root')) {
		const n = func.base.number
		return <>
			<Par>Merk op dat we de gegeven functie <M>{f}\left({x}\right) = {func}</M> kunnen schrijven als <M>\sqrt[n]({x}),</M> waarbij bij ons <M>n = {n}.</M> De afgeleide kunnen we hiermee opzoeken als <BM>{f}'\left({x}\right) = \frac(1)(n\sqrt[n]({x}^(n-1))) = \frac(1)({n}\sqrt[{n}]({x}^({n - 1}))).</BM> Hiermee is de opgave klaar.</Par>
			<Par>Een andere manier om het bovenstaande in te zien is door de wortel eerst als macht te schrijven, volgens <BM>{f}\left({x}\right) = {func} = {x}^(\frac(1)({n})).</BM> We kunnen nu de standaard regel voor de afgeleide van <M>{x}^n</M> toepassen, waarbij <M>n = \frac(1)({n}).</M> We halen de macht naar voren (als vermenigvuldiging) waarna we de macht zelf verlagen met één. Oftewel, <BM>{f}'\left({x}\right) = \frac(1)({n}) {x}^(\frac(1)({n})-1) = \frac(1)({n}) {x}^(-\frac({n - 1})({n})).</BM> Een negatieve macht betekent 'delen door het getal met positieve macht' waardoor we dit ook kunnen schrijven als<BM>{f}'\left({x}\right) = \frac(1)({n}{x}^(\frac({n - 1})({n}))) = \frac(1)({n}\sqrt[{n}]({x}^({n - 1}))).</BM> En dit is hetzelfde als wat we eerder opgezocht hebben.</Par>
		</>
	}
	if (func.isSubtype('Power') && !func.base.equals(Variable.e)) {
		const g = func.base.number
		return <>
			<Par>Merk op dat we de gegeven functie <M>{f}\left({x}\right) = {func}</M> kunnen schrijven als <M>g^{x},</M> waar wij een grondgetal hebben van <M>g = {g}.</M> De afgeleide kunnen we hiermee opzoeken als <BM>{f}'\left({x}\right) = \ln\left(g\right) g^{x} = {derivative}.</BM> Hiermee is de opgave klaar.</Par>
			<Par>Een andere manier om het bovenstaande in te zien is door de macht eerst om te schrijven naar een macht met grondgetal <M>e,</M> volgens <BM>{f}\left({x}\right) = {func} = \left(e^(\ln\,\left({g}\right))\right)^{x} = e^(\ln\,\left({g}\right){x}).</BM> Via de kettingregel (die pas later geleerd wordt, dus deze ken je waarschijnlijk nog niet) kunnen we de afgeleide hiervan vinden als <BM>{f}'\left({x}\right) = \ln\left({g}\right) e^(\ln\,\left({g}\right){x}) = \ln\left({g}\right) {g}^{x}.</BM> En dit is hetzelfde als wat we eerder opgezocht hebben.</Par>
		</>
	}
	if (func.isSubtype('Log')) {
		const g = func.base.number
		return <>
			<Par>Merk op dat we de gegeven functie <M>{f}\left({x}\right) = {func}</M> kunnen schrijven als <M>^g \! \log({x}),</M> waar wij een grondgetal hebben van <M>g = {g}.</M> De afgeleide kunnen we hiermee opzoeken als <BM>{f}'\left({x}\right) = \frac(1)(\ln\left(g\right) {x}) = {derivative}.</BM> Hiermee is de opgave klaar.</Par>
			<Par>Een andere manier om het bovenstaande in te zien is door het logaritme eerst om te schrijven naar het natuurlijke logaritme, volgens <BM>{f}\left({x}\right) = {func} = \frac(\ln\left({x}\right))(\ln\left({g}\right)) = \frac(1)(\ln\left({g}\right)) \cdot \ln\left({x}\right).</BM> We kunnen nu de standaard regel voor de afgeleide van <M>\ln\left({x}\right)</M> toepassen, samen met de constanteregel. (Deze regel leer je mogelijk binnenkort pas.) Zo vinden we <BM>{f}'\left({x}\right) = \frac(1)(\ln\left({g}\right)) \cdot \frac(1)({x}) = {derivative}.</BM> En dit is hetzelfde als wat we eerder opgezocht hebben.</Par>
		</>
	}
	if (func.isSubtype('Integer')) {
		return <Par>De afgeleide van een constante waarde is altijd nul. We hebben dus <BM>{f}'\left({x}\right) = {derivative}.</BM></Par>
	}

	// In all remaining cases a simple look-up suffices.
	return <Par>We kunnen direct opzoeken dat de afgeleide van <M>{f}\left({x}\right) = {func}</M> gelijk is aan <BM>{f}'\left({x}\right) = {derivative}.</BM></Par>
}

function getFeedback(exerciseData) {
	const { func } = exerciseData.solution

	// Determine which feedback check to run.
	let check
	if (func.isSubtype('Power') && func.exponent.isNumeric()) { // x^n
		const n = func.exponent.number
		check = (input, correct, { x, func, derivative }, isCorrect) => {
			if (isCorrect)
				return
			if (n === 1)
				return <>Je denkt te moeilijk: de afgeleide hangt helemaal niet van <M>{x}</M> af.</>
			if (!input.isSubtype('Product'))
				return <>Er werd een vermenigvuldiging verwacht. Heb je de macht wel naar voren gehaald als constante vermenigvuldiging?</>
			const constantMultiplication = input.terms.find(term => term.isSubtype('Integer'))
			if (!constantMultiplication)
				return <>Er werd een constante vermenigvuldiging verwacht. Heb je de macht wel naar voren gehaald als constante vermenigvuldiging?</>
			if (constantMultiplication.number !== n)
				return <>Je hebt niet met het juiste getal vermenigvuldigd. Je moet de macht naar voren halen als constante vermenigvuldiging.</>
			const otherTerm = input.terms.find(term => !term.isSubtype('Integer'))
			if (!otherTerm)
				return <>Je hebt ook nog een term in je vermenigvuldiging nodig met <M>{x}.</M> Deze ontbreekt nog.</>
			if (n === 2) {
				return <>Het deel met de <M>{x}</M> heb je niet goed genoteerd. Het kan makkelijker.</>
			} else {
				if (!otherTerm.isSubtype('Power'))
					return <>Binnen de vermenigvulding werd ook iets als een macht verwacht, zoals <M>{x}^(\rm iets).</M> Dit is nu niet aanwezig.</>
				if (!otherTerm.exponent.isSubtype('Integer'))
					return <>Als macht boven <M>{x}</M> werd een geheel getal verwacht. Dit is nu niet het geval.</>
				if (otherTerm.exponent.number !== n - 1)
					return <>Het getal in de macht klopt niet. Heb je de macht wel met één verlaagd?</>
			}
		}
	} else if (func.isSubtype('Fraction') && func.denominator.isSubtype('Power') && func.denominator.exponent.isNumeric()) { // 1/x^n
		check = (input, correct, { x }, isCorrect) => !isCorrect && <>Tip: schrijf de functie eerst als <M>{x}^(\rm iets)</M> waarbij de macht mogelijk negatief is.</>
	} else if (func.isSubtype('Root')) {
		check = (input, correct, { x }, isCorrect) => !isCorrect && <>Tip: schrijf de functie eerst als <M>{x}^(\rm iets)</M> waarbij de macht mogelijk een breuk is.</>
	} else if (func.isSubtype('Power') && !func.base.equals(Variable.e)) {
		const g = func.base.number
		check = (input, correct, { x }, isCorrect) => !isCorrect && <>Dit is niet het juiste antwoord. Heb je wel <M>g = {g}</M> als grondgetal gebruikt?</>
	} else if (func.isSubtype('Log')) {
		const g = func.base.number
		check = (input, correct, { x }, isCorrect) => !isCorrect && <>Dit is niet het juiste antwoord. Heb je wel <M>g = {g}</M> als grondgetal gebruikt?</>
	} else if (func.isSubtype('Integer')) {
		check = (input, correct, { f, x, func }, isCorrect) => {
			if (isCorrect)
				return
			if (!input.isSubtype('Integer'))
				return <>Je denkt te moeilijk: de afgeleide is simpelweg een enkel getal!</>
			return <>Je antwoord is niet het juiste getal. Tip: stel je de grafiek voor van <M>{f}\left({x}\right) = {func}.</M> Wat is de <em>steilheid</em> van deze grafiek?</>
		}
	} else {
		check = (input, correct, solution, isCorrect) => !isCorrect && <>Dit is niet het juiste antwoord. Je kunt deze afgeleide letterlijk opzoeken uit de tabel.</>
	}

	// Extract the feedback.
	const feedbackChecks = [check]
	return getInputFieldFeedback('derivative', exerciseData, { feedbackChecks })
}
