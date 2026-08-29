import {Outlet, useNavigate} from 'react-router-dom'

import {LogOut} from 'lucide-react'

import MobileNavigation from '../componenets/MobileNavigation'

import { useAuthStore } from '../stores/auth.store'

export default function AppLayout() {

    const navigate = useNavigate()

    const user = useAuthStore(state => state.user)

    const logout = useAuthStore(state => state.logout)

    async function handleLogout() {
        await logout()

        navigate('/login')
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <header className='border-b bg-white'>
                <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-5'>
                    <div>
                        <h1 className='font-bold'>
                            Restaurant Inventory
                        </h1>

                        {user && (
                            <p className='text-sm text-gray-500'>
                                Welcome, {''}
                                {user.firstName}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                        <LogOut size={18}/>
                        Logout
                    </button>

                </div>
            </header>

            <Outlet />

            <MobileNavigation />
        </div>
    )
}