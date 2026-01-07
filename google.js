const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  "55595084888-uh18qs56icpuoeb2snpgj2abj2fd26u0.apps.googleusercontent.com"
);

async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "55595084888-uh18qs56icpuoeb2snpgj2abj2fd26u0.apps.googleusercontent.com",
  });

  return ticket.getPayload();
}

module.exports = verifyGoogleToken;
