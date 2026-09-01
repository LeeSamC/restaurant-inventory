import type { InventoryItem } from "../inventory.types";

type InventoryCardProps = {
    item: InventoryItem
    onClick?: () => void
}

export default function InventoryCard({
    item,
    onClick
}: InventoryCardProps) {
    const current = Number(item.currentQuantity)
    const minimum = Number(item.minimumQuantity)

    const lowStock = current <= minimum

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full rounded-xl border bg-white p-4 text-left shadow-sm active:bg-gray-50">

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">
                            {item.name}
                        </h2>

                        <p className="text-sm text-gray-500">
                            Unit: {item.unit}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xl font-bold">
                            {item.currentQuantity}
                        </p>

                        <p className="text-sm text-gray-500">
                            {item.unit}
                        </p>
                    </div>

                </div>

                {lowStock && (
                    <div className="mt-3 rounded-lg bg-yellow-50 p-2 text-sm text-yellow-800">
                        ⚠ Low stock
                    </div>
                )}
            </button>
    )
}