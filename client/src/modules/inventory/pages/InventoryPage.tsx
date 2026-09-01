import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import { useInventoryItems } from '../hooks/useInventory'

import InventoryCard from '../componenets/InventoryCard'
import AddInventoryForm from '../componenets/AddInventoryForm'

export default function InventoryPage() {
    const navigate = useNavigate()
    const {data, isLoading, error} = useInventoryItems()

    const [showAddForm, setShowAddForm] = useState(false)

    const [search, setSearch] = useState('')

    if(isLoading) {
        return (
            <main className='p-4'>
                Loading Inventory...
            </main>
        )
    }

    if (error) {
        return (
            <main className='p-4'>
                <div className='rounded-lg bg-red-50 p-4 text-red-700'>
                    Failed to load inventory
                </div>
            </main>
        )
    }

    const items = data?.items ?? []

    const filteredItems = items.filter(
        item => item.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <main className='p-4 pb-24'>
            <div className='mb-5'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold'>
                            Inventory
                        </h1>

                        <p className='text-gray-500'>
                            Manage restaurant stock
                        </p>
                    </div>

                    <button
                        type='button'
                        onClick={() => setShowAddForm(true)}
                        className='rounded-lg bg-black px-4 py-3 text-sm font-medium text-white'
                    >
                        + Add Item
                    </button>
                </div>
            </div>

            <div className='mb-5'>
                <input
                    type='search'
                    placeholder='Search Inventory...'
                    value={search}
                    onChange={(event => setSearch(event.target.value))}
                    className='w-full rounded-lg border px-4 py-3 outline-none focus:ring-2' 
                />
            </div>

            {items.length === 0 && (
                <div className="rounded-xl border bg-white p-8 text-center">

                    <h2 className="mb-2 font-semibold">
                        No inventory items
                    </h2>

                    <p className="mb-5 text-sm text-gray-500">
                        Add your first inventory item to get started.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setShowAddForm(true)
                        }
                        className="rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
                    >
                        + Add Item
                    </button>

                </div>
            )}

            {items.length > 0 && 
                filteredItems.length === 0 && (
                    <div className='py-10 text-center text-gray-500'>
                        No inventory items match '{search}'
                    </div>
                )
            }

            <div className='space-y-3'>
                {filteredItems.map(item => (
                    <InventoryCard
                        key={item.inventoryItemId}
                        item={item}
                        onClick={() => navigate(`/inventory/${item.inventoryItemId}`)}
                    />
                ))}
            </div>

            {showAddForm && (
                <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/40'>
                    <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className='text-xl font-bold'>
                                    Add Inventory Item
                                </h2>
                                <p className='text-sm text-gray-500'>
                                    Create a new stock item
                                </p>
                            </div>

                            <button
                                type='button'
                                onClick={() => setShowAddForm(false)}
                                className='text-2xl text-gray-500'
                            >   
                                x
                            </button>
                        </div>

                        <AddInventoryForm
                            onSuccess={() => setShowAddForm(false)}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                </div>
            )}
        </main>
    )
}

