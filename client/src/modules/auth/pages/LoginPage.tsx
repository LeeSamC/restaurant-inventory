import {useState} from 'react'

import {Link, useNavigate} from 'react-router-dom'

import {useForm} from 'react-hook-form'

import {zodResolver} from '@hookform/resolvers/zod'

import {z} from 'zod'

import { useAuthStore } from '../../../stores/auth.store'

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
})

type loginForm = z.infer<
    typeof loginSchema
>

export default function LoginPage() {
    const navigate = useNavigate()

    const login = useAuthStore(state => state.login)

    const isLoading = useAuthStore(state => state.isLoading)

    const [error, setError] = useState('')

    const {register, handleSubmit, formState: {errors} } = useForm<loginForm>({
        resolver: zodResolver(loginSchema)
    })

    async function onSubmit(data: loginForm){
        setError('')

        try{
            await login(
                data.username,
                data.password
            )

            navigate('/')
        }catch (error) {
            setError(
                error instanceof Error
                ? error.message
                : 'Login Failed'
            )
        }
    }

    return (
        <main className='flex min-h-screen items-center justify-center bg-gray-100 p-4'>
            <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-lg'>
                <div className='mb-8 text-center'>
                    <h1 className='text-3xl font-bold'>
                        Restaurant Inventory
                    </h1>

                    <p className='mt-2 text-gray-500'>
                        Sign in to your account 
                    </p>
                </div>

                {error && (
                    <div className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700'>
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='space-y-5'
                >
                    <div>
                        <label className='mb-1 block text-sm font-medium'>
                            Username
                        </label>

                        <input
                            {...register('username')}
                            type = 'text'
                            autoComplete='username'
                            className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-2'
                            placeholder='Enter username' 
                         />

                         {errors.username && (
                            <p className='mt-1 text-sm text-red-600'>
                                {
                                    errors.username.message
                                }
                            </p>
                         )}
                    </div>

                    <div>
                        <label className='mb-1 block text-sm font-medium'>
                            Password
                        </label>

                        <input
                            {...register('password')} 
                            type='password'
                            autoComplete='current-password'
                            className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-2'
                            placeholder='Enter password'
                        />

                        {errors.password && (
                            <p className='mt-1 text-sm text-red-600'>
                                {
                                    errors.password.message
                                }
                            </p>
                        )}
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className='w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50'
                    >
                        {isLoading ? 'Signing in....' : 'Sign In'}

                    </button>

                </form>

                <p className='mt-6 text-center text-sm text-gray-500'>
                        Dont have an account? {''}
                        <Link
                            to="/register"
                            className='font-semibold text-gray-900'
                        >
                            Create one
                        </Link>
                </p>
            </div>

        </main>
    )
}