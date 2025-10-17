# SDPX Seafarer API - Complete Documentation

## API Information
Version: 1.2
Environment: Test/Development
Base URL: https://webapp.mikazadrg.com.my/api/v1

## Field Naming Convention - UPDATED
All field names now use camelCase convention:
- First word lowercase
- Subsequent words capitalized
- Example: seafarerNumber, cardIssuedDate, nextOfKinName

## Test Data
- 200708002327 - Complete profile with certificates and photos
- 5555 - Alternative test dataset
- 201542003713 - Alternative test dataset

## API Endpoints

### 1. Seafarer Profile
GET /seafarer/{seafarerNumber}

Retrieves complete seafarer profile including personal information, identification card details, and next of kin.

Response Fields (camelCase):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| documentType | String | Yes | Document type |
| seafarerNumber | String | Yes | Unique seafarer ID |
| seafarerName | String | Yes | Full name (UPPERCASE) |
| nric | String | No | Malaysian IC number |
| address1 | String | No | Primary address line |
| address2 | String | No | Secondary address line |
| address3 | String | No | Tertiary address line |
| postcode | String | No | Postal code |
| city | String | No | City name |
| state | String | No | State (Malay) |
| cardIssuedDate | String | No | Card issue date (YYYY-MM-DD) |
| issuedPortName | String | No | Issuing port office |
| cardExpiryDate | String | No | Card expiry date (YYYY-MM-DD) |
| passportNumber | String | No | Passport number |
| nationality | String | No | Nationality |
| placeOfBirth | String | No | Birth place |
| gender | String | No | M=Male, F=Female |
| dateOfBirth | String | No | Birth date (YYYY-MM-DD) |
| photo | String | No | Base64 encoded image |
| nextOfKinName | String | No | Emergency contact name |
| nextOfKinNRIC | String | No | Emergency contact IC |
| nextOfKinAddress1 | String | No | Emergency contact address line 1 |
| nextOfKinAddress2 | String | No | Emergency contact address line 2 |
| nextOfKinAddress3 | String | No | Emergency contact address line 3 |
| nextOfKinCity | String | No | Emergency contact city |
| nextOfKinPostcode | String | No | Emergency contact postcode |
| nextOfKinState | String | No | Emergency contact state |
| nextOfKinRelationship | String | No | Relationship to seafarer |

### 2. COC Certificates
GET /seafarer/{seafarerNumber}/certificates

Get all Certificate of Competency documents for a seafarer.

Response Fields (camelCase - UPDATED):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cocIndex | String | Yes | Unique certificate ID (was COCIndex) |
| seafarerNumber | String | Yes | Seafarer ID (was SeafarerNumber) |
| appType | String | Yes | Application type (was AppType) |
| grade | String | No | Certificate grade code |
| gradeName | String | No | Full certificate name |
| status | String | Yes | Certificate status (was Status) |
| bookNo1 | String | No | Book number |
| issuedDate | String | No | Issue date (YYYY-MM-DD) |
| expiryDate | String | No | Expiry date (YYYY-MM-DD) |
| refNo | String | No | Reference number |
| serialNo | String | No | Serial number |

AppType Values:
- BARU - New application
- PERBAHARUI - Renewal
- HILANG - Lost replacement
- ROSAK - Damaged replacement

Status Values:
- VALID - Active certificate
- EXPIRED - Certificate expired
- PROCESSING - Application in progress
- REJECTED - Application rejected

### 3. WKR Documents
GET /seafarer/{seafarerNumber}/wkr

Get all Watchkeeping Rating documents for a seafarer.

Response Fields (camelCase - UPDATED):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| wkrIndex | String | Yes | Unique WKR document ID (was WKRIndex) |
| seafarerNumber | String | Yes | Seafarer ID (was SeafarerNumber) |
| peraturan | String | No | Regulation (Malay) |
| fungsi | String | No | Function code |
| fungsiDesc | String | No | Function description |
| peringkat | String | No | Level/Tier |
| peringkatLimit | String | No | Level limitation |
| kapasiti | String | No | Capacity |
| kapasitiLimit | String | No | Capacity limitation |
| status | String | Yes | Document status (was Status) |
| wkrCertNo1 | String | No | Certificate number (was WKRCertNo1) |
| issuedDate | String | No | Issue date (YYYY-MM-DD) |
| expiryDate | String | No | Expiry date (YYYY-MM-DD) |

### 4. Training Records
GET /seafarer/{seafarerNumber}/training

Get all training and modular course records for a seafarer.

Response Fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| certRef | String | Yes | Certificate reference number |
| schoolCode | String | No | Training center/school code |

### 5. COR Certificates
GET /seafarer/{seafarerNumber}/cor

Get all Certificate of Recognition documents (foreign certificates recognized in Malaysia).

Response Fields (camelCase - UPDATED):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| corIndex | String | Yes | Unique COR document ID (was CORIndex) |
| seafarerIndex | String | No | Internal seafarer ID (was SeafarerIndex) |
| appType | String | No | Application type (was AppType) |
| grade | String | No | Certificate grade |
| gradeName | String | No | Grade description |
| status | String | No | Certificate status (was Status) |
| issuedDate | String | No | Issue date (YYYY-MM-DD) |
| expiryDate | String | No | Expiry date (YYYY-MM-DD) |
| certNo1 | String | No | Certificate number |

Note: Currently only seafarerNumber = 5555 has test data

### 6. Seatime Records
GET /seafarer/{seafarerNumber}/seatime

Get seafarer's service history including vessel service records with grades and capacity.

Response Fields (camelCase - UPDATED):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| officialNo | String | No | Official vessel number (was OfficialNo) |
| shipName | String | No | Ship name (was ShipName) |
| nt | String | No | Net tonnage (was NT) |
| power | String | No | Engine power (was Power) |
| tradeLimit | String | No | Trade limitation (was TradeLimit) |
| signOn | String | No | Sign-on date (YYYY-MM-DD) (was Sign On) |
| signOff | String | No | Sign-off date (YYYY-MM-DD) (was Sign Off) |
| certificateGrade | String | No | Certificate grade (was Certificate Grade) |
| capacity | String | No | Vessel capacity (was Capacity) |

Note: Records are sorted by most recent first.
Test with seafarerNumber = 200708002327 (has seatime data)

## Response Structure

All endpoints follow a consistent response structure:

### Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "count": 2,  // Only for list endpoints
  "data": {
    // Response data here
  }
}

### Error Response
{
  "success": false,
  "message": "Error description"
}

### Empty Result Response
{
  "success": true,
  "message": "No records found for this seafarer",
  "count": 0,  // For list endpoints
  "data": []
}

## Quick Start Examples

### Get Seafarer Profile
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555"

### Get COC Certificates
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/certificates"

### Get WKR Documents
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/wkr"

### Get Training Records
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/training"

### Get COR Certificates
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/cor"

### Get Seatime Records
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/seatime"

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200  | OK | Request successful |
| 404  | Not Found | Seafarer not found |
| 400  | Bad Request | Invalid request parameters |
| 500  | Internal Server Error | Server error |

## Important Notes

1. No Authentication Required - All endpoints are publicly accessible
2. Rate Limiting - 60 requests per minute per IP
3. Date Format - All dates use YYYY-MM-DD format
4. Photo Data - Profile photos returned as base64 encoded strings
5. Empty Results - APIs return empty arrays with success=true when no data found
6. Case Sensitivity - Seafarer names returned in UPPERCASE format
7. Language - Some fields use Malay language (e.g., state names, regulations)
8. FIELD NAMING UPDATE - All responses now use camelCase field names

## Testing

### Test Seafarer Numbers:
- 5555 - Has profile, certificates, WKR, and training data
- 200708002327 - Complete profile with certificates and photos
- 201542003713 - Alternative test dataset

### Sample Profile Response (with camelCase fields):
{
  "success": true,
  "message": "Seafarer profile retrieved successfully",
  "data": {
    "documentType": "Seaman's Book",
    "seafarerNumber": "5555",
    "seafarerName": "AHMAD BIN ALI",
    "nric": "900101-01-1234",
    "address1": "No 123, Jalan Merdeka",
    "cardIssuedDate": "2023-01-15",
    "cardExpiryDate": "2028-01-14",
    "gender": "M",
    "dateOfBirth": "1990-01-01",
    "nextOfKinName": "FATIMAH BINTI HASSAN",
    "nextOfKinRelationship": "Suami/Isteri"
  }
}

## Integration Tips

## Migration Guide (v1.1 to v1.2)

The main change in v1.2 is consistent camelCase field naming. Update your field mappings:

COC Certificates:
- COCIndex -> cocIndex
- SeafarerNumber -> seafarerNumber
- AppType -> appType
- Status -> status

WKR Documents:
- WKRIndex -> wkrIndex
- SeafarerNumber -> seafarerNumber
- Status -> status
- WKRCertNo1 -> wkrCertNo1

Seatime Records:
- OfficialNo -> officialNo
- ShipName -> shipName
- NT -> nt
- Power -> power
- TradeLimit -> tradeLimit
- Sign On -> signOn
- Sign Off -> signOff
- Certificate Grade -> certificateGrade
- Capacity -> capacity

COR Certificates:
- CORIndex -> corIndex
- SeafarerIndex -> seafarerIndex
- AppType -> appType
- Status -> status

---
Version: 1.2
Updated: October 2025
Created by: System Engineer Documentation

Changes in v1.2:
- Implemented consistent camelCase field naming across all endpoints
- Updated documentation to reflect new field names
- Added migration guide for v1.1 to v1.2 upgrade
- Improved API documentation structure and examples
