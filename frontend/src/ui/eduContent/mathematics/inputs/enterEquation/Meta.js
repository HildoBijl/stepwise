import React from 'react'

import { Translation } from 'i18n'
import { Par, Term } from 'ui/components'

export function Meta() {
	return <Translation>
		<Par>This skill is about entering <Term>mathematical equations</Term>: two expressions with an equals-sign "=" in-between. It also demonstrates the ways in which the Step-Wise Computer Algebra System can <Term>evaluate</Term> these equations.</Par>
	</Translation>
}
