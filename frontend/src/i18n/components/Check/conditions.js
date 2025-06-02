import { useSwitchValue } from './provider'

// Condition is a component that verifies if the value from the encompassing Switch component matches a condition (a function). If so, it's displayed. Otherwise it's not. It is implemented by various useful components.
export function Condition({ check, children }) {
	const value = useSwitchValue()
	return check(value) ? children : null
}
Condition.tag = 'on-condition'

export function True({ children }) {
	return <Condition check={value => !!value}>{children}</Condition>
}
True.tag = 'on-true'

export function False({ children }) {
	return <Condition check={value => !value}>{children}</Condition>
}
False.tag = 'on-false'
