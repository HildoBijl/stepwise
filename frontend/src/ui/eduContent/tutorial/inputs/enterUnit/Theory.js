import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { Translation } from 'i18n'
import { Head, Par, List, Term, Info, M } from 'ui/components'

const mps = new Unit('m/s')
const kmps = new Unit('km/s')
const dC = new Unit('°C')
const C = new Unit('C')
const Nm = new Unit('N*m')
const m3 = new Unit('m^3')
const mum = new Unit('mum')
const Omega = new Unit('Ω')

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>When calculating things in physics, it's crucial to use the right <Term>units</Term>. There is a large difference between, for instance, <M>{mps}</M> and <M>{kmps}</M>. However, sometimes units get complicated, with powers, fractions, Greek letters, and even <M>{dC}</M>. How do you enter all that?</Par>
		</Translation>

		<Translation entry="basicFunctionalities">
			<Head>Basic functionalities</Head>
			<Par>To enter basic units, keep the following matters in mind.</Par>
			<List items={[
				<><Term>Unit products:</Term> to separate units in a product, like <M>{Nm}</M>, use the multiplication star "*", the dot (period) "." or the space bar.</>,
				<><Term>Unit fractions:</Term> to add a fraction, like for <M>{mps}</M>, use the dividing slash "/" or the downward arrow.</>,
				<><Term>Unit powers:</Term> for powers like <M>{m3}</M> you could optionally use the power hat "^" but this isn't even needed. If you type a number inside a unit field, it'll automatically understand it's for a power.</>,
			]} />
			<Par>This already allows you to type most units.</Par>
			<Info>Units are case-sensitive! If the input field doesn't understand a unit, it's colored red. In that case, you may want to check your capitalization.</Info>
		</Translation>

		<Translation entry="autoReplace">
			<Head>Auto-replace</Head>
			<Par>Most units are basic letters, but there are exceptions. Think of <M>{mum}</M>, <M>{Omega}</M> or <M>{dC}</M>. To type these, you can use the <Term>auto-replace</Term> functionality.</Par>
			<List items={[
				<><Term>Greek letters:</Term> if you want to write <M>\mu</M> (lower case mu, for the micro prefix) or <M>{Omega}</M> (upper case Omega, for the Ohm unit) then simply type out the full name "mu" or "Omega"/"Ohm" (either works) and the input field will automatically turn it into the Greek letter.</>,
				<><Term>Degrees:</Term> for degrees Celsius you need to write <M>{dC}</M>. (Note: a <M>{C}</M> does not suffice, since this is a different unit, the Coulomb.) The shortcut for this is "dC" or "degC" (case-sensitive).</>
			]} />
			<Par>If the above doesn't work, you can also always use the internal unit input keyboard, which also contains all units you may need.</Par>
		</Translation>
	</>
}
