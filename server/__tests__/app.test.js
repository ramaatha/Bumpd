const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");
const { verifyToken } = require("../helpers/jwt");

// Mock axios (used in googleLogin)
jest.mock("axios");
const axios = require("axios");

// Mock gemini helper (used in likeUser when match occurs)
jest.mock("../helpers/gemini", () => ({
  genIcebreaker: jest.fn().mockResolvedValue("Kalian berdua sama-sama suka nongkrong!"),
}));

// Mock global fetch (used in addPlace for Nominatim geocoding)
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    address: { city: "Jakarta Selatan" },
  }),
});

let userAToken, userBToken, userAId, userBId, placeId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const resA = await request(app).post("/auth/register").send({
    email: "usera@test.com",
    password: "password123",
  });
  userAToken = resA.body.access_token;
  userAId = verifyToken(userAToken).id;

  const resB = await request(app).post("/auth/register").send({
    email: "userb@test.com",
    password: "password123",
  });
  userBToken = resB.body.access_token;
  userBId = verifyToken(userBToken).id;
});

afterAll(async () => {
  await sequelize.close();
});

// ===================== AUTH =====================

describe("POST /auth/register", () => {
  it("201 - success register", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "newuser@test.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("email", "newuser@test.com");
  });

  it("400 - missing email", async () => {
    const res = await request(app).post("/auth/register").send({
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("400 - missing password", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "someone@test.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("400 - duplicate email", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "usera@test.com",
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("400 - invalid email format", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "notanemail",
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});

describe("POST /auth/login", () => {
  it("200 - success login", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "usera@test.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
  });

  it("400 - missing email", async () => {
    const res = await request(app).post("/auth/login").send({
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("400 - missing password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "usera@test.com",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - email not registered", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "notexist@test.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "usera@test.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});

describe("POST /auth/google-login", () => {
  it("200 - success google login", async () => {
    axios.get.mockResolvedValue({
      data: {
        email: "googleuser@gmail.com",
        email_verified: true,
      },
    });
    const res = await request(app)
      .post("/auth/google-login")
      .set("access_token_google", "fake_google_token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
  });

  it("400 - missing google token", async () => {
    const res = await request(app).post("/auth/google-login");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});

// ===================== USERS =====================

describe("GET /users", () => {
  it("200 - success get all users", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("200 - success with relationshipGoals filter", async () => {
    const res = await request(app)
      .get("/users?relationshipGoals=marriage")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - invalid token", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});

describe("GET /users/:id", () => {
  it("200 - success get user by id", async () => {
    const res = await request(app)
      .get(`/users/${userBId}`)
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email", "userb@test.com");
  });

  it("404 - user not found", async () => {
    const res = await request(app)
      .get("/users/99999")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - no token", async () => {
    const res = await request(app).get(`/users/${userBId}`);
    expect(res.status).toBe(401);
  });
});

// ===================== PROFILE =====================

describe("GET /profile/me", () => {
  it("200 - success get my profile", async () => {
    const res = await request(app)
      .get("/profile/me")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email", "usera@test.com");
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/profile/me");
    expect(res.status).toBe(401);
  });
});

describe("PUT /profile/me", () => {
  it("200 - success update profile", async () => {
    const res = await request(app)
      .put("/profile/me")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({
        name: "User A",
        gender: "male",
        age: 25,
        bio: "Suka kopi dan jalan-jalan",
        city: "Jakarta Selatan",
        lat: -6.2615,
        long: 106.8106,
        personality: "INFP",
        interests: ["gym", "traveling", "cafe-hopping"],
        relationshipGoals: "a serious relationship",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "User A");
  });

  it("401 - no token", async () => {
    const res = await request(app)
      .put("/profile/me")
      .send({ name: "Test" });
    expect(res.status).toBe(401);
  });
});

// ===================== PLACES =====================

describe("POST /places", () => {
  it("201 - success add place", async () => {
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({
        placeName: "Kopi Tuku Cipete",
        lat: -6.2897,
        long: 106.7971,
        note: "Favorite coffee spot",
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("placeName", "Kopi Tuku Cipete");
    placeId = res.body.id;
  });

  it("201 - success add place without lat/long", async () => {
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ placeName: "Tebet Eco Park" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("placeName", "Tebet Eco Park");
  });

  it("400 - missing placeName", async () => {
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ lat: -6.2, long: 106.8 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - no token", async () => {
    const res = await request(app)
      .post("/places")
      .send({ placeName: "Test Place" });
    expect(res.status).toBe(401);
  });
});

describe("GET /places", () => {
  it("200 - success get places", async () => {
    const res = await request(app)
      .get("/places")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/places");
    expect(res.status).toBe(401);
  });
});

describe("DELETE /places/:id", () => {
  it("200 - success delete place", async () => {
    const res = await request(app)
      .delete(`/places/${placeId}`)
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Place deleted successfully");
  });

  it("404 - place not found", async () => {
    const res = await request(app)
      .delete("/places/99999")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - no token", async () => {
    const res = await request(app).delete("/places/1");
    expect(res.status).toBe(401);
  });
});

// ===================== LIKES =====================

describe("POST /likes/:userId", () => {
  it("400 - invalid user id (not a number)", async () => {
    const res = await request(app)
      .post("/likes/abc")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("400 - cannot like yourself", async () => {
    const res = await request(app)
      .post(`/likes/${userAId}`)
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("201 - success like (no match yet)", async () => {
    const res = await request(app)
      .post(`/likes/${userBId}`)
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("matched", false);
  });

  it("400 - already liked this user", async () => {
    const res = await request(app)
      .post(`/likes/${userBId}`)
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("201 - success like and it's a match!", async () => {
    // userB likes userA back → mutual like → match created
    const res = await request(app)
      .post(`/likes/${userAId}`)
      .set("Authorization", `Bearer ${userBToken}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("matched", true);
  });

  it("401 - no token", async () => {
    const res = await request(app).post(`/likes/${userBId}`);
    expect(res.status).toBe(401);
  });
});

describe("GET /likes/received-count", () => {
  it("200 - success get received likes count", async () => {
    // userA liked userB earlier, so userB has at least 1 received like
    const res = await request(app)
      .get("/likes/received-count")
      .set("Authorization", `Bearer ${userBToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  it("200 - user with no received likes returns 0", async () => {
    // Register a fresh user that no one has liked
    const resF = await request(app).post("/auth/register").send({
      email: "userf@test.com",
      password: "password123",
    });
    const userFToken = resF.body.access_token;

    const res = await request(app)
      .get("/likes/received-count")
      .set("Authorization", `Bearer ${userFToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count", 0);
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/likes/received-count");
    expect(res.status).toBe(401);
  });
});

describe("GET /likes/received", () => {
  it("200 - success get received likes list", async () => {
    // userA liked userB earlier, so userB's received list should not be empty
    const res = await request(app)
      .get("/likes/received")
      .set("Authorization", `Bearer ${userBToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("200 - received likes include liker user data", async () => {
    const res = await request(app)
      .get("/likes/received")
      .set("Authorization", `Bearer ${userBToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const like = res.body[0];
    expect(like).toHaveProperty("Liker");
    expect(like.Liker).toHaveProperty("email");
    expect(like.Liker).not.toHaveProperty("password");
  });

  it("200 - user with no received likes returns empty array", async () => {
    const resG = await request(app).post("/auth/register").send({
      email: "userg@test.com",
      password: "password123",
    });
    const userGToken = resG.body.access_token;

    const res = await request(app)
      .get("/likes/received")
      .set("Authorization", `Bearer ${userGToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/likes/received");
    expect(res.status).toBe(401);
  });
});

// ===================== MATCHES =====================

describe("GET /matches", () => {
  it("200 - success get matches", async () => {
    const res = await request(app)
      .get("/matches")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/matches");
    expect(res.status).toBe(401);
  });
});

describe("GET /matches/notifications", () => {
  it("200 - success get notifications", async () => {
    const res = await request(app)
      .get("/matches/notifications")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("401 - no token", async () => {
    const res = await request(app).get("/matches/notifications");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /matches/notifications/read", () => {
  it("200 - success mark notifications as read", async () => {
    const res = await request(app)
      .patch("/matches/notifications/read")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - no token", async () => {
    const res = await request(app).patch("/matches/notifications/read");
    expect(res.status).toBe(401);
  });
});

// ===================== UPLOAD =====================

describe("PATCH /upload/photo", () => {
  it("400 - no file uploaded", async () => {
    const res = await request(app)
      .patch("/upload/photo")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("401 - no token", async () => {
    const res = await request(app).patch("/upload/photo");
    expect(res.status).toBe(401);
  });
});

// ===================== ADDITIONAL COVERAGE =====================

describe("GET /users - with haversine distance", () => {
  it("200 - distance calculated when both users have lat/long", async () => {
    // Update both profiles with lat/long so haversine runs
    await request(app)
      .put("/profile/me")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ lat: -6.2615, long: 106.8106, name: "User A" });

    await request(app)
      .put("/profile/me")
      .set("Authorization", `Bearer ${userBToken}`)
      .send({ lat: -6.1751, long: 106.8272, name: "User B" });

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /users/:id - with haversine distance", () => {
  it("200 - distance calculated when both users have lat/long", async () => {
    const res = await request(app)
      .get(`/users/${userBId}`)
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("distance");
  });
});

describe("Authentication edge cases", () => {
  it("401 - token without Bearer prefix", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", userAToken);
    expect(res.status).toBe(401);
  });

  it("401 - token from deleted user", async () => {
    const fakeToken = require("../helpers/jwt").signToken({ id: 99999, email: "ghost@test.com" });
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });
});

// ===================== BRANCH COVERAGE =====================

describe("POST /auth/google-login - email not verified", () => {
  it("400 - email not verified by Google", async () => {
    axios.get.mockResolvedValue({
      data: { email: "unverified@gmail.com", email_verified: false },
    });
    const res = await request(app)
      .post("/auth/google-login")
      .set("access_token_google", "fake_token");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Email is not verified");
  });
});

describe("ProfileController - error branches", () => {
  let userCToken;

  beforeAll(async () => {
    // Buat user tanpa profile untuk trigger NotFound
    const { User } = require("../models");
    const { hashPassword } = require("../helpers/bcrypt");
    const { signToken } = require("../helpers/jwt");
    const userC = await User.create({
      email: "userc@test.com",
      password: hashPassword("password123"),
    });
    userCToken = signToken({ id: userC.id, email: userC.email });
  });

  it("404 - updateProfile when profile not found", async () => {
    const res = await request(app)
      .put("/profile/me")
      .set("Authorization", `Bearer ${userCToken}`)
      .send({ name: "User C" });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  it("500 - getMyProfile DB error", async () => {
    const { User } = require("../models");
    jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app)
      .get("/profile/me")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(500);
  });
});

describe("PlaceController - address fallback branches", () => {
  it("201 - city from address.town fallback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { town: "Depok" } }),
    });
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ placeName: "Tempat A", lat: -6.4, long: 106.8 });
    expect(res.status).toBe(201);
  });

  it("201 - city from address.county fallback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { county: "Bogor" } }),
    });
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ placeName: "Tempat B", lat: -6.5, long: 106.7 });
    expect(res.status).toBe(201);
  });

  it("201 - city from address.state fallback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { state: "Jawa Barat" } }),
    });
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ placeName: "Tempat C", lat: -6.6, long: 106.6 });
    expect(res.status).toBe(201);
  });

  it("201 - city null when no address fields", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: {} }),
    });
    const res = await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userAToken}`)
      .send({ placeName: "Tempat D", lat: -6.7, long: 106.5 });
    expect(res.status).toBe(201);
  });
});

describe("UploadController - success", () => {
  it("200 - success upload photo", async () => {
    const cloudinary = require("cloudinary").v2;
    jest.spyOn(cloudinary.uploader, "upload").mockResolvedValueOnce({
      secure_url: "https://res.cloudinary.com/test/photo.jpg",
    });
    const res = await request(app)
      .patch("/upload/photo")
      .set("Authorization", `Bearer ${userAToken}`)
      .attach("photo", Buffer.from("fake image data"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("photoUrl");
  });
});

describe("MatchController - error branches", () => {
  it("500 - getMatches DB error", async () => {
    const { Match } = require("../models");
    jest.spyOn(Match, "findAll").mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app)
      .get("/matches")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(500);
  });

  it("500 - getNotifications DB error", async () => {
    const { Match } = require("../models");
    jest.spyOn(Match, "findAll").mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app)
      .get("/matches/notifications")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(500);
  });

  it("500 - markNotificationsRead DB error", async () => {
    const { Match } = require("../models");
    jest.spyOn(Match, "update").mockRejectedValueOnce(new Error("DB error"));
    const res = await request(app)
      .patch("/matches/notifications/read")
      .set("Authorization", `Bearer ${userAToken}`);
    expect(res.status).toBe(500);
  });
});

describe("LikeController - shared places and gemini error", () => {
  let userDToken, userEToken, userDId, userEId;

  beforeAll(async () => {
    // Register userD dan userE
    const resD = await request(app).post("/auth/register").send({
      email: "userd@test.com",
      password: "password123",
    });
    userDToken = resD.body.access_token;
    userDId = verifyToken(userDToken).id;

    const resE = await request(app).post("/auth/register").send({
      email: "usere@test.com",
      password: "password123",
    });
    userEToken = resE.body.access_token;
    userEId = verifyToken(userEToken).id;

    // Tambah same place di kedua user untuk shared places coverage
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ address: { city: "Jakarta" } }),
    });
    await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userDToken}`)
      .send({ placeName: "Kopi Tuku Cipete", lat: -6.28, long: 106.79 });
    await request(app)
      .post("/places")
      .set("Authorization", `Bearer ${userEToken}`)
      .send({ placeName: "Kopi Tuku Cipete", lat: -6.28, long: 106.79 });
  });

  it("201 - like (no match)", async () => {
    const res = await request(app)
      .post(`/likes/${userEId}`)
      .set("Authorization", `Bearer ${userDToken}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("matched", false);
  });

  it("201 - match with shared places (gemini throws → icebreaker null)", async () => {
    const { genIcebreaker } = require("../helpers/gemini");
    genIcebreaker.mockRejectedValueOnce(new Error("Gemini error"));

    const res = await request(app)
      .post(`/likes/${userDId}`)
      .set("Authorization", `Bearer ${userEToken}`);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("matched", true);
  });
});
