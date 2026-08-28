import {useQuery} from '@tanstack/react-query'

import { getInventory } from '../modules/inventory/inventory.api'

export default function DashboardPage() {
    const {data, isLoading} = useQuery({
        queryKey: ['inventory'],
        queryFn: getInventory
    })

    if(isLoading){
        return (
            <main className='p-4'>
                Loading...
            </main>
        )
    }

    const items = data?.items ?? []

    const lowStock = items.filter(item => Number(item.currentQuantity) <= Number(item.minimumQuantity))

    const outOfStock = items.filter(item => Number(item.currentQuantity) === 0)

    return (
        <main className='p-4 pb-24'>
            <h1 className='text-2xl font-bold'>
                Dashboard
            </h1>

            <p className='mt-1 text-gray-500'>
                Restaurant inventory overview
            </p>

            <div className='mt-6 grid grid-cols-2 gap-3'>
                <div className='rounded-xl border bg-white p-4'>
                    <p className='text-sx text-gray-500'>
                        Total Items
                    </p>

                    <p className='mt-2 text-3xl font-bold'>
                        {items.length}
                    </p>

                </div>

                <div className='rounded-xl border bg-white p-4'>
                    <p className='text-sm text-gray-500'>
                        Low Stock
                    </p>

                    <p className='mt-2 text-3xl font-bold'>
                        {lowStock.length}
                    </p>
                </div>

                <div className='col-span-2 rounded-xl border bg-white p-4'>
                    <p className='text-sm text-gray-500'>
                        Out of Stock
                    </p>

                    <p className='mt-2 text-3xl font-bold'>
                        {outOfStock.length}
                    </p>
                </div>
            </div>

            <section className='mt-8'>
                <h2 className='mb-3 text-lg font-semibold'> 
                    Low Stock
                </h2>

                <div className='space-y-2'>
                    {lowStock.map(item => (
                        <div key={item.inventoryItemId} className='rounded-lg border bg-white p-3'>
                            <div className='flex justify-between'>
                                <span>
                                    {item.name}
                                </span>

                                <span>
                                    {item.currentQuantity}{' '}
                                    {item.unit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}