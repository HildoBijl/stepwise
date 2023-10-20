import React from 'react'

export function Term({ children, ...props }) {
	return <strong {...props}>{children}</strong>
}
