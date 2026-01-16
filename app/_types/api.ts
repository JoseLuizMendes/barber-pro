// Types for AgendamentoAPI integration

/**
 * Input for creating a new appointment
 */
export interface CreateAppointmentInput {
  customerName: string
  customerPhone: string
  serviceId: string
  startTime: string // ISO 8601 date string
}

/**
 * Response from the appointments API
 */
export interface AppointmentResponse {
  id: string
  customerName: string
  customerPhone: string
  serviceId: string
  startTime: string // ISO 8601 date string
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

/**
 * Appointment status enum
 */
export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  error: string
  message?: string
  statusCode?: number
}
