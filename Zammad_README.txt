# Zammad API - Mobile App Integration

## Authentication
```
Authorization: Token token={{zammad_token}}
Content-Type: application/json
```

## Variables (Built-in)
All variables are pre-configured in collection variables:

- base_url: https://janasyssupport.zammad.com
- customer_email: customer@test.com (TEST ONLY - use real email in production)
- seafarernumber: 20251234
- seafarername: John Doe
- complaint_category: Safety
- vessel_voyage: MV-12345
- incident_datetime: 2025-10-13T14:30:00Z
- description: Test complaint description from mobile app
- base64_image: Sample base64 image for testing

## DATA FLOW

Complete integration flow:
1. Seafarer fills mobile app complaint form
2. Mobile app sends data to backend API
3. Backend processes and transforms data
4. Backend submits ticket to Zammad API
5. Zammad auto-creates user if needed
6. Ticket created with custom fields
7. Dashboard searches by seafarer number
8. Ticket details retrieved by ID

## STATE MANAGEMENT
Zammad returns BOTH:
- "state_id": 1 (number - for logic)
- "state": "new" (string - for display)

| state_id | state     | Display   |
|----------|-----------|-----------|
| 1        | new       | New/Open  |
| 2        | open      | Open      |
| 4        | closed    | Closed    |
| 7        | in_review | In Review |
| 8        | pending   | Pending   |

## Complaint Categories
Use String format: "complaint_category": "Safety"

Available categories:
- Safety
- Welfare
- Payment
- Harassment
- Accommodation

## FIELD MAPPING

### Mobile UI → Zammad API

| Mobile UI Field      | Zammad Field           | Required | Transformation                    |
|---------------------|------------------------|----------|-----------------------------------|
| Brief description   | article.body (part 1)  | YES      | Combine with detailed complaint   |
| Complaint category  | complaint_category     | YES      | Direct mapping                    |
| Date of incident    | incident_datetime      | YES      | Combine with time → ISO format    |
| Time of incident    | incident_datetime      | YES      | Format: {date}T{time}:00Z        |
| Vessel name         | vessel_voyage          | YES      | Direct mapping                    |
| Detailed complaint  | article.body (part 2)  | YES      | Append to brief description       |
| Attachment          | article.attachments    | Optional | Base64 encode if uploaded         |

### Missing from UI (Backend Processing)

| Field          | Zammad Field    | Required | Source        | Default Logic                    |
|----------------|-----------------|----------|---------------|----------------------------------|
| Seafarer Name  | seafarername    | YES      | Backend logic | From user context                |
| Seafarer Number| seafarernumber  | YES      | Backend logic | From user context                |
| Email          | customer_id     | YES      | Backend logic | {seafarernumber}@noemail.com     |

## API Endpoints

### 1. Create Ticket (Basic)
POST {{base_url}}/api/v1/tickets

Payload:
```json
{
  "title": "Complaint from {{seafarername}} - {{complaint_category}}",
  "group": "Users",
  "state": "new",
  "priority_id": 2,
  "customer_id": "guess:{{customer_email}}",
  "complaint_category": "{{complaint_category}}",
  "vessel_voyage": "{{vessel_voyage}}",
  "incident_datetime": "{{incident_datetime}}",
  "seafarernumber": "{{seafarernumber}}",
  "seafarername": "{{seafarername}}",
  "article": {
    "subject": "Complaint: {{complaint_category}}",
    "body": "{{description}}",
    "type": "note",
    "internal": false
  }
}
```

### 2. Create Ticket (With Attachment)
POST {{base_url}}/api/v1/tickets

Payload: Same as above + add to article:
```json
"attachments": [{
  "filename": "complaint_image.jpg",
  "data": "{{base64_image}}",
  "mime-type": "image/jpeg"
}]
```

### 3. Get Ticket by ID
GET {{base_url}}/api/v1/tickets/:id

Replace :id with actual ticket ID

### 4. Search User Tickets (Dashboard)
GET {{base_url}}/api/v1/tickets/search?query=seafarernumber:{{seafarernumber}}&limit=50&expand=true

CRITICAL: Always use expand=true parameter!
CRITICAL: Search by seafarernumber, NOT email!

## IMPORTANT HIGHLIGHTS

### 1. Customer ID with "guess:" Prefix & Email Handling

Format: "customer_id": "guess:{email}"

Backend Email Logic:
1. If user provides email → Use real email: "guess:user@example.com"
2. If no email provided → Generate fake: "guess:{seafarernumber}@noemail.com"

Examples:
- With email: "customer_id": "guess:john.doe@company.com"
- Without email: "customer_id": "guess:20251234@noemail.com"

Why use "guess:" prefix? Auto-finds OR auto-creates user:

1. Search for existing user by email
2. If found: Link ticket to that user
3. If NOT found: Auto-create new user with that email
4. Returns success either way

This eliminates the need to:
- Check if user exists first
- Make separate API call to create user
- Handle user creation errors

Mobile App Implementation:
- Email field can be optional in mobile UI
- Backend handles the conditional logic
- Both scenarios work seamlessly with Zammad

### 2. expand=true Parameter

CRITICAL for dashboard: Returns full objects with state string AND state_id number.

Without it: Only IDs returned
With it: Complete ticket data

### 3. Minimum Required Payload

```json
{
  "title": "REQUIRED",
  "group": "REQUIRED",
  "customer_id": "REQUIRED",
  "seafarernumber": "REQUIRED",
  "seafarername": "REQUIRED",
  "article": {
    "body": "REQUIRED",
    "type": "REQUIRED",
    "internal": "REQUIRED"
  }
}
```

### 4. (Ticket) ID vs Number

- "id": 123 → For API calls
- "number": "100123" → Display as #100123

### 5. Title Construction

"title": "Complaint from {seafarername} - {complaint_category}"

Suggested format. You can use any string that makes sense for mobile app interface.

### 6. Search Query Format

"query": "seafarernumber:{{seafarernumber}}"

Dashboard: Use seafarernumber to find user's tickets, NOT email.

### 7. Text Field Combination

Mobile sends: Brief description + Detailed complaint
Backend combines: "{brief}\n\n{detailed}" → article.body

### 8. DATETIME FORMAT

Required Format: ISO 8601 with Timezone
Format: YYYY-MM-DDTHH:mm:ssZ
Transform To: "incident_datetime": "2025-10-15T14:30:00Z"

### 9. Backend Processing Requirements

User Context: Backend MUST extract from authenticated session:
- seafarernumber
- seafarername
- email (or generate fake)

Missing Email Logic: If no email → {seafarernumber}@noemail.com

## Core Ticket Fields Reference

### Required Fields
| Field       | Type   | Value          | Notes                    |
|-------------|--------|----------------|--------------------------|
| title       | string | Auto-construct | Mandatory by Zammad      |
| group       | string | "Users"        | Mandatory by Zammad      |
| customer_id | string | "guess:email"  | Mandatory by Zammad      |
| seafarernumber | string | User ID     | Custom field - user ID   |
| seafarername   | string | User name   | Custom field - display   |

### Article Fields (Nested in article object)
| Field            | Required | Type    | Value   | Notes                   |
|------------------|----------|---------|---------|-------------------------|
| article.body     | YES      | string  | Content | Mandatory - main content|
| article.type     | YES      | string  | "note"  | Mandatory - fixed value |
| article.internal | YES      | boolean | false   | Mandatory - visibility  |
| article.subject  | No       | string  | Title   | Optional but recommended|

### Optional Fields We Use
| Field         | Type   | Default | Our Value | Notes                    |
|---------------|--------|---------|-----------|--------------------------|
| state         | string | "new"   | "new"     | Optional but we include  |
| priority_id   | number | 2       | 2         | Optional but we include  |

### Custom Fields
| Field                | Type     | Example          | Notes                |
|---------------------|----------|------------------|----------------------|
| complaint_category  | string   | "Safety"         | Our custom field     |
| vessel_voyage       | string   | "MV-12345"       | Our custom field     |
| incident_datetime   | datetime | "2025-10-15..."  | Our custom field     |
| seafarernumber      | string   | "20251234"       | Our custom field     |
| seafarername        | string   | "John Doe"       | Our custom field     |

## Attachment Guidelines
- Optional (omit if no file)
- Max 20MB per file
- Base64 encoded
- One file only per ticket
- Supported formats: jpg, png, pdf, doc, etc.

## Response Handling

### Success Response (Create Ticket)
- Status: 201 Created
- Use response.number for display (#81010)
- Use response.id for future API calls (11)

### Success Response (Search Tickets)
- Status: 200 OK
- Returns array of tickets
- Each ticket has both "state" and "state_id"
- Use expand=true to get complete data

## Backend Processing Logic

### Ticket Creation Flow
1. Receive mobile app POST request with form data
2. Extract user context (seafarernumber, seafarername, email) from authenticated session
3. Handle missing email: Generate {seafarernumber}@noemail.com if no email provided
4. Combine text fields: Merge brief + detailed descriptions with line break
5. Format datetime: Combine date + time inputs → ISO 8601 format
6. Process attachment: Convert uploaded file to base64 if present
7. Generate title: Auto-construct from name + category
8. Submit to Zammad: POST to /api/v1/tickets
9. Return success response with ticket number to mobile app

### Dashboard Flow
1. Receive mobile app GET request for user tickets
2. Extract seafarernumber from authenticated session
3. Search Zammad: GET /api/v1/tickets/search?query=seafarernumber:{number}&expand=true
4. Format response data for mobile display
5. Return ticket list with: id, number, title, state, created_at

### Ticket Detail Flow
1. Receive mobile app GET request for specific ticket ID
2. Fetch from Zammad: GET /api/v1/tickets/{id}
3. Extract ticket details, articles, and state information
4. Format response for mobile display
5. Return complete ticket conversation thread

## Search Query Examples

| Search Type | Query Format | Example |
|-------------|--------------|---------|
| By Seafarer | seafarernumber:20251234 | Find all tickets for user |
| By Category | complaint_category:Safety | Find safety complaints |
| By Vessel   | vessel_voyage:MV-12345 | Find vessel-specific tickets |
| By State    | state:new | Find open tickets |
| Combined    | seafarernumber:20251234 AND state:new | User's open tickets |

## Official Documentation Links
- Main API: https://docs.zammad.org/en/latest/api/intro.html
- Tickets: https://docs.zammad.org/en/latest/api/ticket/index.html

## Quick Start Examples

### Create Basic Complaint
```bash
curl -X POST "https://janasyssupport.zammad.com/api/v1/tickets" \
  -H "Authorization: Token token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complaint from John Doe - Safety",
    "group": "Users",
    "state": "new",
    "priority_id": 2,
    "customer_id": "guess:20251234@noemail.com",
    "complaint_category": "Safety",
    "vessel_voyage": "MV-12345",
    "incident_datetime": "2025-10-15T14:30:00Z",
    "seafarernumber": "20251234",
    "seafarername": "John Doe",
    "article": {
      "subject": "Complaint: Safety",
      "body": "Description of safety issue...",
      "type": "note",
      "internal": false
    }
  }'
```

### Get User's Tickets
```bash
curl -X GET "https://janasyssupport.zammad.com/api/v1/tickets/search?query=seafarernumber:20251234&limit=50&expand=true" \
  -H "Authorization: Token token=YOUR_TOKEN"
```

### Get Specific Ticket
```bash
curl -X GET "https://janasyssupport.zammad.com/api/v1/tickets/123" \
  -H "Authorization: Token token=YOUR_TOKEN"
```

## Error Handling

### Common Scenarios
1. Missing required fields: Return 400 with field validation errors
2. Invalid seafarer number: Return 401 unauthorized
3. File too large: Return 413 payload too large
4. Zammad API errors: Return 502 bad gateway with error details
5. Network timeouts: Return 504 gateway timeout

### Best Practices
- Always validate input data before sending to Zammad
- Implement retry logic for network failures
- Log all API interactions for debugging
- Provide meaningful error messages to mobile app

---
Version: 2.0
Updated: October 17, 2025
Maintainer: Development Team
