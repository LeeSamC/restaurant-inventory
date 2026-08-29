import {useQuery} from '@tanstack/react-query'

import { getInventory } from '../modules/inventory/inventory.api'

import { useAuthStore } from '../stores/auth.store'

export default function DashboardPage() {

    const user = useAuthStore(state => state.user)

    const {data, isLoading} = useQuery({
        queryKey: ['inventory'],
        queryFn: getInventory
    })

    const items = data?.items ?? []

    const lowStock = items.filter(item => Number(item.currentQuantity) <= Number(item.minimumQuantity))

    const outOfStock = items.filter(item => Number(item.currentQuantity) === 0)

    return (
        <main className='p-4 pb-24'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold'>
                    Dashboard
                </h1>

                <p className='text-gray-500'>
                    Welcome back, {' '}
                    {user?.firstName}
                </p>
            </div>
            
            <div className='mt-6 grid grid-cols-2 gap-3'>
                <div className='rounded-xl border bg-white p-4'>
                    <p className='text-sx text-gray-500'>
                        Total Items
                    </p>

                    <p className='mt-2 text-3xl font-bold'>
                        {isLoading ? '...' : items.length}
                    </p>

                </div>

                <div className='rounded-xl border bg-white p-4'>
                    <p className='text-sm text-gray-500'>
                        Low Stock
                    </p>

                    <p className='mt-2 text-3xl font-bold'>
                        {isLoading ? '...' : lowStock.length}
                    </p>
                </div>

                <div className='col-span-2 rounded-xl border bg-white p-4'>
                    <p className='text-sm text-gray-500'>
                        Out of Stock
                    </p>

                    <p className='mt-2 text-3xl font-bold'>
                        {isLoading ? '...' : outOfStock.length}
                    </p>
                </div>
            </div>

            <section className='mt-8'>
                <h2 className='mb-3 text-lg font-semibold'> 
                    Low Stock
                </h2>

                {lowStock.length === 0 ? (
                    <div className='rounded-xl border bg-white p-6 text-center text-gray-500'>
                        No low-stock items
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {lowStock.map(
                            item => (
                                <div
                                    key={item.inventoryItemId}
                                    className='rounded-xl border bg-white p-4'
                                >
                                    <div className='flex justify-between'>
                                        <span className='font-medium'>
                                            {item.name}
                                        </span>

                                        <span>
                                            {
                                                item.currentQuantity
                                            } {' '}
                                            {
                                                item.unit
                                            }
                                        </span>
                                    </div>

                                </div>
                            )
                        )}
                    </div>
                )}

                
            </section>
        </main>
    )
}