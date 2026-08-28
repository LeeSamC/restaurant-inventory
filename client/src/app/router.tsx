import {createBrowserRouter} from 'react-router-dom'

import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import InventoryPage from '../modules/inventory/pages/InventoryPage'

export const router = 
    createBrowserRouter([
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
                }
            ]
        }
    ])