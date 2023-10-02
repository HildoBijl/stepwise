import { useSwitchValue } from './provider'

// Checker is a component that verifies if the value from the encompassing Switch component matches a condition (a function). If so, it's displayed. Otherwise it's not. It is implemented by various useful components.
export function Checker({ check, children }) {
	const count = useSwitchValue()
	return check(count) ? children : null
}

export function True({ children }) {
	return <Checker check={value => !!value}>{children}</Checker>
}

export function False({ children }) {
	return <Checker check={value => !value}>{children}</Checker>
}
