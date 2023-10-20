import React from 'react'

export function Emp({ children, ...props }) {
	return <em {...props}>{children}</em>
}
