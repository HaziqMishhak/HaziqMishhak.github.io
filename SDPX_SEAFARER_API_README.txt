# SDPX Seafarer API - Complete Documentation

## 📊 API Information
**Version:** 1.1  
**Environment:** Test/Development  
**Base URL:** https://webapp.mikazadrg.com.my/api/v1

## 🔍 Test Data
- `200708002327` - Complete profile with certificates and photos
- `5555` - Alternative test dataset

## 🔗 API Endpoints

### 1. Seafarer Profile
**GET** /seafarer/{seafarerNumber}

Retrieves complete seafarer profile including personal information, identification card details, and next of kin.

**Response Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| documentType | String | ✅ | Document type |
| seafarerNumber | String | ✅ | Unique seafarer ID |
| seafarerName | String | ✅ | Full name (UPPERCASE) |
| nric | String | ❌ | Malaysian IC (YYMMDD-PB-###G) |
| address1-3 | String | ❌ | Address lines |
| postcode | String | ❌ | Postal code |
| city | String | ❌ | City name |
| state | String | ❌ | State (Malay) |
| cardIssuedDate | String | ❌ | Card issue date (YYYY-MM-DD) |
| issuedPortName | String | ❌ | Issuing port office |
| cardExpiryDate | String | ❌ | Card expiry date (YYYY-MM-DD) |
| passportNumber | String | ❌ | Passport number |
| nationality | String | ❌ | Nationality |
| placeOfBirth | String | ❌ | Birth place |
| gender | String | ❌ | M=Male, F=Female |
| dateOfBirth | String | ❌ | Birth date (YYYY-MM-DD) |
| photo | String | ❌ | Base64 encoded image |
| nextOfKin* | String | ❌ | Emergency contact fields |

### 2. COC Certificates
**GET** /seafarer/{seafarerNumber}/certificates

Get all Certificate of Competency documents for a seafarer.

**Response Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| COCIndex | String | ✅ | Unique certificate ID |
| SeafarerNumber | String | ✅ | Seafarer ID |
| AppType | String | ✅ | Application type |
| Grade | String | ❌ | Certificate grade code |
| GradeName | String | ❌ | Full certificate name |
| Status | String | ✅ | Certificate status |
| BookNo1 | String | ❌ | Book number |
| IssuedDate | String | ❌ | Issue date (YYYY-MM-DD) |
| ExpiryDate | String | ❌ | Expiry date (YYYY-MM-DD) |
| RefNo | String | ❌ | Reference number |
| SerialNo | String | ❌ | Serial number |

**AppType Values:**
- `BARU` - New application
- `PERBAHARUI` - Renewal
- `HILANG` - Lost replacement
- `ROSAK` - Damaged replacement

**Status Values:**
- `VALID` - Active certificate
- `EXPIRED` - Certificate expired
- `PROCESSING` - Application in progress
- `REJECTED` - Application rejected

### 3. WKR Documents
**GET** /seafarer/{seafarerNumber}/wkr

Get all Watchkeeping Rating documents for a seafarer.

**Response Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| WKRIndex | String | ✅ | Unique WKR document ID |
| SeafarerNumber | String | ✅ | Seafarer ID |
| peraturan | String | ❌ | Regulation (Malay) |
| fungsi | String | ❌ | Function code |
| fungsiDesc | String | ❌ | Function description |
| peringkat | String | ❌ | Level/Tier |
| peringkatLimit | String | ❌ | Level limitation |
| kapasiti | String | ❌ | Capacity |
| kapasitiLimit | String | ❌ | Capacity limitation |
| Status | String | ✅ | Document status |
| WKRCertNo1 | String | ❌ | Certificate number |
| IssuedDate | String | ❌ | Issue date (YYYY-MM-DD) |
| ExpiryDate | String | ❌ | Expiry date (YYYY-MM-DD) |

### 4. Training Records
**GET** /seafarer/{seafarerNumber}/training

Get all training and modular course records for a seafarer.

**Response Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| certRef | String | ✅ | Certificate reference number |
| schoolCode | String | ❌ | Training center/school code |

### 5. COR Certificates
**GET** /seafarer/{seafarerNumber}/cor

Get all Certificate of Recognition documents (foreign certificates recognized in Malaysia).

**Note:** Uses same structure and enum values as COC Certificates.

### 6. Seatime Records
**GET** /seafarer/{seafarerNumber}/seatime

Get seafarer's service history including vessel service records with grades and capacity.

**Key Fields:**
- `gradeName1` - Certificate grade name
- `capacity` - Vessel capacity/limitation
- `signInDate` / `signOffDate` - Service period (YYYY-MM-DD)

**Note:** Records are sorted by most recent first.

## 📝 Response Structure

All endpoints follow a consistent response structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "count": 2,  // Only for list endpoints
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Empty Result Response
```json
{
  "success": true,
  "message": "No records found for this seafarer",
  "count": 0,  // For list endpoints
  "data": []
}
```

## 🚀 Quick Start Examples

### Get Seafarer Profile
```bash
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555"
```

### Get COC Certificates
```bash
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/certificates"
```

### Get WKR Documents
```bash
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/wkr"
```

### Get Training Records
```bash
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/training"
```

### Get COR Certificates
```bash
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/5555/cor"
```

### Get Seatime Records
```bash
curl -X GET "https://webapp.mikazadrg.com.my/api/v1/seafarer/200823003303/seatime"
```

## 📊 Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200  | OK | Request successful |
| 404  | Not Found | Seafarer not found |
| 400  | Bad Request | Invalid request parameters |
| 500  | Internal Server Error | Server error |

## ⚠️ Important Notes

1. **No Authentication Required** - All endpoints are publicly accessible
2. **Rate Limiting** - 60 requests per minute per IP
3. **Date Format** - All dates use YYYY-MM-DD format
4. **Photo Data** - Profile photos returned as base64 encoded strings
5. **Empty Results** - APIs return empty arrays with success=true when no data found
6. **Case Sensitivity** - Seafarer names returned in UPPERCASE format
7. **Language** - Some fields use Malay language (e.g., state names, regulations)

## 🧪 Testing

### Test Seafarer Numbers:
- `5555` - Has profile, certificates, WKR, and training data
- `200708002327` - Complete profile with certificates and photos
- `200823003303` - Has seatime data

### Sample Profile Response:
```json
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
```

## 🔄 Integration Tips

1. **Error Handling** - Always check the `success` field before processing data
2. **Data Validation** - Some fields may be null, handle gracefully
3. **Caching** - Profile data changes infrequently, consider caching responses
4. **Batch Processing** - No batch endpoint available, process one seafarer at a time
5. **Image Handling** - Base64 photos can be large, consider lazy loading

---
**Version:** 1.1
**Updated:** October 14, 2025
**Created by:** System Engineer Documentation