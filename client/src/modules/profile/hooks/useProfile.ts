import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import { getProfileUser, updateProfileUser } from '../profile.api'

export const ProfileKeys = {
    all: ['profile'] as const,
    user: () =>
        [...ProfileKeys.all, 'user'] as const 
}

export function useProfileUser() {
    return useQuery({
        queryKey: ProfileKeys.user(),
        queryFn: getProfileUser
    })
}

export function useUpdateProfileUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProfileUser,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ProfileKeys.user()
            })
        }
    })
}