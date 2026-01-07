const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const verifyGoogleToken = require("./google");

const app = express();
const PORT = 4000;

const ZALO_APP_ID = "2044785096131277288";
const ZALO_APP_SECRET = "0UW7Y9L19181VxS2blRf";
const user = {
  id: 1,
  user: "test",
  profilePicture: "https://example.com/profile.jpg",
};

/**
 * Zalo webhook gửi JSON
 */
app.use(bodyParser.json());
app.use(cors());

app.use(express.static("public"));

/**
 * Endpoint webhook
 * Ví dụ cấu hình trên Zalo:
 * https://your-domain.com/webhook/zalo
 */
app.post("/webhook/zalo", (req, res) => {
  console.log("===== ZALO WEBHOOK RECEIVED =====");
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).json({ success: true });
});

app.get("/zalo/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("Missing code");

  const data = new URLSearchParams({
    code,
    app_id: ZALO_APP_ID,
    grant_type: "authorization_code",
    code_verifier: "your_code_verifier",
  });

  const tokenRes = await axios.post(
    "https://oauth.zaloapp.com/v4/access_token",
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: ZALO_APP_SECRET,
      },
    }
  );
  const { access_token } = tokenRes.data;

  const profileRes = await axios.get("https://graph.zalo.me/v2.0/me", {
    params: {
      fields: "id,name,picture",
    },
    headers: {
      access_token,
    },
  });

  const zaloUser = profileRes.data;
  user.user = zaloUser.name;
  user.id = zaloUser.id;
  user.profilePicture = zaloUser.picture.data.url;
  res.redirect(`http://localhost:5173/login-zalo?code=${code}`);
});

app.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const googleUser = await verifyGoogleToken(token);
    console.log("🚀 ~ googleUser:", googleUser);

    res.json({
      id: googleUser.sub,
      email: googleUser.email,
      user: googleUser.name,
      profilePicture: googleUser.picture,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

app.get("/user", async (req, res) => {
  return res.json(user);
});

app.listen(PORT, () => {
  console.log(`Webhook server running at http://localhost:${PORT}`);
});
