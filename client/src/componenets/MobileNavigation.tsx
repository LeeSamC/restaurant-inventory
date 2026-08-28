import { NavLink } from "react-router-dom";

import {Home, Package, BarChart3, User} from 'lucide-react'

export default function MobileNavigation() {
    const links = [
        {
            to: '/',
            label: 'Home',
            icon: Home
        },
        {
            to: './inventory',
            label: 'Inventory',
            icon: Package
        },
        {
            to: '/reports',
            label: 'Reports',
            icon: BarChart3
        },
        {
            to: '/profile',
            label: 'Profile',
            icon: User
        }
    ]

    return (
        <nav className="fixed botton-0 left-0 right-0 border-t bg-white">
            <div className="mx-auto flex max-w-lg justify-around">
                {links.map(link => {
                    const Icon = link.icon

                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({isActive}) => 
                                `flex flex-1 flex-col items-center gap-1 p-3 text-xs ${
                                isActive
                                ? 'font-semibold text-black'
                                : 'text-gray-500'
                                }`  
                            }
                        >
                            <Icon size={20} />

                            {link.label}

                        </NavLink>
                    )
                })}
            </div>

        </nav>
    )
}