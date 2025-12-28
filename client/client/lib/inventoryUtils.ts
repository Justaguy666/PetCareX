import { ProductInventory, VaccineInventory, StockStatus, StockAlert, PetItem, Vaccine } from "@shared/types";

/**
 * Get stock status based on quantity
 */
export function getStockStatus(quantity: number): StockStatus {
    if (quantity === 0) return "out";
    if (quantity < 3) return "critical";
    if (quantity < 10) return "low";
    return "normal";
}

/**
 * Get badge color class based on stock status
 */
export function getStockBadgeClass(status: StockStatus): string {
    const badges = {
        normal: "bg-green-50 text-green-700 border-green-200",
        low: "bg-orange-50 text-orange-700 border-orange-200",
        critical: "bg-red-50 text-red-700 border-red-200",
        out: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return badges[status];
}

/**
 * Get product inventory for a specific branch and product
 */
export function getProductStock(branchId: string, productId: string): number {
    try {
        const inventory: ProductInventory[] = JSON.parse(
            localStorage.getItem("petcare_product_inventory") || "[]"
        );
        const item = inventory.find(
            (inv) => inv.branchId === branchId && inv.productId === productId
        );
        return item?.quantity || 0;
    } catch (error) {
        console.error("Error getting product stock:", error);
        return 0;
    }
}

/**
 * Get vaccine inventory for a specific branch and vaccine
 */
export function getVaccineStock(branchId: string, vaccineId: string): number {
    try {
        const inventory: VaccineInventory[] = JSON.parse(
            localStorage.getItem("petcare_vaccine_inventory") || "[]"
        );
        const item = inventory.find(
            (inv) => inv.branchId === branchId && inv.vaccineId === vaccineId
        );
        return item?.quantity || 0;
    } catch (error) {
        console.error("Error getting vaccine stock:", error);
        return 0;
    }
}

/**
 * Validate if sufficient product stock is available
 */
export function validateProductStock(
    branchId: string,
    productId: string,
    requestedQuantity: number
): { valid: boolean; available: number; message?: string } {
    const available = getProductStock(branchId, productId);

    if (available === 0) {
        return {
            valid: false,
            available,
            message: "This product is out of stock at this branch.",
        };
    }

    if (available < requestedQuantity) {
        return {
            valid: false,
            available,
            message: `Insufficient stock. Only ${available} units available.`,
        };
    }

    return { valid: true, available };
}

/**
 * Validate if sufficient vaccine stock is available
 */
export function validateVaccineStock(
    branchId: string,
    vaccineId: string,
    requestedQuantity: number
): { valid: boolean; available: number; message?: string } {
    const available = getVaccineStock(branchId, vaccineId);

    if (available === 0) {
        return {
            valid: false,
            available,
            message: "This vaccine is out of stock at this branch.",
        };
    }

    if (available < requestedQuantity) {
        return {
            valid: false,
            available,
            message: `Insufficient vaccine stock. Only ${available} doses available.`,
        };
    }

    return { valid: true, available };
}

/**
 * Deduct product stock after sales
 * Returns true if successful, false if failed
 */
export function deductProductStock(
    branchId: string,
    productId: string,
    quantity: number
): boolean {
    try {
        const inventory: ProductInventory[] = JSON.parse(
            localStorage.getItem("petcare_product_inventory") || "[]"
        );

        const index = inventory.findIndex(
            (inv) => inv.branchId === branchId && inv.productId === productId
        );

        if (index === -1) {
            console.error("Product inventory not found");
            return false;
        }

        if (inventory[index].quantity < quantity) {
            console.error("Insufficient stock for deduction");
            return false;
        }

        inventory[index].quantity -= quantity;
        inventory[index].updatedAt = new Date().toISOString();

        localStorage.setItem("petcare_product_inventory", JSON.stringify(inventory));
        console.log(`✅ Deducted ${quantity} units of product ${productId} from branch ${branchId}`);
        return true;
    } catch (error) {
        console.error("Error deducting product stock:", error);
        return false;
    }
}

/**
 * Deduct vaccine stock after administration
 * Returns true if successful, false if failed
 */
export function deductVaccineStock(
    branchId: string,
    vaccineId: string,
    quantity: number
): boolean {
    try {
        const inventory: VaccineInventory[] = JSON.parse(
            localStorage.getItem("petcare_vaccine_inventory") || "[]"
        );

        const index = inventory.findIndex(
            (inv) => inv.branchId === branchId && inv.vaccineId === vaccineId
        );

        if (index === -1) {
            console.error("Vaccine inventory not found");
            return false;
        }

        if (inventory[index].quantity < quantity) {
            console.error("Insufficient vaccine stock for deduction");
            return false;
        }

        inventory[index].quantity -= quantity;
        inventory[index].updatedAt = new Date().toISOString();

        localStorage.setItem("petcare_vaccine_inventory", JSON.stringify(inventory));
        console.log(`✅ Deducted ${quantity} doses of vaccine ${vaccineId} from branch ${branchId}`);
        return true;
    } catch (error) {
        console.error("Error deducting vaccine stock:", error);
        return false;
    }
}

/**
 * Restore product stock (for rollback/cancellation)
 */
export function restoreProductStock(
    branchId: string,
    productId: string,
    quantity: number
): boolean {
    try {
        const inventory: ProductInventory[] = JSON.parse(
            localStorage.getItem("petcare_product_inventory") || "[]"
        );

        const index = inventory.findIndex(
            (inv) => inv.branchId === branchId && inv.productId === productId
        );

        if (index === -1) {
            console.error("Product inventory not found");
            return false;
        }

        inventory[index].quantity += quantity;
        inventory[index].updatedAt = new Date().toISOString();

        localStorage.setItem("petcare_product_inventory", JSON.stringify(inventory));
        console.log(`✅ Restored ${quantity} units of product ${productId} to branch ${branchId}`);
        return true;
    } catch (error) {
        console.error("Error restoring product stock:", error);
        return false;
    }
}

/**
 * Restore vaccine stock (for rollback/cancellation)
 */
export function restoreVaccineStock(
    branchId: string,
    vaccineId: string,
    quantity: number
): boolean {
    try {
        const inventory: VaccineInventory[] = JSON.parse(
            localStorage.getItem("petcare_vaccine_inventory") || "[]"
        );

        const index = inventory.findIndex(
            (inv) => inv.branchId === branchId && inv.vaccineId === vaccineId
        );

        if (index === -1) {
            console.error("Vaccine inventory not found");
            return false;
        }

        inventory[index].quantity += quantity;
        inventory[index].updatedAt = new Date().toISOString();

        localStorage.setItem("petcare_vaccine_inventory", JSON.stringify(inventory));
        console.log(`✅ Restored ${quantity} doses of vaccine ${vaccineId} to branch ${branchId}`);
        return true;
    } catch (error) {
        console.error("Error restoring vaccine stock:", error);
        return false;
    }
}

/**
 * Get all low stock alerts for products
 */
export function getProductStockAlerts(branchId?: string): StockAlert[] {
    try {
        const inventory: ProductInventory[] = JSON.parse(
            localStorage.getItem("petcare_product_inventory") || "[]"
        );
        const products: PetItem[] = JSON.parse(
            localStorage.getItem("petcare_pet_items") || "[]"
        );
        const branches = JSON.parse(
            localStorage.getItem("petcare_branches") || "[]"
        );

        const alerts: StockAlert[] = [];

        inventory.forEach((inv) => {
            if (branchId && inv.branchId !== branchId) return;

            const status = getStockStatus(inv.quantity);
            if (status === "low" || status === "critical" || status === "out") {
                const product = products.find((p) => p.id === inv.productId);
                const branch = branches.find((b) => b.id === inv.branchId);

                if (product && branch) {
                    alerts.push({
                        type: "product",
                        itemId: inv.productId,
                        itemName: product.name,
                        branchId: inv.branchId,
                        branchName: branch.name,
                        quantity: inv.quantity,
                        status,
                    });
                }
            }
        });

        return alerts;
    } catch (error) {
        console.error("Error getting product stock alerts:", error);
        return [];
    }
}

/**
 * Get all low stock alerts for vaccines
 */
export function getVaccineStockAlerts(branchId?: string): StockAlert[] {
    try {
        const inventory: VaccineInventory[] = JSON.parse(
            localStorage.getItem("petcare_vaccine_inventory") || "[]"
        );
        const vaccines: Vaccine[] = JSON.parse(
            localStorage.getItem("petcare_vaccines") || "[]"
        );
        const branches = JSON.parse(
            localStorage.getItem("petcare_branches") || "[]"
        );

        const alerts: StockAlert[] = [];

        inventory.forEach((inv) => {
            if (branchId && inv.branchId !== branchId) return;

            const status = getStockStatus(inv.quantity);
            if (status === "low" || status === "critical" || status === "out") {
                const vaccine = vaccines.find((v) => v.id === inv.vaccineId);
                const branch = branches.find((b) => b.id === inv.branchId);

                if (vaccine && branch) {
                    alerts.push({
                        type: "vaccine",
                        itemId: inv.vaccineId,
                        itemName: vaccine.name,
                        branchId: inv.branchId,
                        branchName: branch.name,
                        quantity: inv.quantity,
                        status,
                    });
                }
            }
        });

        return alerts;
    } catch (error) {
        console.error("Error getting vaccine stock alerts:", error);
        return [];
    }
}

/**
 * Update product inventory quantity (for admin restocking)
 */
export function updateProductInventory(
    branchId: string,
    productId: string,
    newQuantity: number
): boolean {
    try {
        const inventory: ProductInventory[] = JSON.parse(
            localStorage.getItem("petcare_product_inventory") || "[]"
        );

        const index = inventory.findIndex(
            (inv) => inv.branchId === branchId && inv.productId === productId
        );

        if (index !== -1) {
            inventory[index].quantity = newQuantity;
            inventory[index].updatedAt = new Date().toISOString();
            inventory[index].lastRestocked = new Date().toISOString();
        } else {
            // Create new inventory entry
            inventory.push({
                id: `pinv-${Date.now()}`,
                branchId,
                productId,
                quantity: newQuantity,
                lastRestocked: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        localStorage.setItem("petcare_product_inventory", JSON.stringify(inventory));
        console.log(`✅ Updated product inventory: ${productId} at ${branchId} to ${newQuantity} units`);
        return true;
    } catch (error) {
        console.error("Error updating product inventory:", error);
        return false;
    }
}

/**
 * Update vaccine inventory quantity (for admin restocking)
 */
export function updateVaccineInventory(
    branchId: string,
    vaccineId: string,
    newQuantity: number
): boolean {
    try {
        const inventory: VaccineInventory[] = JSON.parse(
            localStorage.getItem("petcare_vaccine_inventory") || "[]"
        );

        const index = inventory.findIndex(
            (inv) => inv.branchId === branchId && inv.vaccineId === vaccineId
        );

        if (index !== -1) {
            inventory[index].quantity = newQuantity;
            inventory[index].updatedAt = new Date().toISOString();
            inventory[index].lastRestocked = new Date().toISOString();
        } else {
            // Create new inventory entry
            inventory.push({
                id: `vinv-${Date.now()}`,
                branchId,
                vaccineId,
                quantity: newQuantity,
                lastRestocked: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        localStorage.setItem("petcare_vaccine_inventory", JSON.stringify(inventory));
        console.log(`✅ Updated vaccine inventory: ${vaccineId} at ${branchId} to ${newQuantity} doses`);
        return true;
    } catch (error) {
        console.error("Error updating vaccine inventory:", error);
        return false;
    }
}
