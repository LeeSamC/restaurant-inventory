import {api} from '../../lib/api'

import type { InventoryItem, InventoryMovement } from './inventory.types'

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
    return api<{
        item: InventoryItem
        movement: InventoryMovement
    }>(`/inventory/${id}/receive`, {
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
    return api<{
        item: InventoryItem
        movement: InventoryMovement
    }>(`/inventory/${id}/use`, {
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
    return api<{
        item: InventoryItem
        movement: InventoryMovement
    }>(`/inventory/${id}/waste`, {
        method: 'POST',
        body: data
    })
}