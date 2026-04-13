# FootballOS Backend - API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001/api/v1`  
**Authentication:** JWT Bearer token in Authorization header

---

## 📌 Authentication

All endpoints (except noted) require:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## 🔐 AUTH ENDPOINTS

### POST `/auth/register`
Register new user

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123!@#",
  "firstName": "Professional",
  "lastName": "Player",
  "position": "MID"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com",
    "verificationRequired": true
  }
}
```

---

### POST `/auth/login`
User login

**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123!@#"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "subscription_status": "FREE"
  }
}
```

---

### POST `/auth/verify-email`
Verify email address (No auth required)

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### POST `/auth/refresh-token`
Get new access token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/logout`
Logout user (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👤 USER ENDPOINTS

### GET `/users/profile`
Get user profile (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com",
    "first_name": "Professional",
    "last_name": "Player",
    "position": "MID",
    "subscription_status": "FREE",
    "overall_rating": 45,
    "total_xp": 0,
    "pace": 45,
    "shooting": 45,
    "passing": 45,
    "dribbling": 45,
    "defense": 45,
    "physical": 45
  }
}
```

---

### PUT `/users/profile`
Update user profile (Requires auth)

**Request:**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "position": "FWD"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com",
    "first_name": "Updated",
    "last_name": "Name",
    "position": "FWD",
    "subscription_status": "FREE"
  }
}
```

---

### GET `/users/stats`
Get user statistics (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "overall_rating": 45,
    "total_xp": 1250,
    "current_level": 3,
    "pace": 48,
    "shooting": 42,
    "passing": 45,
    "dribbling": 46,
    "defense": 43,
    "physical": 44
  }
}
```

---

### GET `/users/leaderboard`
Get global leaderboard

**Query Params:**
- `limit` (default: 100): Number of users
- `offset` (default: 0): Pagination offset

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "Tom",
      "last_name": "Brady",
      "position": "MID",
      "overall_rating": 87,
      "total_xp": 45000,
      "rank": 1
    }
  ]
}
```

---

### GET `/users/achievements`
Get user achievements (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "xp_category": "WORKOUT",
      "total_xp": 2500
    },
    {
      "xp_category": "SKILL",
      "total_xp": 1000
    }
  ]
}
```

---

### GET `/users/skills`
Get user skills (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "skill_name": "Passing",
      "skill_level": 5,
      "proficiency_percentage": 65
    },
    {
      "skill_name": "Shooting",
      "skill_level": 4,
      "proficiency_percentage": 42
    }
  ]
}
```

---

## 🏋️ WORKOUT ENDPOINTS

### POST `/workouts/start`
Start workout session (Requires auth)

**Request:**
```json
{
  "duration": 60,
  "intensity": "HIGH",
  "calories_burned": 350
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Workout session started",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "duration_minutes": 60,
    "intensity": "HIGH",
    "calories_burned": 350,
    "started_at": "2026-04-13T10:30:00Z"
  }
}
```

---

### PUT `/workouts/:sessionId/end`
End workout session (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "message": "Workout session ended",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "duration_minutes": 60,
    "intensity": "HIGH",
    "calories_burned": 350
  }
}
```

---

### GET `/workouts/history`
Get workout history (Requires auth)

**Query Params:**
- `daysBack` (default: 30): Days of history

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "duration_minutes": 60,
      "intensity": "HIGH",
      "calories_burned": 350,
      "started_at": "2026-04-13T10:30:00Z",
      "ended_at": "2026-04-13T11:30:00Z"
    }
  ]
}
```

---

### GET `/workouts/week-stats`
Get this week's workouts (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "duration_minutes": 45,
      "intensity": "MEDIUM",
      "calories_burned": 250,
      "started_at": "2026-04-13T10:00:00Z"
    }
  ]
}
```

---

### GET `/workouts/stats`
Get aggregate workout stats (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_workouts": 25,
    "total_minutes": 1250,
    "total_calories": 8750,
    "avg_duration": 50
  }
}
```

---

### POST `/workouts/:sessionId/exercise`
Log exercise in workout (Requires auth)

**Request:**
```json
{
  "exerciseName": "Sprint",
  "sets": 5,
  "reps": 10,
  "weight": 0,
  "formRating": 8
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Exercise logged successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "exercise_name": "Sprint",
    "sets": 5,
    "reps": 10,
    "weight": 0,
    "form_rating": 8
  }
}
```

---

## 🎯 SKILL ENDPOINTS

### GET `/skills`
Get all user skills (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "skill_name": "Passing",
      "skill_level": 8,
      "proficiency_percentage": 85
    }
  ]
}
```

---

### POST `/skills/add-xp`
Add XP to skill (Requires auth)

**Request:**
```json
{
  "skillName": "Passing",
  "xpAmount": 500
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "XP added successfully",
  "data": {
    "skill_name": "Passing",
    "skill_level": 9,
    "proficiency_percentage": 92
  }
}
```

---

### POST `/skills/log-drill`
Log skill drill (Requires auth)

**Request:**
```json
{
  "skillName": "Passing",
  "drillName": "Triangle Pass",
  "difficulty": "HARD",
  "completionTime": 1200
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Skill drill logged successfully",
  "data": {
    "skill_name": "Passing",
    "skill_level": 9,
    "proficiency_percentage": 93
  }
}
```

---

### GET `/skills/progress`
Get skill progress (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "skill_name": "Passing",
      "skill_level": 9,
      "proficiency_percentage": 93,
      "level_progress": 18
    }
  ]
}
```

---

### GET `/skills/recommendations`
Get skill recommendations (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "skill_name": "Marking",
      "skill_level": 2,
      "proficiency_percentage": 12
    }
  ]
}
```

---

## 🍽️ DIET ENDPOINTS

### POST `/diet/log-meal`
Log meal (Requires auth)

**Request:**
```json
{
  "mealName": "Grilled Chicken & Rice",
  "calories": 650,
  "protein": 45,
  "carbs": 60,
  "fats": 15,
  "mealType": "DINNER"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Meal logged successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "meal_name": "Grilled Chicken & Rice",
    "calories": 650,
    "protein": 45,
    "carbs": 60,
    "fats": 15
  }
}
```

---

### GET `/diet/today`
Get today's nutrition (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "meals": [
      {
        "meal_name": "Breakfast",
        "calories": 400,
        "protein": 25,
        "carbs": 50,
        "fats": 10,
        "meal_type": "BREAKFAST"
      }
    ],
    "totals": {
      "calories": 2000,
      "protein": 150,
      "carbs": 200,
      "fats": 60
    }
  }
}
```

---

### GET `/diet/history`
Get diet history (Requires auth)

**Query Params:**
- `daysBack` (default: 30): Days of history

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "meal_date": "2026-04-13",
      "total_calories": 2100,
      "total_protein": 152,
      "total_carbs": 210,
      "total_fats": 65
    }
  ]
}
```

---

### GET `/diet/recommendations`
Get meal recommendations (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "meal": "Grilled Chicken Breast",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fats": 3.6
    }
  ]
}
```

---

## 📋 PLAN ENDPOINTS

### GET `/plans/weekly`
Get current weekly plan (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "week_start_date": "2026-04-14",
    "week_end_date": "2026-04-20",
    "plan_name": "Weekly BALANCED Plan",
    "difficulty": "MEDIUM",
    "days": [
      {
        "day_of_week": "MON",
        "focus_area": "Football",
        "difficulty": "MEDIUM",
        "target_duration": 60
      }
    ]
  }
}
```

---

### GET `/plans/today`
Get today's plan (Requires auth)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "focus_area": "Football",
    "difficulty": "MEDIUM",
    "target_duration": 60,
    "exercises": []
  }
}
```

---

### POST `/plans/generate`
Generate new weekly plan (Requires auth)

**Request:**
```json
{
  "difficulty": "HARD",
  "planType": "STRENGTH"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Weekly plan generated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "plan_name": "Weekly STRENGTH Plan",
    "difficulty": "HARD"
  }
}
```

---

### GET `/plans/history`
Get plan history (Requires auth)

**Query Params:**
- `limit` (default: 10): Number of plans

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "week_start_date": "2026-04-07",
      "week_end_date": "2026-04-13",
      "plan_name": "Weekly BALANCED Plan",
      "difficulty": "MEDIUM"
    }
  ]
}
```

---

## 🏥 HEALTH CHECK

### GET `/health`
Check backend health (No auth required)

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2026-04-13T10:30:00Z",
  "uptime": 1234.56,
  "environment": "development"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route /api/v1/unknown not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🎯 Status Codes

| Code | Meaning |
|------|---------|
| 200 | ✅ Success |
| 201 | ✅ Created |
| 400 | ❌ Bad request |
| 401 | ❌ Unauthorized |
| 404 | ❌ Not found |
| 429 | ⚠️ Rate limited |
| 500 | ❌ Server error |

---

## 🔑 Positions
- GK (Goalkeeper)
- DEF (Defender)
- MID (Midfielder)
- FWD (Forward)

---

## 📊 Intensity Levels
- LOW
- MEDIUM
- HIGH
- EXTREME

---

## 🏆 Difficulty Levels
- EASY
- MEDIUM
- HARD
- EXTREME

---

## 💳 Subscription Tiers
- FREE
- PREMIUM
- PRO

---

## ✅ All endpoints are production-ready and fully integrated!
