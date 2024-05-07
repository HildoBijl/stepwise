import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M } from 'ui/components'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>In mathematics, you may encounter a large variety of <Term>expressions</Term>. Think of for instance solutions of equations: they can have additions, multiplications, fractions and all sorts of mathematical functions. How do we enter those?</Par>
		</Translation>

		<Translation entry="basics">
			<Head>Entering basic expressions</Head>
			<Par>Mathematical input fields in Step-Wise are of the type <Term>what you see is what you get</Term>. You always see what you entered and can directly, in a user-friendly way, adjust it. Just use plus and minus signs, multiplications (type a star "*" for those) and brackets.</Par>
			<Par>There are a few things that inherently are slightly more complicated to enter.</Par>
			<List items={[
				<><Term>Fractions:</Term> <M>\frac(2+3)(5)</M>. Create them with a slash "/". Browse through them using arrow keys (also up/down). Pull terms in by going to the start/end and pressing backspace/delete, respectively. Split them up with the spacebar.</>,
				<><Term>Powers (superscripts):</Term> <M>x^2</M>. Start them with the hat "^" symbol. You'll see the cursor becoming smaller, so you can directly type anything you like into the superscript.</>,
				<><Term>Subscripts (for variables):</Term> <M>x_1</M>. Start them with the underscore "_". It works just like superscripts, but obviously doesn't allow further mathematical expressions.</>,
			]} />
			<Par>All of this is easily possible using either a regular computer keyboard (fast and efficient) or our own internally designed mathematical keyboard (accessible for smartphones). The only downside: selecting and copy-pasting expression parts is not yet possible. This is on our list of future ideas.</Par>
		</Translation>

		<Translation entry="function">
			<Head>Entering a variety of functions</Head>
			<Par>There are many <Term>mathematical functions</Term> that can be part of expressions. All functions work similarly, but a few important exaples are the following.</Par>
			<List items={[
				<><Term>Trigonometric functions:</Term> <M>\sin\left(x\right)</M>. Type them with your regular keyboard as "sin()", "cos()", etcetera. Use their inverses through "asin()", "acos()", and so forth. Input fields will know from the context, where relevant, whether the functions use degrees or radians.</>,
				<><Term>Roots:</Term> <M>\sqrt[3](x)</M>. Type "root()" on your keyboard, and the input field will automatically turn it into a root like <M>\sqrt(\ldots)</M>. A root is by default a base-2 root, but this base can be adjusted by moving the cursor to the right position. (You can also type "sqrt()" but then you get a square root, whose base cannot be adjusted.)</>,
				<><Term>Logarithms:</Term> <M>^(2)\!\log\left(x\right)</M>. Type "log()" on your keyboard to get a logarithm. The input field automatically assumes a base-10 logarithm, but this can of course be adjusted.</>
			]} />
			<Par>Often an exercise knows which types of functions are required. If certain functions are not needed, they are often <Term>disabled</Term> for the input field, which includes the respective key being grayed out on the internal keyboard. This is so that students not familiar with these functions will not be as confused/overwhelmed as they otherwise might be.</Par>
			<Par>The best way to learn how to use mathematical input fields is not by reading though, it's by trying them out! So head over to the examples/exercises and play around.</Par>
		</Translation>
	</>
}
