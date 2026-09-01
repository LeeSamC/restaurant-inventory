export type InventoryItem = {
    inventoryItemId: string
    name: string
    categoryId: string | null
    supplierId: string | null

    unit: string

    currentQuantity: string
    minimumQuantity: string
    maximumQuantity: string | null

    costPerUnit: string | null

    active: boolean

    createdAt: string
    updatedAt: string
}

export type InventoryMovement = {
    movementId: string
    inventoryItemId: string
    userId: string

    type:
        | 'RECEIVED'
        | 'USED'
        | 'WASTED'
        | 'ADJUSTMENT'

    quantity: string

    unitCost: string | null

    reason: string | null
    notes: string | null
    referenceNumber: string | null

    createdAt: string
}