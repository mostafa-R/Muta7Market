# Admin API Documentation

## Overview

Complete admin management system for users and players with CRUD operations, file uploads, and advanced filtering.

## Authentication

All admin routes require:

- **JWT Token**: `Authorization: Bearer <token>`
- **Admin Role**: `admin` or `super_admin`

## Base URL

```
/api/v1/admin
```

---

## 📊 Dashboard & Analytics

### Get Dashboard Stats

```http
GET /api/v1/admin/dashboard/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 120,
      "inactive": 30
    },
    "players": {
      "total": 85,
      "active": 70,
      "inactive": 15
    },
    "recent": {
      "users": [...],
      "players": [...]
    }
  }
}
```

---

## 👥 User Management

### Get All Users

```http
GET /api/v1/admin/users?page=1&limit=10&search=john&role=user&isActive=true
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name or email
- `role` (string): Filter by role (`user`, `admin`, `super_admin`)
- `isActive` (string): Filter by status (`true`, `false`)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get User by ID

```http
GET /api/v1/admin/users/:id
```

### Create User

```http
POST /api/v1/admin/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "966501234567",
  "role": "user",
  "isActive": true
}
```

### Update User

```http
PUT /api/v1/admin/users/:id
Content-Type: application/json

{
  "name": "John Updated",
  "isActive": false,
  "role": "admin"
}
```

### Delete User

```http
# Soft delete (deactivate)
DELETE /api/v1/admin/users/:id?soft=true

# Hard delete (permanent)
DELETE /api/v1/admin/users/:id
```

### Bulk Update Users

```http
PATCH /api/v1/admin/users/bulk
Content-Type: application/json

{
  "userIds": ["id1", "id2", "id3"],
  "updates": {
    "isActive": false,
    "role": "user"
  }
}
```

---

## ⚽ Player Management

### Get All Players

```http
GET /api/v1/admin/players?page=1&limit=10&search=محمد&position=مهاجم&status=available&nationality=مصر&minAge=20&maxAge=30&isActive=true
```

**Query Parameters:**

- `page`, `limit`: Pagination
- `search`: Search by name
- `position`: Filter by position
- `status`: Filter by status (`available`, `contracted`, `transferred`, `recently transferred`)
- `nationality`: Filter by nationality
- `minAge`, `maxAge`: Age range filter
- `isActive`: Filter by active status

### Get Player by ID

```http
GET /api/v1/admin/players/:id
```

### Create Player (with File Upload)

```http
POST /api/v1/admin/players
Content-Type: multipart/form-data

# Form Data:
name: "محمد صلاح"
age: 25
gender: "male"
nationality: "مصر"
jop: "player"
position: "مهاجم"
status: "available"
monthlySalary: {"amount": 50000, "currency": "SAR"}
yearSalary: {"amount": 600000, "currency": "SAR"}
profileImage: [file]
document: [file]
playerVideo: [file]
contactInfo: {"email": "player@example.com", "phone": "966501234567"}
socialLinks: {"instagram": "https://instagram.com/player"}
```

**File Upload Fields:**

- `profileImage`: Image file (jpg, png, gif, webp) - max 100MB
- `document`: Document file (pdf, doc, docx) - max 100MB
- `playerVideo`: Video file (mp4, mov, avi, wmv, mkv) - max 100MB

### Update Player (with File Upload)

```http
PATCH /api/v1/admin/players/:id
Content-Type: multipart/form-data

# Form Data:
name: "محمد صلاح المحدث"
age: 26
status: "contracted"
profileImage: [new_file] # Will replace existing image
# Other fields...
```

**File Replacement Logic:**

- ✅ **New file uploaded**: Deletes old file from Cloudinary, uploads new one
- ✅ **No file uploaded**: Keeps existing file unchanged
- ✅ **Preserves file extensions**: PDFs remain as .pdf, DOCs as .doc, etc.

### Delete Player

```http
# Soft delete
DELETE /api/v1/admin/players/:id?soft=true

# Hard delete
DELETE /api/v1/admin/players/:id
```

### Bulk Update Players

```http
PATCH /api/v1/admin/players/bulk
Content-Type: application/json

{
  "playerIds": ["id1", "id2", "id3"],
  "updates": {
    "status": "available",
    "isActive": true
  }
}
```

---

## 📁 File Upload Details

### Supported File Types

- **Images**: jpg, jpeg, png, gif, webp
- **Videos**: mp4, mov, avi, wmv, mkv
- **Documents**: pdf, doc, docx, txt

### Cloudinary Storage Structure

```
sports-platform/
├── images/          # Profile images
├── videos/          # Player videos
├── documents/       # Player documents
└── others/          # Other files
```

### File Handling Features

- ✅ **Automatic file type detection**
- ✅ **Proper MIME type validation**
- ✅ **File extension preservation** (especially for documents)
- ✅ **Image optimization** (max 1000x1000px)
- ✅ **Old file cleanup** when updating
- ✅ **Error handling** for upload failures

---

## 🔒 Security Features

- **Role-based access control** (admin, super_admin only)
- **JWT token validation** on all routes
- **Input validation** with Joi schemas
- **File type validation** and size limits
- **SQL injection prevention** with Mongoose
- **XSS protection** with input sanitization

---

## 📝 Validation Rules

### User Validation

- `name`: 2-100 characters, required
- `email`: Valid email format, required
- `password`: Minimum 8 characters, required (create only)
- `phone`: 10-20 digits, optional
- `role`: user|admin|super_admin

### Player Validation

- `name`: 2-100 characters, required
- `age`: 16-50 years, required
- `gender`: male|female, required
- `nationality`: 2-100 characters, required
- `jop`: player|coach, required
- `position`: max 100 characters
- `status`: available|contracted|transferred|recently transferred
- `experience`: 0-30 years
- `monthlySalary`, `yearSalary`: Objects with amount and currency

---

## 🚀 Usage Examples

### Create Player with Files (cURL)

```bash
curl -X POST http://localhost:5000/api/v1/admin/players \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=محمد صلاح" \
  -F "age=25" \
  -F "gender=male" \
  -F "nationality=مصر" \
  -F "jop=player" \
  -F "position=مهاجم" \
  -F "status=available" \
  -F 'monthlySalary={"amount": 50000, "currency": "SAR"}' \
  -F "profileImage=@profile.jpg" \
  -F "document=@contract.pdf" \
  -F "playerVideo=@highlights.mp4"
```

### Search Players (JavaScript)

```javascript
const response = await fetch(
  "/api/v1/admin/players?search=محمد&position=مهاجم&minAge=20&maxAge=30",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
const data = await response.json();
```

---

## ⚠️ Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": {
    "name": ["Name is required"],
    "age": ["Age must be at least 16"]
  }
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## 🔧 Environment Variables Required

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret
```

---

## 🎯 Key Features Summary

✅ **Complete CRUD operations** for users and players  
✅ **File upload support** with Cloudinary integration  
✅ **Advanced filtering and pagination**  
✅ **Bulk operations** for mass updates  
✅ **Soft delete support**  
✅ **Role-based security**  
✅ **Comprehensive validation**  
✅ **File replacement logic** (old files auto-deleted)  
✅ **Document extension preservation**  
✅ **Dashboard analytics**  
✅ **Error handling and logging**

The system is production-ready with proper security, validation, and file handling! 🚀
