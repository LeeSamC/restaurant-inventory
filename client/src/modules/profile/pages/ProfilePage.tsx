import { useState } from 'react'
import { useProfileUser, useUpdateProfileUser } from '../hooks/useProfile'

export default function ProfilePage() {

    const {
        data,
        isLoading,
        error
    } = useProfileUser()

    const updateProfileUser = useUpdateProfileUser()

    const [isEditing, setIsEditing] = useState(false)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')

    const [formError, setFormError] = useState('')

    function handleEdit() {
        if (!data?.user) {
            return
        }

        setFirstName(data.user.firstName)
        setLastName(data.user.lastName)
        setUsername(data.user.username)

        setFormError('')
        setIsEditing(true)
    }

    function handleCancel() {
        setFirstName('')
        setLastName('')
        setUsername('')
        setFormError('')
        setIsEditing(false)
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

        event.preventDefault()

        setFormError('')

        if (!firstName.trim()) {
            setFormError('First name is required')
            return
        }

        if (!lastName.trim()) {
            setFormError('Last name is required')
            return
        }

        if (!username.trim()) {
            setFormError('Username is required')
            return
        }

        updateProfileUser.mutate(
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim()
            },
            {
                onSuccess: () => {
                    setFormError('')
                    setIsEditing(false)
                },

                onError: (error: any) => {

                    if (error?.status === 409) {
                        setFormError('Username is already taken')
                        return
                    }

                    setFormError(
                        error?.message || 'Failed to update profile'
                    )
                }
            }
        )
    }

    if (isLoading) {
        return (
            <main className="p-4 pb-24">
                <p className="text-gray-500">
                    Loading profile...
                </p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-4 pb-24">
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    Failed to load profile
                </div>
            </main>
        )
    }

    const user = data?.user

    if (!user) {
        return (
            <main className="p-4 pb-24">
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    User profile not found
                </div>
            </main>
        )
    }

    return (
        <main className="p-4 pb-24">

            {/* Page Header */}
            <div className="mb-5">
                <h1 className="text-2xl font-bold">
                    Profile
                </h1>

                <p className="text-gray-500">
                    Manage your profile
                </p>
            </div>

            {/* Profile Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Profile Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Hello, {user.firstName}
                        </h2>

                        <p className="text-sm text-slate-500">
                            @{user.username}
                        </p>
                    </div>

                    {!isEditing && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            <span className="mr-1">
                                ✎
                            </span>

                            Edit Profile
                        </button>
                    )}

                </div>

                {/* Profile Information */}
                {!isEditing && (
                    <div className="space-y-5 px-6 py-6">

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                First Name
                            </p>

                            <p className="mt-1 text-slate-900">
                                {user.firstName}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Last Name
                            </p>

                            <p className="mt-1 text-slate-900">
                                {user.lastName}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Username
                            </p>

                            <p className="mt-1 text-slate-900">
                                @{user.username}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Role
                            </p>

                            <p className="mt-1 text-slate-900">
                                {user.role}
                            </p>
                        </div>

                    </div>
                )}

                {/* Edit Profile Form */}
                {isEditing && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 px-6 py-6"
                    >

                        {/* Form Error */}
                        {formError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {formError}
                            </div>
                        )}

                        {/* First Name */}
                        <div>
                            <label
                                htmlFor="firstName"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                First Name
                            </label>

                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(event) =>
                                    setFirstName(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-black"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label
                                htmlFor="lastName"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-black"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-black"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">

                            <button
                                type="submit"
                                disabled={updateProfileUser.isPending}
                                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updateProfileUser.isPending
                                    ? 'Saving...'
                                    : 'Save Changes'
                                }
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={updateProfileUser.isPending}
                                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </main>
    )
}
