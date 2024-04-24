import React from 'react'

import { Translation } from 'i18n'
import { Head, Par, List, Term, M } from 'ui/components'

export function Theory() {
	return <>
		<Translation entry="intro">
			<Par>Yet another basic skill is the skill of adding numbers. This is our last step in preparing for combined skills.</Par>
		</Translation>

		<Translation entry="addNumbers">
			<Head>Adding numbers</Head>
			<Par>In this skill you have to <Term>add two numbers</Term>. It's a tutorial - you're allowed to use your calculator - but see if you can do without.</Par>
			<Par>When calculating a sum, for instance <M>19 + 26</M>, you can do the following steps.</Par>
			<List items={[
				<>First add the two rightmost numbers. So <M>9 + 6</M> becomes <M>15</M>. The latter digit - the <M>5</M> - shows the rightmost digit of our result.</>,
				<>Then add the two second numbers. So <M>1 + 2</M> becomes <M>3</M>. This is the second digit of our result. Except: if our first digit was <M>10</M> or more (which in our example it was) then we carry over that <M>1</M> and add it here. So we'd get <M>4</M> here.</>,
				<>Merge the two results together to get the final result: <M>19 + 26 = 45</M>.</>,
			]} />
			<Par>Try it out yourself!</Par>
		</Translation>
	</>
}
