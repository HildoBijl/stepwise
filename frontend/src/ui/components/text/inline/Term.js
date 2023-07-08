import React from 'react'

export default function Term({ children, ...props }) {
	return <strong {...props}>{children}</strong>
}
