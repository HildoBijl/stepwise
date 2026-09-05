import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

type DeleteAccountData = { deleteAccount: string }
type DeleteAccountVariables = { confirmEmail: string }

const DELETE_ACCOUNT_MUTATION: TypedDocumentNode<DeleteAccountData, DeleteAccountVariables> = gql`
	mutation deleteAccount($confirmEmail: String!) {
		deleteAccount(confirmEmail: $confirmEmail)
	}
`

export function useDeleteAccountMutation() {
	const [deleteAccount, result] = useMutation(DELETE_ACCOUNT_MUTATION)
	return [(confirmEmail: string) => deleteAccount({ variables: { confirmEmail } }), result] as const
}
