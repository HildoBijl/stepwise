export const accentNames = ['dot', 'hat'] as const
export type AccentName = typeof accentNames[number]

export function isAccentName(name: string): name is AccentName {
	return (accentNames as readonly string[]).includes(name)
}
