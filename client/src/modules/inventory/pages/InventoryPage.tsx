import {useQuery} from '@tanstack/react-query'

import { getInventory } from '../inventory.api'

export default function InventoryPage() {
    const {data, isLoading, error} = useQuery({queryKey: ['inventory'], queryFn: getInventory})

    if(isLoading) {
        return (
            <div className='p-4'>
                Loading Inventory...
            </div>
        )
    }

    if(error){
        return (
            <div className='p-4 text-red-600'>
                Failed to load inventory
            </div>
        )
    }

    return (
        <main className='p-4 pb-24'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold'>
                    Inventory
                </h1>

                <p className='text-gray-500'>
                    Manage restaurant stock
                </p>   
            </div>

            <div className='space-y-3'>
                {data?.items.map(item => {
                    const current = Number(item.currentQuantity)
                    const minimum = Number(item.minimumQuantity)
                    const lowStock = current < minimum

                    return (
                        <div
                            key={item.inventoryItemId}
                            className='rounded-xl border bg-white p-4 shadow-sm'
                        >
                            <div className='flex item-center justify-between'>
                                <div>
                                    <h2 className='font-semibold'>
                                        {item.name}
                                    </h2>

                                    <p className='text-sm text-gray-500'>
                                        Unit: {item.unit}
                                    </p>
                                </div>

                                <div className='text-right'>
                                    <p className='font-bold'>
                                        {item.currentQuantity}
                                    </p>

                                    <p className='text-sm'>
                                        {item.unit}
                                    </p>
                                </div>
                            </div>

                            {lowStock && (
                                <div className='mt-3 rounded-lg bg-yellow-50 p-2 text-sm text-yellow-800'>
                                    ⚠ Low stock
                                </div>
                            )}

                        </div>
                    )
                })}
            </div>
        </main>
    )
}