import {api} from '../../lib/api'

export type ProfileUser = {
    userId: string
    firstName: string
    lastName: string
    username: string
    role: string
}

export async function getProfileUser() {
    return api<{
        user: ProfileUser
    }>('/profile')
}

export async function updateProfileUser(
    data: {
        firstName: string
        lastName: string
        username: string
    }
) {
    return api<{
        updatedUser: ProfileUser
    }>('/profile', {
        method: 'PATCH',
        body: data
    })
    
}