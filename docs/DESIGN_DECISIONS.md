# Design Decisions and Trade-offs

This document explains the design decisions made during the refactoring of the booking creation system to use an external API.

## Key Design Decisions

### 1. Environment Variable Naming (NEXT_PUBLIC_API_URL)

**Decision**: Use `NEXT_PUBLIC_API_URL` instead of a server-only variable.

**Rationale**:
- The `NEXT_PUBLIC_` prefix makes the variable available to both server and client code
- Server Actions run on the server, but future enhancements may need client-side access
- Provides flexibility for future features without requiring environment variable changes

**Trade-off**: The API URL is exposed to client-side code, which is generally acceptable for public-facing APIs but may need reconsideration if the API contains sensitive endpoints.

**Alternative Considered**: Use separate variables (`API_URL` for server, `NEXT_PUBLIC_API_URL` for client) but deemed unnecessary for current requirements.

### 2. Stubbed Availability Checking

**Decision**: Stub `checkRealTimeAvailability` to always return available.

**Rationale**:
- Maintains backward compatibility with existing UI components
- Avoids mixing Prisma (local DB) calls with API calls
- The external API is expected to handle conflict detection during booking creation
- Simplifies the migration path

**Trade-off**: 
- UI may show slots as available even if they're taken
- Users only discover conflicts when attempting to book (better UX would prevent this)
- Temporary solution until API provides availability endpoint

**Impact Mitigation**:
- Clear error messages when booking fails due to conflicts
- API is responsible for preventing double bookings
- Comprehensive comments warn future developers

### 3. Hardcoded Temporary Values

**Decision**: Use named constants (TEMP_CUSTOMER_PHONE, DEFAULT_EMPLOYEE_NAME) with TODO comments.

**Rationale**:
- Makes temporary nature explicit and searchable
- Easier to find and replace when proper implementation is ready
- Centralizes magic values in one location
- Clear documentation of why these exist

**Trade-off**: Not a real solution, just a well-documented placeholder.

**Next Steps**:
- Add phone field to User model
- Update API to return employee information
- Remove constants when proper data is available

### 4. Error Handling Approach

**Decision**: Custom ApiError class with comprehensive type-safe error parsing.

**Rationale**:
- Provides consistent error handling across all API calls
- Type-safe approach with runtime checks
- Handles various error response formats (JSON, text, unexpected)
- Includes status codes for proper HTTP error handling

**Implementation**: Defensive parsing with fallbacks to prevent runtime crashes from unexpected API responses.

### 5. Production Environment Validation

**Decision**: Require NEXT_PUBLIC_API_URL in production, allow fallback in development.

**Rationale**:
- Prevents production deployments with missing configuration
- Fails fast with clear error message
- Allows local development without configuration
- Reduces risk of "works on my machine" issues

### 6. Minimal Changes Philosophy

**Decision**: Only refactor the booking creation flow, leave other Prisma code intact.

**Rationale**:
- Reduces risk of breaking unrelated functionality
- Allows incremental migration strategy
- Easier to review and test
- Other parts of the app still need local DB access

**Scope**: Only modified `createBooking` function and removed unused helpers that depended on Prisma.

## Architecture Patterns

### Service Layer Pattern

Created `app/_services/api.ts` as a centralized HTTP client:
- Single source of truth for API configuration
- Consistent error handling
- Easy to mock for testing
- Reusable across different actions

### Type Safety

Created `app/_types/api.ts` with interfaces matching backend:
- Compile-time type checking
- Better IDE autocomplete
- Self-documenting code
- Easier to catch breaking changes

### Data Mapping Layer

Kept mapping logic in the action layer:
- Clear separation of concerns
- Action understands both frontend and backend models
- Service layer remains generic and reusable
- Makes it easy to adjust mappings without touching API client

## Future Improvements

1. **Real Availability Checking**: Implement when API provides endpoint
2. **Phone Number Handling**: Add to User model or create separate customer profile
3. **Employee Details**: Update API to return employee information in booking response
4. **Multi-tenancy**: Add barbershopId to API calls when backend supports it
5. **Client-Side API Calls**: Consider separating server-only and client-accessible API configurations
6. **Response Caching**: Add caching layer for frequently accessed data
7. **Retry Logic**: Implement exponential backoff for transient failures
8. **Request Tracing**: Add correlation IDs for debugging distributed systems

## Testing Strategy

### Current State
- TypeScript compilation validates type safety
- ESLint ensures code quality
- Manual testing required for end-to-end flow

### Recommended Additions
1. Unit tests for API service layer
2. Integration tests with mocked API responses
3. E2E tests with real API (staging environment)
4. Error scenario testing (network failures, API errors, etc.)

## Migration Path

For other actions that need API integration:

1. Create type definitions in `app/_types/api.ts`
2. Add endpoint function to `app/_services/api.ts`
3. Update action to use API service
4. Remove Prisma dependency
5. Update tests
6. Document any temporary compromises

This pattern can be applied to other features as the system migrates to microservices architecture.
