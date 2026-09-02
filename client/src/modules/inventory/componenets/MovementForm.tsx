import { useState } from 'react'

import { useReceiveInventory, useUseInventory, useWasteInventory } from '../hooks/useInventory'

type MovementType = 
    | 'RECEIVED'
    | 'USED'
    | 'WASTED'

type MovementFormProps = {
    inventoryItemId: string
    unit: string
    type: MovementType
    onSuccess?: () => void
    onCancel?: () => void
}

export default function MovementForm({
    inventoryItemId,
    unit,
    type,
    onSuccess,
    onCancel
}: MovementFormProps) {
    
    const receiveMutation = useReceiveInventory()

    const useMutation = useUseInventory()

    const wasteMutation = useWasteInventory()

    const [quantity, setQuantity] = useState('')

    const [reason, setReason] = useState('')

    const [notes, setNotes] = useState('')

    const [referenceNumber, setReferenceNumber] = useState('')

    const [unitCost, setUnitCost] = useState('')

    const [formError, setFormError] = useState('')

    const isPending = 
        receiveMutation.isPending ||
        useMutation.isPending ||
        wasteMutation.isPending


    const title = 
        type === 'RECEIVED'
            ? 'Receive Stock'
            : type === 'USED'
                ? 'Use Stock'
                : 'Record Waste'

    const buttonText = 
        type === 'RECEIVED'
            ? 'Receive Stock'
            : type === 'USED'
                ? 'Use Stock'
                : 'Record Waste'

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>){
        event.preventDefault()

        setFormError('')

        const parsedQuantity = Number(quantity)

        if(!quantity) {
            setFormError('Quantity is required')
            return
        }

        if(!Number.isFinite(parsedQuantity) || parsedQuantity <= 0){
            setFormError('Quantity must be greater than 0')
            return 
        }

        const parsedUnitCost = unitCost ? Number(unitCost) : undefined

        if(parsedUnitCost !== undefined && (!Number.isFinite(parsedUnitCost) || parsedUnitCost < 0)){
            setFormError('Unit cost must be 0 or greater')
            return 
        }

        const data = {
            quantity: parsedQuantity, 
            reason: reason.trim() || undefined,
            notes: notes.trim() || undefined,
            referenceNumber: referenceNumber.trim() || undefined,
            unitCost: parsedUnitCost
        }

        const options = {
            onSuccess: () => {
                setQuantity('')
                setReason('')
                setNotes('')
                setReferenceNumber('')
                setUnitCost('')
                setFormError('')

                onSuccess?.()
            },

            onError: (error: any) => {
                const message = error?.message ?? 'Failed to record inventory movement'

                setFormError(message)
            }
        }

        if(type === 'RECEIVED') {
            receiveMutation.mutate({
                inventoryItemId,
                data
            }, options)
            return
        }

        if(type === 'USED') {
            useMutation.mutate({
                inventoryItemId,
                data
            }, options)
            return
        }

        wasteMutation.mutate({
            inventoryItemId,
            data
        }, options)

    }

    return (
        <form
            onSubmit={handleSubmit}
            className='space-y-5'
        >
            <div>
                <h2 className='text-xl font-bold'>
                    {title}
                </h2>

                <p className='text-sm text-gray-500'>
                    Enter the amount of stock involved
                </p>
            </div>

            <div>
                <label 
                    htmlFor="quantity"
                    className='mb-1 block text-sm font-medium'
                >
                    Quantity ({unit})
                    
                </label>

                <input
                    id='quantity'
                    type='number'
                    min='0'
                    step='0.001'
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder={`e.g. 10 ${unit}`}
                    className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-2'
                    autoFocus 
                />
            </div>

            {type === 'RECEIVED' && (
                <div>
                    <label 
                        htmlFor="unitCost"
                        className='mb-1 block text-sm font-medium'
                    >
                        Cost Per Unit

                    </label>

                    <input
                        id='unitCost'
                        type='number'
                        min='0'
                        step='0.01'
                        value={unitCost}
                        onChange={(event) => setUnitCost(event.target.value)} 
                        placeholder='Optional'
                        className='w-full rounded-lg border px-3 py-3 outline-none focus:ring-2'
                    />
                </div>
            )}

            {type === 'RECEIVED' && (

                <div>

                    <label
                        htmlFor="referenceNumber"
                        className="mb-1 block text-sm font-medium"
                    >
                        Reference Number
                    </label>

                    <input
                        id="referenceNumber"
                        type="text"
                        value={referenceNumber}
                        onChange={(event) =>
                            setReferenceNumber(
                                event.target.value
                            )
                        }
                        placeholder="Invoice or receipt number"
                        className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                    />

                </div>

            )}

            <div>

                <label
                    htmlFor="reason"
                    className="mb-1 block text-sm font-medium"
                >
                    Reason
                </label>

                <input
                    id="reason"
                    type="text"
                    maxLength={255}
                    value={reason}
                    onChange={(event) =>
                        setReason(
                            event.target.value
                        )
                    }
                    placeholder={
                        type === 'RECEIVED'
                            ? 'e.g. Weekly supplier delivery'
                            : type === 'USED'
                                ? 'e.g. Prepared lunch service'
                                : 'e.g. Expired food'
                    }
                    className="w-full rounded-lg border px-3 py-3 outline-none focus:ring-2"
                />

            </div>

            <div>

                <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium"
                >
                    Notes
                </label>

                <textarea
                    id="notes"
                    maxLength={2000}
                    rows={3}
                    value={notes}
                    onChange={(event) =>
                        setNotes(
                            event.target.value
                        )
                    }
                    placeholder="Optional notes..."
                    className="w-full resize-none rounded-lg border px-3 py-3 outline-none focus:ring-2"
                />

            </div>

            {formError && (

                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                </div>

            )}

            <div className='flex gap-3'>

                <button
                    type='button'
                    onClick={onCancel}
                    disabled={isPending}
                    className='flex-1 rounded-lg border px-4 py-3 font-medium'
                >
                    Cancel

                </button>

                <button
                    type='submit'
                    disabled={isPending}
                    className='flex-1 rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50'
                >
                    {isPending ? 'Saving...' : buttonText}

                </button>

            </div>

            
        </form>
    )

}