import type { InventoryMovement } from "../inventory.types";


export default function MovementCard({
    movement,
    unit
}: {
    movement: InventoryMovement
    unit: string
}) {
    const isReceived = movement.type === 'RECEIVED'

    const isUsed = movement.type === 'USED'

    const label = 
        movement.type === 'RECEIVED'
            ? 'Receieved'
            : movement.type === 'USED'
                ? 'Used'
                :movement.type === 'WASTED'
                    ? 'Wasted'
                    : 'Adjustment'


    const quantity = 
        isReceived
            ? `+${movement.quantity}`
            : `-${movement.quantity}`

    const date = new Date(movement.createdAt).toLocaleString()

    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="font-semibold">
                        {label}
                    </p>

                    <p className="text-xs text-gray-500">
                        {date}
                    </p>
                </div>

                <div className="text-right">
                    <p className={
                        isReceived 
                            ? 'font-bold text-green-600'
                            : isUsed
                                ? 'font-bold text-blue-600'
                                : 'font-bold text-red-600'}> 
                        {quantity}
                    </p>

                    <p className="text-xs text-gray-500">
                        {unit}
                    </p>
                </div>
            </div>

            {movement.reason && (
                <p className="mt-3 text-sm">
                    <span className="font-medium">
                        Reason:

                    </span>{' '}
                    {movement.reason}

                </p>
            )}

            {movement.notes && (
                <p className="mt-1 text-sm text-gray-600">
                    {movement.notes}
                </p>
            )}

            {movement.referenceNumber && (
                <p className="mt-1 text-xs text-gray-500">
                    Reference: {movement.referenceNumber}
                </p>
            )}
        


        </div>
    )
}
