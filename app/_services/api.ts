import {
  ApiErrorResponse,
  AppointmentResponse,
  CreateAppointmentInput,
} from "../_types/api"

/**
 * Base URL for the external API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

/**
 * Generic API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: ApiErrorResponse,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    // Parse response body
    let data: unknown
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorResponse = data as ApiErrorResponse
      throw new ApiError(
        errorResponse.message || errorResponse.error || "API request failed",
        response.status,
        errorResponse,
      )
    }

    return data as T
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError("Network error: Unable to connect to API server")
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
    )
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentResponse> {
  return apiFetch<AppointmentResponse>("/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

/**
 * Get appointment by ID
 */
export async function getAppointment(id: string): Promise<AppointmentResponse> {
  return apiFetch<AppointmentResponse>(`/appointments/${id}`, {
    method: "GET",
  })
}

/**
 * List appointments with optional filters
 */
export async function listAppointments(params?: {
  startDate?: string
  endDate?: string
  status?: string
}): Promise<AppointmentResponse[]> {
  const queryParams = new URLSearchParams()
  if (params?.startDate) queryParams.append("startDate", params.startDate)
  if (params?.endDate) queryParams.append("endDate", params.endDate)
  if (params?.status) queryParams.append("status", params.status)

  const query = queryParams.toString()
  const endpoint = query ? `/appointments?${query}` : "/appointments"

  return apiFetch<AppointmentResponse[]>(endpoint, {
    method: "GET",
  })
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  id: string,
): Promise<AppointmentResponse> {
  return apiFetch<AppointmentResponse>(`/appointments/${id}/cancel`, {
    method: "PATCH",
  })
}
