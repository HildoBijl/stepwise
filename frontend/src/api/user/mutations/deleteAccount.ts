import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

type DeleteAccountData = { deleteAccount: string }
type DeleteAccountVariables = { confirmEmail: string }

const DELETE_ACCOUNT_MUTATION: TypedDocumentNode<DeleteAccountData, DeleteAccountVariables> = gql`
	mutation deleteAccount($confirmEmail: String!) {
		deleteAccount(confirmEmail: $confirmEmail)
	}
`

export function useDeleteAccount() {
	const [mutate, { data, loading, error }] = useMutation(DELETE_ACCOUNT_MUTATION)
	const deleteAccount = useCallback(async (confirmEmail: string) => { await mutate({ variables: { confirmEmail } }) }, [mutate])
	return [deleteAccount, { succeeded: data !== undefined, loading, error }] as const
}
