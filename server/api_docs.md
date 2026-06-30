# Bumpd API Documentation

## Models :

_User_
```
- email    : string, required, unique, isEmail
- password : string, required
```

_Profile_
```
- userId           : integer, required
- name             : string
- gender           : string
- age              : integer
- bio              : text
- photoUrl         : string
- city             : string
- lat              : float
- long             : float
- personality      : string
- interests        : array of string
- relationshipGoals: string
```

_Like_
```
- fromUserId : integer, required
- toUserId   : integer, required
```

_Match_
```
- user1Id    : integer, required
- user2Id    : integer, required
- icebreaker : text
- isRead     : boolean, default: false
```

_FavoritePlace_
```
- userId    : integer, required
- placeName : string, required
- lat       : float
- long      : float
- note      : text
```

## Endpoints :

List of available endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google-login`

Routes below need authentication:

- `GET /users`
- `GET /users/:id`
- `GET /profile/me`
- `PUT /profile/me`
- `POST /likes/:userId`
- `GET /likes/received`
- `GET /likes/received-count`
- `GET /matches`
- `GET /matches/notifications`
- `PATCH /matches/notifications/read`
- `GET /places`
- `POST /places`
- `PATCH /upload/photo`

Routes below need authentication & authorization:

> The request user must be the owner of the place

- `DELETE /places/:id`

&nbsp;

## 1. POST /auth/register

Description:

- Register a new user account

Request:

- body:

```json
{
  "email": "string",
  "password": "string"
}
```

_Response (201 - Created)_

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "usera@mail.com"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
OR
{
  "message": "email must be unique"
}
OR
{
  "message": "Must be a valid email address"
}
```

&nbsp;

## 2. POST /auth/login

Description:

- Login with registered email and password

Request:

- body:

```json
{
  "email": "string",
  "password": "string"
}
```

_Response (200 - OK)_

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "usera@mail.com"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid email or password"
}
```

&nbsp;

## 3. POST /auth/google-login

Description:

- Login or register using a Google account (OAuth)

Request:

- headers:

```json
{
  "access_token_google": "<google_access_token>"
}
```

_Response (200 - OK)_

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "googleuser@gmail.com"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Google token is required"
}
OR
{
  "message": "Email is not verified"
}
```

&nbsp;

## 4. GET /users

Description:

- Get all users excluding the current user and users already liked
- Each user includes their distance (km) from the current user if both have GPS coordinates
- Supports optional query param to filter by relationship goals

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- query (optional):

```
?relationshipGoals=marriage
?relationshipGoals=a serious relationship
?relationshipGoals=something casual
?relationshipGoals=not sure yet
```

_Response (200 - OK)_

```json
[
  {
    "id": 2,
    "email": "userb@mail.com",
    "Profile": {
      "id": 2,
      "userId": 2,
      "name": "Budi",
      "gender": "male",
      "age": 24,
      "bio": "Suka kopi dan nongkrong",
      "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "city": "Jakarta Selatan",
      "lat": -6.2615,
      "long": 106.8106,
      "personality": "ENFP",
      "interests": ["gym", "traveling", "cafe-hopping"],
      "relationshipGoals": "a serious relationship"
    },
    "distance": 5.3
  }
]
```

&nbsp;

## 5. GET /users/:id

Description:

- Get a single user by ID including their profile and favorite places
- Includes distance (km) from the current user if both have GPS coordinates

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer (required)"
}
```

_Response (200 - OK)_

```json
{
  "id": 2,
  "email": "userb@mail.com",
  "Profile": {
    "id": 2,
    "userId": 2,
    "name": "Budi",
    "gender": "male",
    "age": 24,
    "bio": "Suka kopi dan nongkrong",
    "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "city": "Jakarta Selatan",
    "lat": -6.2615,
    "long": 106.8106,
    "personality": "ENFP",
    "interests": ["gym", "traveling", "cafe-hopping"],
    "relationshipGoals": "a serious relationship"
  },
  "FavoritePlaces": [
    {
      "id": 1,
      "userId": 2,
      "placeName": "Kopi Tuku Cipete",
      "lat": -6.2897,
      "long": 106.7971,
      "note": "Favorit buat nugas, wifi kenceng"
    }
  ],
  "distance": 5.3
}
```

_Response (404 - Not Found)_

```json
{
  "message": "User not found"
}
```

&nbsp;

## 6. GET /profile/me

Description:

- Get the current logged-in user's full profile data

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "email": "usera@mail.com",
  "Profile": {
    "id": 1,
    "userId": 1,
    "name": "Andi",
    "gender": "male",
    "age": 25,
    "bio": "Suka kopi dan jalan-jalan",
    "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "city": "Jakarta Selatan",
    "lat": -6.2615,
    "long": 106.8106,
    "personality": "INFP",
    "interests": ["gym", "traveling", "cafe-hopping"],
    "relationshipGoals": "a serious relationship"
  }
}
```

&nbsp;

## 7. PUT /profile/me

Description:

- Update the current logged-in user's profile
- All fields are optional; only provided fields will be updated

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
  "name": "string",
  "gender": "string",
  "age": "integer",
  "bio": "string",
  "city": "string",
  "lat": "float",
  "long": "float",
  "personality": "string",
  "interests": ["string"],
  "relationshipGoals": "string"
}
```

_Response (200 - OK)_

```json
{
  "id": 1,
  "userId": 1,
  "name": "Andi",
  "gender": "male",
  "age": 25,
  "bio": "Suka kopi dan jalan-jalan",
  "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "city": "Jakarta Selatan",
  "lat": -6.2615,
  "long": 106.8106,
  "personality": "INFP",
  "interests": ["gym", "traveling", "cafe-hopping"],
  "relationshipGoals": "a serious relationship",
  "createdAt": "2026-05-01T00:00:00.000Z",
  "updatedAt": "2026-05-22T00:00:00.000Z"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Profile not found"
}
```

&nbsp;

## 8. POST /likes/:userId

Description:

- Like another user
- If the target user has already liked the current user (mutual like), a match is automatically created with an AI-generated icebreaker message

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "userId": "integer (required)"
}
```

_Response (201 - Created) — no match yet_

```json
{
  "message": "Liked successfully",
  "matched": false
}
```

_Response (201 - Created) — mutual match!_

```json
{
  "message": "It's a match! 🙌",
  "matched": true
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Invalid user ID"
}
OR
{
  "message": "You cannot like yourself"
}
OR
{
  "message": "Already liked this user"
}
```

&nbsp;

## 9. GET /likes/received

Description:

- Get all likes received by the current user including each liker's profile data
- Sorted by newest first

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "fromUserId": 2,
    "toUserId": 1,
    "createdAt": "2026-05-22T08:00:00.000Z",
    "updatedAt": "2026-05-22T08:00:00.000Z",
    "Liker": {
      "id": 2,
      "email": "userb@mail.com",
      "Profile": {
        "id": 2,
        "name": "Budi",
        "gender": "male",
        "age": 24,
        "bio": "Suka kopi dan nongkrong",
        "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "city": "Jakarta Selatan",
        "personality": "ENFP",
        "interests": ["gym", "traveling"],
        "relationshipGoals": "a serious relationship"
      }
    }
  }
]
```

&nbsp;

## 10. GET /likes/received-count

Description:

- Get the total count of likes received by the current user

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
  "count": 3
}
```

&nbsp;

## 11. GET /matches

Description:

- Get all mutual matches for the current user
- Each match includes both users' profile data and the AI-generated icebreaker
- Sorted by newest first

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "user1Id": 1,
    "user2Id": 2,
    "icebreaker": "eh kamu suka ke kopi tuku cipete juga? kirain cuma aku yang hampir tiap minggu ke sana haha, biasanya duduk di mana?",
    "isRead": false,
    "createdAt": "2026-05-22T08:00:00.000Z",
    "updatedAt": "2026-05-22T08:00:00.000Z",
    "User1": {
      "id": 1,
      "email": "usera@mail.com",
      "Profile": {
        "name": "Andi",
        "gender": "male",
        "age": 25,
        "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "city": "Jakarta Selatan",
        "personality": "INFP",
        "interests": ["gym", "traveling", "cafe-hopping"],
        "relationshipGoals": "a serious relationship"
      }
    },
    "User2": {
      "id": 2,
      "email": "userb@mail.com",
      "Profile": {
        "name": "Budi",
        "gender": "male",
        "age": 24,
        "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "city": "Jakarta Selatan",
        "personality": "ENFP",
        "interests": ["gym", "traveling"],
        "relationshipGoals": "a serious relationship"
      }
    }
  }
]
```

&nbsp;

## 12. GET /matches/notifications

Description:

- Get all unread match notifications for the current user

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "user1Id": 1,
    "user2Id": 2,
    "icebreaker": "eh kamu suka ke kopi tuku cipete juga?",
    "isRead": false,
    "createdAt": "2026-05-22T08:00:00.000Z",
    "User1": {
      "id": 1,
      "email": "usera@mail.com",
      "Profile": {
        "name": "Andi",
        "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
      }
    },
    "User2": {
      "id": 2,
      "email": "userb@mail.com",
      "Profile": {
        "name": "Budi",
        "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
      }
    }
  }
]
```

&nbsp;

## 13. PATCH /matches/notifications/read

Description:

- Mark all unread match notifications as read for the current user

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
  "message": "Notifications marked as read"
}
```

&nbsp;

## 14. GET /places

Description:

- Get all favorite places saved by the current user
- Sorted by newest first

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": 1,
    "userId": 1,
    "placeName": "Kopi Tuku Cipete",
    "lat": -6.2897,
    "long": 106.7971,
    "note": "Favorit buat nugas, wifi kenceng",
    "createdAt": "2026-05-22T08:00:00.000Z",
    "updatedAt": "2026-05-22T08:00:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "placeName": "Tebet Eco Park",
    "lat": null,
    "long": null,
    "note": null,
    "createdAt": "2026-05-21T08:00:00.000Z",
    "updatedAt": "2026-05-21T08:00:00.000Z"
  }
]
```

&nbsp;

## 15. POST /places

Description:

- Add a new favorite place for the current user
- If `lat` and `long` are provided, the city name is automatically resolved via OpenStreetMap Nominatim reverse geocoding

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
  "placeName": "string (required)",
  "lat": "float (optional)",
  "long": "float (optional)",
  "note": "string (optional)"
}
```

_Response (201 - Created)_

```json
{
  "id": 1,
  "userId": 1,
  "placeName": "Kopi Tuku Cipete",
  "lat": -6.2897,
  "long": 106.7971,
  "note": "Favorit buat nugas, wifi kenceng",
  "city": "Jakarta Selatan",
  "createdAt": "2026-05-22T08:00:00.000Z",
  "updatedAt": "2026-05-22T08:00:00.000Z"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Place name is required"
}
```

&nbsp;

## 16. DELETE /places/:id

Description:

- Delete a favorite place by ID
- Only the owner of the place can delete it

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer (required)"
}
```

_Response (200 - OK)_

```json
{
  "message": "Place deleted successfully"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "You are not authorized"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Place not found"
}
```

&nbsp;

## 17. PATCH /upload/photo

Description:

- Upload or replace the current user's profile photo
- Photo is stored on Cloudinary and the URL is saved to the user's profile

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "multipart/form-data"
}
```

- body (multipart/form-data):

```json
{
  "photo": "file (required)"
}
```

_Response (200 - OK)_

```json
{
  "photoUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/photo.jpg"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "No file uploaded"
}
```

&nbsp;

## Global Error

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

_Response (500 - Internal Server Error)_

```json
{
  "message": "Internal server error"
}
```
