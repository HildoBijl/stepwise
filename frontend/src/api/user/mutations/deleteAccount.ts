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
	const [mutate, { data, loading, error }] = useMutation(DELETE_ACCOUNT_MUTATION)
	return [
		async (confirmEmail: string) => { await mutate({ variables: { confirmEmail } }) },
		{ succeeded: data !== undefined, loading, error },
	] as const
}
