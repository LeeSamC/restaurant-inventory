import {api} from '../../lib/api'

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

export async function getInventory() {
    return api<{
        items: InventoryItem[]
    }>('/inventory')
}

export async function getInventoryItem(id: string) {
    return api<{
        item: InventoryItem
        movements: InventoryMovement[]
    }>(`/inventory/${id}`)
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
    referenceNumber: string | null
    reason: string | null
    notes: string | null
    createdAt: string
}

export async function createInventoryItem(
    data: {
        name: string
        categoryId?: string
        supplierId?: string
        unit: string
        minimumQuantity: number
        maximumQuantity?: number
        costPerUnit?: number
    }
){
    return api<{
        item: InventoryItem
        
    }>('/inventory', {
        method: 'POST',
        body: data
    })
}


export async function receiveInventory(
    id: string,
    data: {
        quantity: number
        reason?: string
        notes?: string
        referenceNumber?: string
        unitCost?: number
    }
){
    return api(`/inventory/${id}/receive`, {
        method: 'POST',
        body: data
    })
}

export async function useInventory(
    id: string,
    data: {
        quantity: number
        reason?: string
        notes?: string
    }
){
    return api(`/inventory/${id}/use`, {
        method: 'POST',
        body: data
    })
}

export async function recordWaste(
    id: string,
    data: {
        quantity: number 
        reason?: string
        notes?: string
    }
){
    return api(`/inventory/${id}/waste`, {
        method: 'POST',
        body: data
    })
}