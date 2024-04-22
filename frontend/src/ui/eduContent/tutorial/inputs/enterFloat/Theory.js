import React from 'react'

import { Float } from 'step-wise/inputTypes'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M } from 'ui/components'

const num1 = new Float('2.3')
const num2 = new Float('2.3*10^4')

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>In the field of physics, people work a lot with <Term>decimal numbers</Term> like <M>{num1}</M>. When these numbers get larger or smaller, we use <Term>decimal exponents</Term> to keep the notation manageable. This gives numbers like <M>{num2}</M>. How can you enter these numbers into Step-Wise?</Par>
		</Translation>

		<Translation entry="inputFields">
			<Head>Custom input fields</Head>
			<Par>Step-Wise has specific input fields for decimal numbers. On the left side is the <Term>number</Term>. This part properly deals with:</Par>
			<List items={[
				<><Term>Minus signs:</Term> at most one, and always at the start.</>,
				<><Term>Decimal points:</Term> at most one. It doesn't matter if you use a dot or a comma, we'll adjust accordingly.</>,
				<><Term>Only numbers:</Term> we'll filter out everything else.</>,
			]} />
			On the right side of the field is the <Term>decimal exponent</Term>. It also has various useful features.
			<List items={[
				<><Term>Easy creation:</Term> as soon as you type a multiplication star "*", or alternatively the scientific notation "e", we'll create the decimal exponent for you. No need to type the "10" yourself.</>,
				<><Term>Automatic formatting:</Term> you can write in the power exactly as it's displayed formally. You'll always see what you'll get.</>,
				<><Term>Smart number management:</Term> at most one minus sign and no decimal points.</>,
			]} />
			<Par>As usual, the input field is <Term>smart-phone compatible</Term>, with a custom-designed keyboard specifically for writing decimal numbers.</Par>
			<Par>The best way to experience, is to try it out!</Par>
		</Translation>
	</>
}
