/**
 * API Utility Functions
 * Centralized helpers for API request/response transformations
 */

/**
 * Status mapping: Frontend English → Backend Vietnamese
 */
export const STATUS_MAP_TO_BACKEND: Record<string, string> = {
    'Completed': 'Hoàn thành',
    'Pending': 'Đang chờ xác nhận',
    'Scheduled': 'Đang chờ xác nhận',
    'Confirmed': 'Đã xác nhận',
    'In Progress': 'Đang xử lý',
    'Cancelled': 'Hủy bỏ',
    'Checked-in': 'Đã xác nhận',
    'checked-in': 'Đã xác nhận',
};

/**
 * Status mapping: Backend Vietnamese → Frontend English
 */
export const STATUS_MAP_TO_FRONTEND: Record<string, string> = {
    'Hoàn thành': 'Completed',
    'Đang chờ xác nhận': 'Pending',
    'Đã xác nhận': 'Confirmed',
    'Đang xử lý': 'In Progress',
    'Hủy bỏ': 'Cancelled',
};

/**
 * Convert frontend status to backend status
 */
export function toBackendStatus(frontendStatus: string): string {
    return STATUS_MAP_TO_BACKEND[frontendStatus] || frontendStatus;
}

/**
 * Convert backend status to frontend status
 */
export function toFrontendStatus(backendStatus: string): string {
    return STATUS_MAP_TO_FRONTEND[backendStatus] || backendStatus;
}

/**
 * Convert date and time strings to ISO TIMESTAMPTZ string
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:mm format
 * @returns ISO 8601 string for backend
 */
export function combineDateTime(date: string, time: string): string {
    if (!date || !time) {
        throw new Error('Date and time are required');
    }
    // Create local date-time, then convert to ISO string
    const localDateTime = new Date(`${date}T${time}:00`);
    return localDateTime.toISOString();
}

/**
 * Ensure numeric ID (convert string to number if needed)
 */
export function toNumericId(id: string | number | undefined): number | undefined {
    if (id === undefined || id === null || id === '') return undefined;
    const num = typeof id === 'string' ? Number(id) : id;
    return isNaN(num) ? undefined : num;
}

/**
 * Normalize appointment creation payload for backend
 */
export interface AppointmentCreatePayload {
    customer_id: number;
    pet_id: number;
    branch_id: number;
    doctor_id: number;
    appointment_time: string;
}

export function normalizeAppointmentPayload(data: {
    customerId?: string | number;
    customer_id?: string | number;
    petId?: string | number;
    pet_id?: string | number;
    branchId?: string | number;
    branch_id?: string | number;
    doctorId?: string | number;
    doctor_id?: string | number;
    veterinarianId?: string | number;
    appointmentDate?: string;
    appointmentTime?: string;
    appointment_time?: string;
    date?: string;
    time?: string;
}): AppointmentCreatePayload | null {
    // Extract IDs (support both camelCase and snake_case)
    const customerId = toNumericId(data.customerId || data.customer_id);
    const petId = toNumericId(data.petId || data.pet_id);
    const branchId = toNumericId(data.branchId || data.branch_id);
    const doctorId = toNumericId(data.doctorId || data.doctor_id || data.veterinarianId);

    // Extract date/time (support multiple formats)
    let appointmentTime: string;
    if (data.appointment_time) {
        appointmentTime = data.appointment_time;
    } else if (data.appointmentDate && data.appointmentTime) {
        appointmentTime = combineDateTime(data.appointmentDate, data.appointmentTime);
    } else if (data.date && data.time) {
        appointmentTime = combineDateTime(data.date, data.time);
    } else {
        return null; // Missing required fields
    }

    // Validate all required fields
    if (!customerId || !petId || !branchId || !doctorId || !appointmentTime) {
        return null;
    }

    return {
        customer_id: customerId,
        pet_id: petId,
        branch_id: branchId,
        doctor_id: doctorId,
        appointment_time: appointmentTime,
    };
}

