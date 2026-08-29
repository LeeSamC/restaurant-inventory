import {useState} from 'react'

import {Link, useNavigate} from 'react-router-dom'

import {useForm} from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import {z} from 'zod'

import { useAuthStore } from '../../../stores/auth.store'

const registrationSchema = z.object({
    firstName : z.string().min(1, 'First name required'),
    lastName : z.string().min(1, 'Last name required'),
    username: z.string().min(3, 'Username must be atleast three characters'),
    password: z.string().min(8, 'Password must be atleast 8 characters'),
    confirmPassword: z.string()
})
.refine(
    data => data.password === data.confirmPassword,

    {
        message: 'Passwords do not match',

        path: ['confirmPassword']
    }
)

type RegisterForm = z.infer<
    typeof registrationSchema
>

export default function RegistrationPage() {
    const navigate = useNavigate()

    const registerUser = useAuthStore(state => state.register)

    const isLoading = useAuthStore(state => state.isLoading)

    const [error, setError] = useState('')

    const {register, handleSubmit, formState: {errors}} = useForm<RegisterForm>({
        resolver: zodResolver(registrationSchema)
    })

    async function onSubmit(data: RegisterForm) {
        setError('')

        try{
            await registerUser(data)

            navigate('/')
        }catch (error) {
            setError(
                error instanceof Error
                ? error.message
                : 'Registration failed'
            )
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className='text-3xl font-bold'> 
                        Create Account
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Create your restaurant inventory account
                    </p>
                </div> 
                {error && (
                    <div className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700'>
                        {error}
                    </div>
                )} 

                <form 
                    onSubmit={handleSubmit(onSubmit)}
                    className='space-y-4'
                >
                    <div>
                        <label className='mb-1 block text-sm font-medium'>
                            First Name
                        </label>

                        <input
                            {...register('firstName')}
                            className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                            placeholder="John" 
                        />

                        {errors.firstName && (
                            <p className='mt-1 text-sm text-red-600'>
                                {
                                    errors.firstName.message
                                }
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Last Name
                        </label>

                        <input
                            {...register('lastName')}
                            className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                            placeholder="Doe"
                        />

                        {errors.lastName && (
                            <p className='mt-1 text-sm text-red-600'>
                                {
                                    errors.lastName.message
                                }
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Username
                        </label>

                        <input
                            {...register('username')}
                            autoComplete="username"
                            className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                            placeholder="johndoe"
                        />

                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">
                                {
                                errors.username.message
                                }
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Password
                        </label>

                        <input
                            {...register('password')}
                            type="password"
                            autoComplete="new-password"
                            className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                            placeholder="At least 8 characters"
                        />

                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {
                                errors.password
                                    .message
                                }
                            </p>
                        )}

                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Confirm Password
                        </label>

                        <input
                            {...register('confirmPassword')}
                            type="password"
                            autoComplete="new-password"
                            className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                            placeholder="Repeat password"
                        />

                        {errors.confirmPassword && (
                            <p className='mt-1 text-sm text-red-600'>
                                {errors.confirmPassword.message}
                            </p>
                        )}

                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className='w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50'
                    >
                        {isLoading
                            ? 'Creating account ...'
                            : 'Create Account'
                        }

                    </button>

                </form>

                <p className='mt-6 text-center text-sm text-gray-500'>
                    Already have an account? {''}
                    <Link
                        to='/login'
                        className='font-semibold text-gray-900'
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}