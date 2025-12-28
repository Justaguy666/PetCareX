/**
 * Promotion Engine - PetCareX System
 * Handles automatic promotion application according to ERD business rules
 */

import {
    ServiceInstance,
    GlobalPromotion,
    BranchPromotion,
    ServiceInvoice,
    User,
    MembershipLevel,
    ServiceTypeId
} from "@shared/types";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface AppliedPromotion {
    promotionId: string;
    description: string;
    discountRate: number;
    discountAmount: number;
}

export interface PromotionCalculationResult {
    basePrice: number;
    applicablePromotions: AppliedPromotion[];
    totalDiscountRate: number;
    totalDiscountAmount: number;
    finalPrice: number;
}

export interface InvoicePromotionSummary {
    subtotal: number;
    totalDiscount: number;
    totalDiscountRate: number;
    finalAmount: number;
    promotionBreakdown: {
        serviceInstanceId: string;
        serviceName: string;
        basePrice: number;
        discountAmount: number;
        finalPrice: number;
        appliedPromotions: AppliedPromotion[];
    }[];
}

// ============================================================
// CORE PROMOTION FILTERING LOGIC
// ============================================================

/**
 * Get applicable promotions for a service instance
 * Follows ERD rules: date range, membership, service type, branch
 */
export function getApplicablePromotions(
    serviceInstance: ServiceInstance,
    customer: User,
    branchId: string,
    date: Date = new Date()
): (GlobalPromotion | BranchPromotion)[] {
    // Load all promotions from localStorage
    const globalPromotions: GlobalPromotion[] = JSON.parse(
        localStorage.getItem("petcare_global_promotions") || "[]"
    );

    const branchPromotions: BranchPromotion[] = JSON.parse(
        localStorage.getItem("petcare_branch_promotions") || "[]"
    );

    const applicable: (GlobalPromotion | BranchPromotion)[] = [];
    const customerLevel = customer.membershipLevel || "Cơ bản";

    // Helper: Check if customer is eligible for promotion target audience
    const isEligibleForAudience = (targetAudience: string): boolean => {
        if (targetAudience === "All") return true;
        if (targetAudience === "Loyal+") {
            return customerLevel === "Thân thiết" || customerLevel === "VIP";
        }
        if (targetAudience === "VIP+") {
            return customerLevel === "VIP";
        }
        return false;
    };

    // Helper: Check if promotion is active on given date
    const isActiveOnDate = (promo: GlobalPromotion | BranchPromotion): boolean => {
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        // Promotion expired today -> Do NOT apply (Edge Case 1)
        // Use start of day for end date to exclude if expired
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);

        return date >= start && date <= endOfDay;
    };

    // Check Global Promotions
    globalPromotions.forEach((promo) => {
        if (!promo.isActive) return;
        if (!isActiveOnDate(promo)) return;
        if (!isEligibleForAudience(promo.targetAudience)) return;
        if (!promo.applicableServiceTypes.includes(serviceInstance.serviceType)) return;

        applicable.push(promo);
    });

    // Check Branch Promotions
    branchPromotions.forEach((promo) => {
        if (!promo.isActive) return;
        if (promo.branchId !== branchId) return; // Must match branch
        if (!isActiveOnDate(promo)) return;
        if (!isEligibleForAudience(promo.targetAudience)) return;
        if (!promo.applicableServiceTypes.includes(serviceInstance.serviceType)) return;

        applicable.push(promo);
    });

    return applicable;
}

// ============================================================
// DISCOUNT CALCULATION
// ============================================================

/**
 * Apply promotions to service instance and calculate final price
 * Handles stacking with 50% cap
 */
export function applyPromotionsToServiceInstance(
    serviceInstance: ServiceInstance,
    promotions: (GlobalPromotion | BranchPromotion)[]
): PromotionCalculationResult {
    // Calculate base price (service + vaccines + package)
    const basePrice =
        serviceInstance.basePrice +
        (serviceInstance.vaccineCost || 0) +
        (serviceInstance.packageCost || 0);

    // Edge Case 3: basePrice = 0, skip discount
    if (basePrice === 0) {
        return {
            basePrice: 0,
            applicablePromotions: [],
            totalDiscountRate: 0,
            totalDiscountAmount: 0,
            finalPrice: 0,
        };
    }

    // Calculate total discount rate (sum all)
    let totalDiscountRate = promotions.reduce(
        (sum, promo) => sum + promo.discountRate,
        0
    );

    // Edge Case 4: Cap at 50%
    if (totalDiscountRate > 50) {
        totalDiscountRate = 50;
    }

    // Calculate discount amount
    const totalDiscountAmount = Math.floor(basePrice * (totalDiscountRate / 100));
    const finalPrice = basePrice - totalDiscountAmount;

    // Build applied promotions list
    const applicablePromotions: AppliedPromotion[] = promotions.map((promo) => {
        const individualDiscountAmount = Math.floor(basePrice * (promo.discountRate / 100));
        return {
            promotionId: promo.id,
            description: promo.description,
            discountRate: promo.discountRate,
            discountAmount: individualDiscountAmount,
        };
    });

    return {
        basePrice,
        applicablePromotions,
        totalDiscountRate,
        totalDiscountAmount,
        finalPrice,
    };
}

// ============================================================
// INVOICE CALCULATION
// ============================================================

/**
 * Calculate invoice totals with promotion breakdown
 */
export function calculateInvoiceTotals(
    serviceInstances: ServiceInstance[],
    customer: User,
    branchId: string
): InvoicePromotionSummary {
    let subtotal = 0;
    let totalDiscount = 0;
    const promotionBreakdown: InvoicePromotionSummary["promotionBreakdown"] = [];

    serviceInstances.forEach((serviceInstance) => {
        // Get applicable promotions
        const promotions = getApplicablePromotions(
            serviceInstance,
            customer,
            branchId
        );

        // Calculate with promotions
        const calculation = applyPromotionsToServiceInstance(
            serviceInstance,
            promotions
        );

        subtotal += calculation.basePrice;
        totalDiscount += calculation.totalDiscountAmount;

        // Store breakdown
        promotionBreakdown.push({
            serviceInstanceId: serviceInstance.id,
            serviceName: getServiceTypeName(serviceInstance.serviceType),
            basePrice: calculation.basePrice,
            discountAmount: calculation.totalDiscountAmount,
            finalPrice: calculation.finalPrice,
            appliedPromotions: calculation.applicablePromotions,
        });
    });

    const finalAmount = subtotal - totalDiscount;
    const totalDiscountRate = subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0;

    return {
        subtotal,
        totalDiscount,
        totalDiscountRate,
        finalAmount,
        promotionBreakdown,
    };
}

/**
 * Update invoice with promotion data
 * Call this every time services are added/removed/finalized
 */
export function updateInvoiceWithPromotions(
    invoice: Partial<ServiceInvoice>,
    serviceInstances: ServiceInstance[],
    customer: User,
    branchId: string
): ServiceInvoice {
    const totals = calculateInvoiceTotals(serviceInstances, customer, branchId);

    // Collect all unique promotion IDs
    const allPromotionIds = new Set<string>();
    totals.promotionBreakdown.forEach((item) => {
        item.appliedPromotions.forEach((promo) => {
            allPromotionIds.add(promo.promotionId);
        });
    });

    // Calculate loyalty points (1 point per 50K VND of final amount)
    const loyaltyPointsEarned = Math.floor(totals.finalAmount / 50000);

    return {
        ...invoice,
        subtotal: totals.subtotal,
        discount: totals.totalDiscount,
        discountRate: totals.totalDiscountRate,
        total: totals.finalAmount,
        loyaltyPointsEarned,
        appliedPromotions: Array.from(allPromotionIds),
    } as ServiceInvoice;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get service type display name
 */
export function getServiceTypeName(serviceTypeId: ServiceTypeId): string {
    const names: Record<ServiceTypeId, string> = {
        "purchase": "Product Purchase",
        "single-vaccine": "Single Dose Vaccine",
        "vaccine-package": "Vaccine Package",
        "medical-exam": "Medical Examination",
    };
    return names[serviceTypeId] || serviceTypeId;
}

/**
 * Get promotion status based on dates
 */
export function getPromotionStatus(
    promotion: GlobalPromotion | BranchPromotion
): "active" | "upcoming" | "expired" {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) return "upcoming";
    if (now > end) return "expired";
    return "active";
}

/**
 * Format promotion for display
 */
export function formatPromotionForDisplay(
    promotion: GlobalPromotion | BranchPromotion
): string {
    return `${promotion.description} (-${promotion.discountRate}%)`;
}

/**
 * Get all promotions with status
 */
export function getAllPromotionsWithStatus(): Array<{
    promotion: GlobalPromotion | BranchPromotion;
    status: "active" | "upcoming" | "expired";
    type: "global" | "branch";
}> {
    const globalPromotions: GlobalPromotion[] = JSON.parse(
        localStorage.getItem("petcare_global_promotions") || "[]"
    );

    const branchPromotions: BranchPromotion[] = JSON.parse(
        localStorage.getItem("petcare_branch_promotions") || "[]"
    );

    const result: Array<{
        promotion: GlobalPromotion | BranchPromotion;
        status: "active" | "upcoming" | "expired";
        type: "global" | "branch";
    }> = [];

    globalPromotions.forEach((promo) => {
        result.push({
            promotion: promo,
            status: getPromotionStatus(promo),
            type: "global",
        });
    });

    branchPromotions.forEach((promo) => {
        result.push({
            promotion: promo,
            status: getPromotionStatus(promo),
            type: "branch",
        });
    });

    return result;
}

/**
 * Validate promotion before creation
 */
export function validatePromotion(
    promotion: Partial<GlobalPromotion | BranchPromotion>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Edge Case 5: Dates must be set
    if (!promotion.startDate || !promotion.endDate) {
        errors.push("Start date and end date are required");
    }

    if (promotion.startDate && promotion.endDate) {
        const start = new Date(promotion.startDate);
        const end = new Date(promotion.endDate);
        if (start >= end) {
            errors.push("End date must be after start date");
        }
    }

    if (!promotion.description || promotion.description.trim().length === 0) {
        errors.push("Description is required");
    }

    if (promotion.description && promotion.description.length > 500) {
        errors.push("Description must be 500 characters or less");
    }

    if (
        promotion.discountRate === undefined ||
        promotion.discountRate < 5 ||
        promotion.discountRate > 15
    ) {
        errors.push("Discount rate must be between 5% and 15%");
    }

    if (
        !promotion.applicableServiceTypes ||
        promotion.applicableServiceTypes.length === 0
    ) {
        errors.push("At least one service type must be selected");
    }

    if (!promotion.targetAudience) {
        errors.push("Target audience is required");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
