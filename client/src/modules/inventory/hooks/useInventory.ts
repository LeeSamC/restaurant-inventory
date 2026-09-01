import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import { createInventoryItem, getInventory, getInventoryItem, receiveInventory, useInventory, recordWaste } from '../inventory.api'

export const InventoryKeys = {
    all: ['inventory'] as const,

    lists: () =>
        [...InventoryKeys.all, 'list'] as const,

    details: () => 
        [...InventoryKeys.all, 'detail'] as const,

    detail: (id: string) => 
        [...InventoryKeys.details(), id] as const
}   

export function useInventoryItems() {
    return useQuery({
        queryKey: InventoryKeys.lists(),

        queryFn: getInventory
    })
}

export function useInventoryItem(id: string) {
    return useQuery({
        queryKey: InventoryKeys.detail(id),

        queryFn: () => getInventoryItem(id),

        enabled: Boolean(id)
    })
}

export function useCreateInventoryItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createInventoryItem,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: InventoryKeys.lists()
            })
        }
    })
}

export function useReceiveInventory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            inventoryItemId,
            data
        }: {
            inventoryItemId: string
            data: Parameters<
                typeof receiveInventory
            >[1]
        }) => 
            receiveInventory(
                inventoryItemId,
                data
            ),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey:
                    InventoryKeys.lists()
            })

            queryClient.invalidateQueries({
                queryKey: InventoryKeys.detail(
                    variables.inventoryItemId
                )
            })
        }
        
    })
}

export function useUseInventory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            inventoryItemId,
            data
        }: {
            inventoryItemId: string
            data: Parameters<
                typeof useInventory
            >[1]
        }) => 
            useInventory(
                inventoryItemId,
                data
            ),
        
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: InventoryKeys.lists()
            })

            queryClient.invalidateQueries({
                queryKey: InventoryKeys.detail(
                    variables.inventoryItemId
                )
            })
        }
    })
}

export function useWasteInventory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            inventoryItemId,
            data
        }: {
            inventoryItemId: string
            data: Parameters<
                typeof recordWaste
            >[1]
        }) => 
            recordWaste(
                inventoryItemId,
                data
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: InventoryKeys.lists()
            })

            queryClient.invalidateQueries({
                queryKey:
                    InventoryKeys.detail(
                        variables.inventoryItemId
                    )
            })
        }
    })
}