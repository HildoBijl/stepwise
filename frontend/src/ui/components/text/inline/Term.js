import React from 'react'

import { withTranslation } from '@step-wise/i18n'

function TermBase({ children, ...props }) {
	return <strong {...props}>{children}</strong>
}
export const Term = withTranslation(TermBase, { tag: 'term' })
