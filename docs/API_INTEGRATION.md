# API Integration - AgendamentoAPI

This document describes the integration with the external AgendamentoAPI for managing appointments.

## Overview

The booking creation functionality has been refactored to use an external REST API instead of direct database access via Prisma.

## Architecture

### Service Layer (`app/_services/api.ts`)

Centralizes all HTTP communication with the external API:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3001`)
- **Error Handling**: Custom `ApiError` class for consistent error handling
- **Generic Fetch Wrapper**: `apiFetch()` function handles all HTTP requests with proper error handling

### Type Definitions (`app/_types/api.ts`)

TypeScript interfaces that mirror the external API contracts:

- `CreateAppointmentInput`: Payload for creating appointments
- `AppointmentResponse`: Response structure from the API
- `AppointmentStatus`: Enum for appointment statuses
- `ApiErrorResponse`: Standard error response structure

## Data Mapping

The `createBooking` action maps frontend data to the backend API format:

| Frontend                | Backend API       | Notes                                      |
| ----------------------- | ----------------- | ------------------------------------------ |
| `User.name`             | `customerName`    | Defaults to "Cliente" if not available     |
| N/A                     | `customerPhone`   | Hardcoded to "+5500000000000" for now      |
| `Service.id`            | `serviceId`       | Direct mapping                             |
| `date` (Date object)    | `startTime`       | Converted to ISO 8601 string               |
| `params.employeeId`     | N/A               | Not sent to API (used for UI logic only)   |
| `params.barbershopId`   | N/A               | Not sent to API (used for revalidation)    |

## API Endpoints

### POST /appointments

Creates a new appointment.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "+5500000000000",
  "serviceId": "service-uuid",
  "startTime": "2024-01-16T10:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "appointment-uuid",
  "customerName": "John Doe",
  "customerPhone": "+5500000000000",
  "serviceId": "service-uuid",
  "startTime": "2024-01-16T10:00:00.000Z",
  "status": "SCHEDULED",
  "createdAt": "2024-01-16T05:00:00.000Z",
  "updatedAt": "2024-01-16T05:00:00.000Z"
}
```

### GET /appointments/:id

Retrieves a specific appointment by ID.

### GET /appointments

Lists appointments with optional filters (startDate, endDate, status).

### PATCH /appointments/:id/cancel

Cancels an appointment.

## Migration Notes

### What Changed

1. **`createBooking` function**: Now calls `createAppointment()` from the API service instead of using Prisma
2. **No more Prisma dependency**: The main booking creation flow no longer depends on `app/_lib/prisma.ts`
3. **Simplified validation**: The external API handles conflict checking and validation

### Backward Compatibility

- **`checkRealTimeAvailability`**: Stubbed to return `isAvailable: true` for backward compatibility with the UI
  - **TODO**: Implement proper availability checking when the API provides an endpoint for it
  - Currently logs a deprecation warning

### What Didn't Change

- The `CreateBookingParams` interface remains the same
- The return value structure is compatible with existing UI components
- Path revalidation logic is preserved

## Environment Setup

Add to your `.env.local`:

```bash
# External API URL for AgendamentoAPI
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Known Limitations

1. **Phone Number**: Currently hardcoded as the User schema doesn't include a phone field
   - **TODO**: Add phone field to User model or accept it as a parameter
   
2. **Real-time Availability**: The `checkRealTimeAvailability` function is stubbed
   - **TODO**: Implement when API provides availability endpoint
   
3. **Employee Information**: API doesn't return employee details in the response
   - Current workaround: Return simplified employee object with hardcoded name "Barbeiro"

4. **Multi-tenancy**: No barbershopId is sent to the API
   - The API should be multi-tenant aware or filter based on authentication

## Testing

To test the integration:

1. Ensure the AgendamentoAPI is running on the configured URL
2. Set `NEXT_PUBLIC_API_URL` in `.env.local`
3. Create a booking through the UI
4. Check the console logs for API calls and responses

## Error Handling

The API service provides comprehensive error handling:

- Network errors: "Network error: Unable to connect to API server"
- HTTP errors: Includes status code and API error message
- Unknown errors: Generic error message with original error details

Errors are propagated to the UI where they are displayed via toast notifications.
