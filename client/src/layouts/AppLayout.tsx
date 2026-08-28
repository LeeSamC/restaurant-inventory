import {Outlet} from 'react-router-dom'

import MobileNavigation from '../componenets/MobileNavigation'

export default function AppLayout() {
    return (
        <div className='min-h-screen bg-gray-100'>
            <div className='mx-auto min-h-screen max-w-6xl'>
                <Outlet />
            </div>

            <MobileNavigation />
        </div>
    )
}