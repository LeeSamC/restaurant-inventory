import {useState} from 'react'
import { useNavigate, useParams } from "react-router-dom";

import { useInventoryItem } from "../hooks/useInventory";
import MovementCard  from "../componenets/MovementCard"
import MovementForm from '../componenets/MovementForm';

export default function InventoryDetailsPage() {
    const navigate = useNavigate()

    const [movementType, setMovementType] = 
        useState<
            'RECEIVED' |
            'USED' |
            'WASTED' |
            null
        >(null)

    const {inventoryItemId} = useParams<{
        inventoryItemId: string
    }>()

    const {data, isLoading, error} = useInventoryItem(inventoryItemId ?? '')

    if(isLoading) {
        return (
            <main className="p-4">
                Loading inventory item...
            </main>
        )
    }

    if(error || !data) {
        return (
            <main className="p-4">
                <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="mb-5 text-sm font-medium"
                >
                    ← Back to Inventory

                </button>

                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                    Failed to load inventory item
                </div>
            </main>
        )
    }

    const {item, movements} = data

    const current = Number(item.currentQuantity)
    const minimum = Number(item.minimumQuantity)

    const lowStock = current <= minimum

    return (
        <main className="p-4 pb-24">
            <button
                type="button"
                onClick={() =>navigate('/inventory')}
                className="mb-5 text-sm font-medium"
            >
                ← Back to Inventory

            </button>

            <div className="mb-5">
                <h1 className="text-2xl font-bold">
                    {item.name}
                </h1>

                <p className="text-gray-500">
                    Measured in {item.unit}
                </p>

            </div>

            <div className="mb-5 rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                    Current Stock

                </p>

                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                        {item.currentQuantity}
                    </span>

                    <span className="text-gray-500">
                        {item.unit}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                            Minimum
                        </p>

                        <p className="font-semibold">
                            {item.minimumQuantity} {item.unit}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                            Maximum
                        </p>

                        <p className="font-semibold">
                            {item.maximumQuantity ? `${item.maximumQuantity} ${item.unit}` : 'Not set'}
                        </p>
                    </div>
            

                </div>

                {lowStock && (
                    <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                        ⚠ This item is low on stock.
                    </div>
                )}

            </div>

            <div className="mb-8 grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => setMovementType('RECEIVED')}
                    className="rounded-lg bg-black px-3 py-3 text-sm font-medium text-white"
                >
                    + Receive

                </button>

                <button
                    type="button"
                    onClick={() => setMovementType('USED')}
                    className="rounded-lg border px-3 py-3 text-sm font-medium"
                >
                    - Use

                </button>

                <button
                    type="button"
                    onClick={() => setMovementType('WASTED')}
                    className="rounded-lg border px-3 py-3 text-sm font-medium"
                >
                    Waste

                </button>

            </div>

            {movementType && (
                <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/40'>
                    <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-20">
                        <div className="mb-5 flex justify-end">
                            <button
                                type='button'
                                onClick={() => setMovementType(null)}
                                className='text-2xl text-gray-500'
                            >
                                x
                            </button>
                        </div>

                        <MovementForm
                            inventoryItemId={item.inventoryItemId}
                            unit = {item.unit}
                            type = {movementType}

                            onSuccess={() => setMovementType(null)}

                            onCancel={() => setMovementType(null)}
                        />
                    </div>

                </div>
            )}

            <section>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                        Movement History
                    </h2>

                    <span className="text-sm text-gray-500">
                        {movements.length} movements
                    </span>

                </div>

                {movements.length === 0 ? (
                    <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-500">
                        No inventory movements yet.
                    </div>
                ): (
                    <div className="space-y-3">
                        {movements.map(movement => (
                            <MovementCard 
                                key={movement.movementId}
                                movement={movement}
                                unit={item.unit}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

