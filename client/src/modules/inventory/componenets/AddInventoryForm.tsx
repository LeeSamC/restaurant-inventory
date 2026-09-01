import {useState} from 'react'

import { useCreateInventoryItem } from '../hooks/useInventory'

type AddInventoryFormProps = {
    onSuccess?: () => void
    onCancel?: () => void
}

export default function AddInventoryForm({
    onSuccess,
    onCancel
}: AddInventoryFormProps) {
    
    const createInventoryItem = useCreateInventoryItem()

    const [name, setName] = useState('')
    const [unit, setUnit] = useState('')

    const [minimumQuantity, setMinimumQuantity] = useState('')

    const [maximumQuantity, setMaximumQuantity] = useState('')

    const [costPerUnit, setCostPerUnit] = useState('')

    const [formError, setFormError] = useState('')

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault()
        setFormError('')



        if (!name.trim()) {
            setFormError('Item name is required')
            return
        }


        if (!unit.trim()) {
            setFormError('Unit is required')
            return
        }


        if (!minimumQuantity) {
            setFormError(
                'Minimum quantity is required'
            )
            return
        }

        const minimum = Number(minimumQuantity)

        const maximum = maximumQuantity ? Number(maximumQuantity) : undefined

        const cost = costPerUnit ? Number(costPerUnit) : undefined

        if(minimum < 0) {
            setFormError('Minimum quantity cannot be negatice')
            return
        }

        if(maximum !== undefined && maximum < minimum){
            setFormError('Maximum quantity must be greater than minimum quantity')
            return
        }

        if(cost !== undefined && cost < 0){
            setFormError('Cost cannot be negative')
            return
        }

        createInventoryItem.mutate({
            name: name.trim(),
            unit: unit.trim(),
            minimumQuantity: minimum,
            maximumQuantity: maximum,
            costPerUnit: cost
        }, {
            onSuccess: () => {
                setName('')
                setUnit('')
                setMinimumQuantity('')
                setMaximumQuantity('')
                setCostPerUnit('')
                setFormError('')

                onSuccess?.()
            },

            onError: () => {
                setFormError('Failed to create Inventory Item')
            }
        })

    }

    return (
        <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
                <label htmlFor="name" className='mb-1 block text-sm font-medium'>
                    Item Name
                </label>

                <input
                    id='name'
                    type='text'
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder='eg. Jasmine Rice'
                    className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-2'
                />
            </div>

            <div>
                <label htmlFor="unit" className='mb-1 block text-sm font-medium'>
                    Unit
                </label>
                
                <input
                    id='unit'
                    type='text'
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    placeholder='eg. kg, bag, bottle'
                    className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-' 
                />
            </div>

            <div>
                <label htmlFor="minimumQuantity" className='mb-1 block text-sm font-medium'>
                    Minimum Quantity
                </label>

                <input 
                    id='minimumQuantity'
                    type='number'
                    min='0'
                    step='0.001'
                    value={minimumQuantity}
                    onChange={(event) => setMinimumQuantity(event.target.value)}
                    placeholder='eg. 10'
                    className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-2'
                />

                <p className='mt-1 text-xs text-gray-500'>
                    The quantity at which the item should be considered low stock.
                </p>
            </div>

            <div>

                <label
                    htmlFor="maximumQuantity"
                    className="mb-1 block text-sm font-medium"
                >
                    Maximum Quantity
                </label>

                <input
                    id="maximumQuantity"
                    type="number"
                    min="0"
                    step="0.001"
                    value={maximumQuantity}
                    onChange={(event) =>
                        setMaximumQuantity(
                            event.target.value
                        )
                    }
                    placeholder="Optional"
                    className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                />

            </div>


            <div>

                <label
                    htmlFor="costPerUnit"
                    className="mb-1 block text-sm font-medium"
                >
                    Cost Per Unit
                </label>

                <input
                    id="costPerUnit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPerUnit}
                    onChange={(event) =>
                        setCostPerUnit(
                            event.target.value
                        )
                    }
                    placeholder="Optional"
                    className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                />

            </div>

            {formError && (
                <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700'>
                    {formError}
                </div>
            )}

            <div className='flex gap-3'>
                <button
                    type='button'
                    onClick={onCancel}
                    disabled={createInventoryItem.isPending}
                    className='flex-1 rounded-lg border px-4 py-3 font-medium'
                >
                    Cancel

                </button>

                <button
                    type='submit'
                    disabled={createInventoryItem.isPending}
                    className='flex-1 rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50'
                >
                    {createInventoryItem.isPending ? 'Creating...' : 'Add Item'}
                </button>
            </div>


            
        </form>
    )
}