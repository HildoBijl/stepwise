import React from 'react'

export default function Emp({ children, ...props }) {
	return <em {...props}>{children}</em>
}
