import { Condition } from '../Check'

export { Condition }

export function One({ children }) {
	return <Condition check={value => value === 1}>{children}</Condition>
}

export function NotOne({ children }) {
	return <Condition check={value => value !== 1}>{children}</Condition>
}

export function Zero({ children }) {
	return <Condition check={value => value === 0}>{children}</Condition>
}

export function Multiple({ children }) {
	return <Condition check={value => value > 1}>{children}</Condition>
}

export function Two({ children }) {
	return <Condition check={value => value === 2}>{children}</Condition>
}
