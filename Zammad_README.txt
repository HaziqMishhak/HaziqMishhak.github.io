# Zammad Mobile API - Complete Documentation

## 🔐 Authentication
```
Authorization: Token token={{zammad_token}}
Content-Type: application/json
```

## 📊 Variables (Built-in)
All variables are pre-configured in collection variables:

- base_url: https://janasyssupport.zammad.com
- zammad_token: 0wPNqFOUg_xVB81pGuhWhCCWB2UrdOTQAXPcw-lBcEclc1o72O4GsmP8edF3sMyA
- customer_email: customer@test.com (TEST ONLY - use real email in production)
- complaint_category: Safety
- vessel_voyage: MV-12345
- incident_datetime: 2025-10-13T14:30:00Z
- description: Test complaint description from mobile app

## 📚 STATE MANAGEMENT
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

## 📋 Complaint Categories
Use String format: "complaint_category": "Safety"

Available categories:
- Safety
- Welfare
- Payment
- Harassment
- Accommodation

## 🔗 API Endpoints

### 1. Create Ticket (Basic)
**POST** {{base_url}}/api/v1/tickets

**Payload:**
```json
{
  "title": "Complaint from {{customer_email}} - {{complaint_category}}",
  "group": "Users",
  "state": "new",
  "priority_id": 2,
  "customer_id": "guess:{{customer_email}}",
  "complaint_category": "{{complaint_category}}",
  "vessel_voyage": "{{vessel_voyage}}",
  "incident_datetime": "{{incident_datetime}}",
  "article": {
    "subject": "Complaint: {{complaint_category}}",
    "body": "{{description}}",
    "type": "note",
    "internal": false
  }
}
```

### 2. Create Ticket (With Attachment)
**POST** {{base_url}}/api/v1/tickets

**Payload:** Same as above + add to article:
```json
"attachments": [{
  "filename": "complaint_image.jpg",
  "data": "{{base64_image}}",
  "mime-type": "image/jpeg"
}]
```

### 3. Get Ticket by ID
**GET** {{base_url}}/api/v1/tickets/:id

Replace :id with actual ticket ID

### 4. Search User Tickets (Dashboard)
**GET** {{base_url}}/api/v1/tickets/search?query=customer.email:{{customer_email}}&limit=50&expand=true

**CRITICAL:** Always use expand=true parameter!

## ⚠️ IMPORTANT HIGHLIGHTS

### 1. Customer ID with "guess:" Prefix
**Format:** "customer_id": "guess:{email}"

**Why?** Auto-finds OR auto-creates user. The "guess:" prefix tells Zammad:
1. Search for existing user by email
2. If found: Link ticket to that user
3. If NOT found: Auto-create new user with that email
4. Returns success either way

This eliminates need to check if user exists first.

### 2. expand=true Parameter
**CRITICAL for dashboard:** Returns full objects with state string AND state_id number.
Without it: Only IDs returned
With it: Complete ticket data

### 3. Minimum Required Payload
```json
{
  "title": "REQUIRED",
  "group": "REQUIRED", // default value "Users"
  "customer_id": "REQUIRED",
  "article": {
    "body": "REQUIRED",
    "type": "REQUIRED",
    "internal": "REQUIRED"
  }
}
```

### 4. (Ticket) ID vs Number
- "id": 123 → For API calls
- "number": "100123" → **Display as #100123**

### 5. Title Construction
"title": "Complaint from {email} - {Complaint Category}"

Mandatory by Zammad. Auto-construct in mobile app.

**Why This Format?**
- title is MANDATORY by Zammad (cannot be empty)
- Consistent format for all complaints
- Easy to search by email or category
- Provides context at a glance

### 6. Test Email
customer@test.com = **DUMMY for testing only**
Production: Use real user email from app login session.

### 7. DATETIME FORMAT & EXAMPLES
**Required Format: ISO 8601 with Timezone**
Format: YYYY-MM-DDTHH:mm:ssZ
Example: "incident_datetime": "2025-10-15T14:30:00Z"

## 📝 Core Ticket Fields Reference

### Required Fields
| Field       | Type   | Value          | Notes                    |
|-------------|--------|----------------|--------------------------|
| title       | string | Auto-construct | Mandatory by Zammad      |
| group       | string | "Users"        | Mandatory by Zammad      |
| customer_id | string | "guess:email"  | Mandatory by Zammad      |

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

## 📎 Attachment Guidelines
- Optional (omit if no file)
- Max 20MB per file
- Base64 encoded
- One file only per ticket
- Supported formats: jpg, png, pdf, doc, etc.

## 🔄 Response Handling

### Success Response (Create Ticket)
- Status: 201 Created
- Use response.number for display (#81010)
- Use response.id for future API calls (11)

### Success Response (Search Tickets)
- Status: 200 OK
- Returns array of tickets
- Each ticket has both "state" and "state_id"
- Use expand=true to get complete data

## 📚 Official Documentation Links
- Main API: https://docs.zammad.org/en/latest/api/intro.html
- Tickets: https://docs.zammad.org/en/latest/api/ticket/index.html

## 🚀 Quick Start Examples

### Create Basic Complaint
```bash
curl -X POST "https://janasyssupport.zammad.com/api/v1/tickets" \
  -H "Authorization: Token token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complaint from user@example.com - Safety",
    "group": "Users",
    "state": "new",
    "priority_id": 2,
    "customer_id": "guess:user@example.com",
    "complaint_category": "Safety",
    "vessel_voyage": "MV-12345",
    "incident_datetime": "2025-10-15T14:30:00Z",
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
curl -X GET "https://janasyssupport.zammad.com/api/v1/tickets/search?query=customer.email:user@example.com&limit=50&expand=true" \
  -H "Authorization: Token token=YOUR_TOKEN"
```

---
**Version:** 1.0
**Updated:** October 14, 2025
**Created by:** System Engineer Documentation