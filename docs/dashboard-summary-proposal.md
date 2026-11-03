# Dashboard Summary API Proposal

**Status: Proposal approved; backend implementation remains outstanding.**

This document specifies a possible read-only dashboard endpoint. It does not
implement or authorize any backend changes.

## Endpoint

```http
GET /api/v1/dashboard/summary
Accept: application/json
Authorization: Bearer <token>
```

The endpoint is authenticated and returns the existing Laravel resource
envelope. It accepts no query parameters in the initial version.

## Proposed response

```ts
type DashboardSummaryResponse = {
  data: {
    attendance_rate: number | null;
    active_courses: number;
    pending_requests: number;
    document_count: number;
    recent_activity: DashboardActivity[];
    upcoming_schedule: DashboardSchedule[];
  };
};

type DashboardActivity = {
  id: number | string;
  type: string;
  description: string;
  occurred_at: string;
};

type DashboardSchedule = {
  id: number | string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
};
```

## Field definitions

- `attendance_rate`: percentage from 0 to 100 over the preceding 30 days,
  calculated from recorded attendance. Return `null` when attendance records
  or a valid denominator are unavailable; do not estimate from grades.
- `active_courses`: number of distinct academic groups in which the current
  student has an active enrollment. For authorized academic managers, count
  distinct groups with at least one active enrollment.
- `pending_requests`: number of requests in `Pending` status visible to the
  current user under the same ownership and authorization rules as the
  requests API.
- `document_count`: number of documents visible to the current user under the
  same authorization rules as the documents API.
- `recent_activity`: up to five persisted activity events visible to the
  current user, newest first. Return an empty array if an activity source is
  not available; do not synthesize activity.
- `upcoming_schedule`: up to five future schedule entries visible to the
  current user, ordered by start time. Return an empty array if a schedule
  source is not available; do not synthesize events.

All counts and list entries must use the authenticated user's visibility
scope. The response must not include records the user could not retrieve from
the corresponding resource APIs.

## Current backend gaps

The current backend has no attendance, persisted activity, or schedule data
source. These fields cannot be populated accurately until those sources are
approved and available. In the meantime, attendance must be `null` and the
activity and schedule fields must be empty arrays; no dashboard values should
be fabricated. The API contract, data sources, authorization, and aggregation
strategy require review before implementation.
