import { useEffect } from "react";

import {Navigate, Outlet} from 'react-router-dom'

import { useAuthStore } from "../stores/auth.store";

export default function ProtectedRoute() {
    const user = useAuthStore(state => state.user)

    const isLoading = useAuthStore(state => state.isLoading)

    const isInitialized = useAuthStore(state => state.isInitialized)

    const checkAuth = useAuthStore(state => state.checkAuth)

    useEffect(() => {
        if(!isInitialized) {
            checkAuth()
        }
    }, [
        isInitialized,
        checkAuth
    ])

    if(!isInitialized || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    if(!user) {
        return(
            <Navigate
                to="/login"
                replace
            />
        )
    }

    return <Outlet />
}