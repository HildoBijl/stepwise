export const accents = ['dot', 'hat'] as const
export type AccentName = typeof accents[number]

export function isAccent(name: string): name is AccentName {
	return (accents as readonly string[]).includes(name)
}
