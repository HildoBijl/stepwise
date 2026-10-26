import React from 'react'

import { withTranslation } from '@step-wise/i18n'

function EmpBase({ children, ...props }) {
	return <em {...props}>{children}</em>
}
export const Emp = withTranslation(EmpBase, { tag: 'emp' })
