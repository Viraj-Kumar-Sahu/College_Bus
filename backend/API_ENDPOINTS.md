# 🚀 College Bus Management API Endpoints

All endpoints are prefixed with `/api`

## 🔐 Authentication

### Register
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",  // "student", "driver", or "admin"
  "phone": "1234567890"  // optional
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

## 👨‍🎓 Students

### Get All Students
```http
GET /api/students/
```

### Get Student by ID
```http
GET /api/students/{student_id}
```

### Update Student Info
```http
PUT /api/students/{student_id}
Content-Type: application/json

{
  "roll_no": "CS2021001",
  "class_name": "Computer Science - Year 3",
  "parent_contact": "9876543210"
}
```

### Assign Student to Bus
```http
POST /api/students/{student_id}/assign-bus/{bus_id}
```

### Delete Student
```http
DELETE /api/students/{student_id}
```

---

## 👨‍✈️ Drivers

### Get All Drivers
```http
GET /api/drivers/
```

### Get Driver by ID
```http
GET /api/drivers/{driver_id}
```

### Update Driver Info
```http
PUT /api/drivers/{driver_id}
Content-Type: application/json

{
  "license_no": "DL1234567890",
  "vehicle_experience": 5  // years
}
```

### Assign Driver to Bus
```http
POST /api/drivers/{driver_id}/assign-bus/{bus_id}
```

### Delete Driver
```http
DELETE /api/drivers/{driver_id}
```

---

## 🚌 Buses

### Get All Buses
```http
GET /api/buses/
```

### Get Bus by ID
```http
GET /api/buses/{bus_id}
```

### Create New Bus
```http
POST /api/buses/
Content-Type: application/json

{
  "bus_no": "BUS-001",
  "capacity": 40,
  "model": "Volvo B9R"
}
```

### Update Bus
```http
PUT /api/buses/{bus_id}
Content-Type: application/json

{
  "bus_no": "BUS-001",
  "capacity": 45,
  "model": "Volvo B11R"
}
```

### Delete Bus
```http
DELETE /api/buses/{bus_id}
```

---

## 🗺️ Routes

### Get All Routes
```http
GET /api/routes/
```

### Get Route by ID
```http
GET /api/routes/{route_id}
```

### Create New Route
```http
POST /api/routes/
Content-Type: application/json

{
  "name": "Route A - City Center",
  "path": "[{\"lat\": 28.6139, \"lng\": 77.2090}, {...}]",  // JSON string of coordinates
  "bus_id": 1  // optional
}
```

### Update Route
```http
PUT /api/routes/{route_id}
Content-Type: application/json

{
  "name": "Route A - Updated",
  "path": "[...]",
  "bus_id": 1
}
```

### Delete Route
```http
DELETE /api/routes/{route_id}
```

---

## ✅ Attendance

### Get All Attendance Records
```http
GET /api/attendance/
GET /api/attendance/?date_filter=2025-11-01  // optional date filter
```

### Get Student Attendance History
```http
GET /api/attendance/student/{student_id}
```

### Mark Attendance
```http
POST /api/attendance/
Content-Type: application/json

{
  "student_id": 1,
  "bus_id": 1,  // optional
  "status": "present"  // "present" or "absent"
}
```

### Update Attendance Status
```http
PUT /api/attendance/{attendance_id}?status=absent
```

### Delete Attendance Record
```http
DELETE /api/attendance/{attendance_id}
```

---

## 📊 Response Examples

### Success Response (200)
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Error Response (400/404/500)
```json
{
  "detail": "Error message here"
}
```

---

## 🧪 Testing the API

### Using Browser
Visit: `http://localhost:8000/docs` for interactive Swagger UI

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get all students (with auth)
curl -X GET http://localhost:8000/api/students/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript (Frontend)
```javascript
// Get all buses
const response = await api.get('/buses');
console.log(response.data);

// Create new bus
const newBus = await api.post('/buses', {
  bus_no: 'BUS-002',
  capacity: 40,
  model: 'Mercedes-Benz'
});
```

---

## 🔑 Authentication Notes

- Most endpoints require authentication (except login/register)
- Include JWT token in `Authorization` header as `Bearer {token}`
- Token is returned on successful login/registration
- Token is stored in browser localStorage as `auth_token`

---

**API Documentation Auto-generated at:** `http://localhost:8000/docs`
