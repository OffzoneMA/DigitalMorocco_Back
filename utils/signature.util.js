const crypto = require("crypto");

function generateSignature(secretKey, payload) {
  return crypto.createHash("sha256").update(secretKey + payload).digest("hex");
}

function validateHmacSignature(rawBody, signatureHeader, secretKey) {
  const expected = crypto.createHmac("sha256", secretKey).update(rawBody).digest("hex");
  return expected === signatureHeader;
}

module.exports = { generateSignature, validateHmacSignature };
