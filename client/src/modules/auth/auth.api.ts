import {api} from '../../lib/api'

export type User = {
    userId: string
    firstName: string
    lastName: string
    username: string
    role: string
    createdAt: string
    updatedAt: string
}

export async function registerUser(
    data: {
        firstName: string
        lastName: string
        username: string
        password: string
    }
){
    return api<{
        user: User
    }>('/register', {
        method: 'POST',
        body: data
    })
}

export async function loginUser(
    data: {
        username: string
        password: string
    }
){
    return api<{
        user: User
    }>('/login', {
        method: 'POST',
        body: data
    })
}