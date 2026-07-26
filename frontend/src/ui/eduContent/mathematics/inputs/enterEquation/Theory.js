import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, Term, M } from 'ui/components'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>A large part of mathematics resolves around manipulating and subsequently solving <Term>equations</Term>. Think of <M>a^2 + b^2 = c^2</M>. It consists of two expressions with an equals-sign in-between. So how does Step-Wise deal with these?</Par>
		</Translation>

		<Translation entry="entering">
			<Head>Entering equations</Head>
			<Par>Entering equations into Step-Wise isn't hard. Just type what you want to get. You'll always see on the screen exactly what you have at any point in time.</Par>
			<Par>Obviously equations have various <Term>constraints</Term>. There may not be multiple equals-signs in there - just one - and the equals sign should also not be in the middle of a fraction or function or so. If whatever you enter does not meet these criteria, it's considered an invalid submission. You will get a friendly warning and your submission will not be sent. Only valid submissions are eventually checked for correctness.</Par>
		</Translation>

		<Translation entry="evaluating">
			<Head>Evaluating equations</Head>
			<Par>Step-Wise makes use of an self-designed <Term>Computer Algebra System</Term> (CAS). This CAS checks exercises for correctness. It does this in an intelligent way. Some exercises want you to write a certain exact equation, but in other exercises it could be "anything <Term>equivalent</Term> to some model solution". The Step-Wise CAS then checks your answer for equivalency. Obviously it cannot figure out all possible ways of rewriting equations, but most ways in which equations can be equivalent are detected.</Par>
		</Translation>
	</>
}
