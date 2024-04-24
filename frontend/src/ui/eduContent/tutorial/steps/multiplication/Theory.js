import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, Term, M } from 'ui/components'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>The whole idea of Step-Wise is to solve complicated problems <Term>Step-Wise</Term>: break them down into smaller pieces which are a lot simpler to tackle. To show you how that works, we first tackle two simpler tasks: multiplying numbers and adding them. Afterwards we merge these two skills into a more involved skill.</Par>
		</Translation>

		<Translation entry="multiplyNumbers">
			<Head>Multiplying numbers</Head>
			<Par>In this skill you have to <Term>multiply two numbers</Term>. When multiplying small numbers, people usually do so from <Term>memory</Term>. As a child you learned what <M>3 \cdot 4</M> is. You don't recalculate it every time. You simply know it's <M>12</M>.</Par>
			<Par>If you really can't remember what the result of a certain multiplication is, then feel free to use a calculator. This is a tutorial after all! But do remember the result, for if it ever comes up again later!</Par>
		</Translation>
	</>
}
