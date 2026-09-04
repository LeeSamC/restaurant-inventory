import {createBrowserRouter} from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import InventoryPage from '../modules/inventory/pages/InventoryPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegistrationPage from '../modules/auth/pages/RegistrationPage'
import ProtectedRoute from '../componenets/ProtectedRoute'
import PublicRoute from '../componenets/PublicRoute'
import InventoryDetailsPage from '../modules/inventory/pages/InventoryDetailsPage'
import ProfilePage from '../modules/profile/pages/ProfilePage'


export const router = 
    createBrowserRouter([
        {
            element: <PublicRoute />,
            children: [
                {
                    path: '/login',
                    element: <LoginPage />
                },
                {
                    path: '/register',
                    element: <RegistrationPage />
                }
            ]
        },

        {
            element: <ProtectedRoute />,

            children: [
                {
                    element: <AppLayout />,

                    children: [
                        {
                            path: '/',
                            element: <DashboardPage />
                        },

                        {
                            path: '/inventory',
                            element: <InventoryPage />
                        },

                        {
                            path: '/inventory/:inventoryItemId',
                            element: <InventoryDetailsPage />
                        },

                        {
                            path: '/profile',
                            element: <ProfilePage />
                        }
                    ]
                }
            ]
        }
    ])