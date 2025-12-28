/**
 * Membership Level Utilities
 * Strictly follows ERD rules for customer membership levels
 */

import { MembershipLevel, User, ServiceInvoice } from "@shared/types";

/**
 * Valid membership levels according to ERD
 */
export const VALID_MEMBERSHIP_LEVELS: MembershipLevel[] = ["Cơ bản", "Thân thiết", "VIP"];

/**
 * Default membership level for new customers
 */
export const DEFAULT_MEMBERSHIP_LEVEL: MembershipLevel = "Cơ bản";

/**
 * Membership upgrade and maintenance thresholds (in VND) - Based on ERD
 */
export const MEMBERSHIP_THRESHOLDS = {
    VIP_UPGRADE: 12000000,      // Upgrade to VIP at 12,000,000 VND
    VIP_MAINTAIN: 8000000,      // Maintain VIP at 8,000,000 VND
    LOYAL_UPGRADE: 5000000,     // Upgrade to Loyal at 5,000,000 VND
    LOYAL_MAINTAIN: 3000000,    // Maintain Loyal at 3,000,000 VND
} as const;

/**
 * Validate if a membership level is valid
 * @param level - The membership level to validate
 * @returns true if valid, false otherwise
 */
export function isValidMembershipLevel(level: string): level is MembershipLevel {
    return VALID_MEMBERSHIP_LEVELS.includes(level as MembershipLevel);
}

/**
 * Calculate membership level based on yearly spending
 * This is a placeholder for future backend implementation
 * 
 * @param yearlySpending - Total spending in VND for the year
 * @returns The appropriate membership level
 * 
 * @example
 * calculateMembershipLevel(3_000_000)  // Returns "Cơ bản"
 * calculateMembershipLevel(7_000_000)  // Returns "Thân thiết"
 * calculateMembershipLevel(15_000_000) // Returns "VIP"
 */
export function calculateMembershipLevel(yearlySpending: number): MembershipLevel {
    if (yearlySpending >= MEMBERSHIP_THRESHOLDS.VIP_UPGRADE) {
        return "VIP";
    } else if (yearlySpending >= MEMBERSHIP_THRESHOLDS.LOYAL_UPGRADE) {
        return "Thân thiết";
    } else {
        return "Cơ bản";
    }
}

/**
 * Get membership level display with icon
 * @param level - The membership level
 * @returns Display string with icon
 */
export function getMembershipDisplay(level: MembershipLevel): string {
    const icons = {
        "Cơ bản": "🥉",
        "Thân thiết": "🥈",
        "VIP": "🥇"
    };
    return `${icons[level]} ${level}`;
}

/**
 * Get next membership tier information
 * @param currentLevel - Current membership level
 * @param currentSpending - Current yearly spending
 * @returns Information about next tier or null if already VIP
 */
export function getNextTierInfo(
    currentLevel: MembershipLevel,
    currentSpending: number
): { nextTier: MembershipLevel; amountNeeded: number } | null {
    if (currentLevel === "VIP") {
        return null; // Already at highest tier
    }

    if (currentLevel === "Thân thiết") {
        return {
            nextTier: "VIP",
            amountNeeded: MEMBERSHIP_THRESHOLDS.VIP_UPGRADE - currentSpending
        };
    }

    // Current level is "Cơ bản"
    return {
        nextTier: "Thân thiết",
        amountNeeded: MEMBERSHIP_THRESHOLDS.LOYAL_UPGRADE - currentSpending
    };
}

// ============================================================
// MAIN MEMBERSHIP UPDATE SYSTEM
// ============================================================

/**
 * Calculate yearly spending for a customer
 * Aggregates all invoices from Jan 1 to Dec 31 of current year
 */
export function calculateYearlySpending(customerId: string): number {
    try {
        const currentYear = new Date().getFullYear();

        // Get all service invoices
        const serviceInvoices: ServiceInvoice[] = JSON.parse(
            localStorage.getItem("petcare_service_invoices") || "[]"
        );

        // Get all product invoices (if exists)
        const productInvoices = JSON.parse(
            localStorage.getItem("petcare_product_invoices") || "[]"
        );

        // Filter and sum invoices for current year
        const yearlyTotal = [...serviceInvoices, ...productInvoices]
            .filter((invoice: any) => {
                if (invoice.customerId !== customerId) return false;

                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, invoice: any) => sum + (invoice.total || 0), 0);

        return yearlyTotal;
    } catch (error) {
        console.error("Error calculating yearly spending:", error);
        return 0;
    }
}

/**
 * Determine membership level based on spending with upgrade/maintenance rules
 */
export function determineMembershipLevel(
    currentLevel: MembershipLevel,
    yearlySpending: number
): MembershipLevel {
    // Upgrade rules
    if (yearlySpending >= MEMBERSHIP_THRESHOLDS.VIP_UPGRADE) {
        return "VIP";
    }

    if (yearlySpending >= MEMBERSHIP_THRESHOLDS.LOYAL_UPGRADE) {
        return "Thân thiết";
    }

    // Maintenance/downgrade rules
    if (currentLevel === "VIP") {
        if (yearlySpending >= MEMBERSHIP_THRESHOLDS.VIP_MAINTAIN) {
            return "VIP";
        }
        // Downgrade to Loyal if below VIP maintenance threshold
        return "Thân thiết";
    }

    if (currentLevel === "Thân thiết") {
        if (yearlySpending >= MEMBERSHIP_THRESHOLDS.LOYAL_MAINTAIN) {
            return "Thân thiết";
        }
        // Downgrade to Basic if below Loyal maintenance threshold
        return "Cơ bản";
    }

    // Default to Basic
    return "Cơ bản";
}

/**
 * MAIN FUNCTION: Update customer membership level
 * Should be called after every invoice is finalized
 */
export function updateCustomerMembership(customerId: string): {
    success: boolean;
    oldLevel: MembershipLevel;
    newLevel: MembershipLevel;
    yearlySpending: number;
    upgraded: boolean;
    downgraded: boolean;
} {
    try {
        const users: User[] = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const customerIndex = users.findIndex(
            (u) => u.id === customerId && u.role === "customer"
        );

        if (customerIndex === -1) {
            return {
                success: false,
                oldLevel: "Cơ bản",
                newLevel: "Cơ bản",
                yearlySpending: 0,
                upgraded: false,
                downgraded: false,
            };
        }

        const customer = users[customerIndex];
        const oldLevel = customer.membershipLevel || "Cơ bản";

        // Calculate yearly spending
        const yearlySpending = calculateYearlySpending(customerId);

        // Determine new membership level
        const newLevel = determineMembershipLevel(oldLevel, yearlySpending);

        // Update customer data
        users[customerIndex] = {
            ...customer,
            membershipLevel: newLevel,
            yearlySpending: yearlySpending,
        };

        localStorage.setItem("petcare_users", JSON.stringify(users));

        const upgraded = getMembershipRank(newLevel) > getMembershipRank(oldLevel);
        const downgraded = getMembershipRank(newLevel) < getMembershipRank(oldLevel);

        return {
            success: true,
            oldLevel,
            newLevel,
            yearlySpending,
            upgraded,
            downgraded,
        };
    } catch (error) {
        console.error("Error updating customer membership:", error);
        return {
            success: false,
            oldLevel: "Cơ bản",
            newLevel: "Cơ bản",
            yearlySpending: 0,
            upgraded: false,
            downgraded: false,
        };
    }
}

/**
 * Get membership rank for comparison
 */
function getMembershipRank(level: MembershipLevel): number {
    switch (level) {
        case "VIP":
            return 3;
        case "Thân thiết":
            return 2;
        case "Cơ bản":
        default:
            return 1;
    }
}

/**
 * Get color class for membership badge
 */
export function getMembershipBadgeClass(level: MembershipLevel): string {
    switch (level) {
        case "VIP":
            return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500";
        case "Thân thiết":
            return "bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-500";
        case "Cơ bản":
        default:
            return "bg-gray-200 text-gray-700 border-gray-300";
    }
}

/**
 * Get membership level icon
 */
export function getMembershipIcon(level: MembershipLevel): string {
    switch (level) {
        case "VIP":
            return "👑";
        case "Thân thiết":
            return "⭐";
        case "Cơ bản":
        default:
            return "📋";
    }
}

/**
 * Get next level requirement
 */
export function getNextLevelRequirement(
    currentLevel: MembershipLevel,
    yearlySpending: number
): {
    nextLevel: MembershipLevel | null;
    requiredSpending: number;
    remainingAmount: number;
    message: string;
} {
    if (currentLevel === "VIP") {
        return {
            nextLevel: null,
            requiredSpending: 0,
            remainingAmount: 0,
            message: "Bạn đang ở cấp độ cao nhất!",
        };
    }

    if (currentLevel === "Thân thiết") {
        const remaining = MEMBERSHIP_THRESHOLDS.VIP_UPGRADE - yearlySpending;
        return {
            nextLevel: "VIP",
            requiredSpending: MEMBERSHIP_THRESHOLDS.VIP_UPGRADE,
            remainingAmount: Math.max(0, remaining),
            message: `Chi tiêu thêm ${Math.max(0, remaining).toLocaleString()} VNĐ để đạt VIP`,
        };
    }

    // Basic level
    const remaining = MEMBERSHIP_THRESHOLDS.LOYAL_UPGRADE - yearlySpending;
    return {
        nextLevel: "Thân thiết",
        requiredSpending: MEMBERSHIP_THRESHOLDS.LOYAL_UPGRADE,
        remainingAmount: Math.max(0, remaining),
        message: `Chi tiêu thêm ${Math.max(0, remaining).toLocaleString()} VNĐ để đạt Thân thiết`,
    };
}

/**
 * Check if customer is eligible for promotion
 */
export function isEligibleForPromotion(
    customerLevel: MembershipLevel,
    requiredLevel: "all" | "Thân thiết" | "VIP"
): boolean {
    if (requiredLevel === "all") return true;

    const customerRank = getMembershipRank(customerLevel);
    const requiredRank = getMembershipRank(requiredLevel);

    return customerRank >= requiredRank;
}

/**
 * Recalculate all customer memberships (admin function)
 */
export function recalculateAllMemberships(): {
    success: boolean;
    updated: number;
    upgraded: number;
    downgraded: number;
    errors: number;
} {
    try {
        const users: User[] = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const customers = users.filter((u) => u.role === "customer");

        let updated = 0;
        let upgraded = 0;
        let downgraded = 0;
        let errors = 0;

        customers.forEach((customer) => {
            const result = updateCustomerMembership(customer.id);
            if (result.success) {
                updated++;
                if (result.upgraded) upgraded++;
                if (result.downgraded) downgraded++;
            } else {
                errors++;
            }
        });

        return {
            success: true,
            updated,
            upgraded,
            downgraded,
            errors,
        };
    } catch (error) {
        console.error("Error recalculating all memberships:", error);
        return {
            success: false,
            updated: 0,
            upgraded: 0,
            downgraded: 0,
            errors: 0,
        };
    }
}

/**
 * Get membership statistics
 */
export function getMembershipStats(): {
    basic: number;
    loyal: number;
    vip: number;
    total: number;
} {
    try {
        const users: User[] = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const customers = users.filter((u) => u.role === "customer");

        const stats = {
            basic: 0,
            loyal: 0,
            vip: 0,
            total: customers.length,
        };

        customers.forEach((customer) => {
            const level = customer.membershipLevel || "Cơ bản";
            if (level === "VIP") stats.vip++;
            else if (level === "Thân thiết") stats.loyal++;
            else stats.basic++;
        });

        return stats;
    } catch (error) {
        console.error("Error getting membership stats:", error);
        return { basic: 0, loyal: 0, vip: 0, total: 0 };
    }
}
