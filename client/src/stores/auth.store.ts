import {create} from 'zustand'

import { api } from '../lib/api'

export type User = {
    userId: string
    firstName: string
    lastName: string
    username: string
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}

type AuthState = {
    user: User | null
    isLoading: boolean

    login: (
        username: string,
        password: string,
    ) => Promise<void>

    logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>(
    set => ({
        user: null,
        isLoading: false,

        login: async (
            username,
            password
        ) => {
            set({
                isLoading: true
            })

            try{
                const result = await api<{
                    user: User
                }>('/auth/login', {
                    method: 'POST',
                    body: {
                        username,
                        password
                    }
                })

                set({
                    user: result.user
                })
            }finally{
                set({
                    isLoading:false
                })
            }
        },

        logout: async () => {
            await api('/auth/logout', {
                method: 'POST'
            })

            set({
                user: null
            })
        }
    })
)