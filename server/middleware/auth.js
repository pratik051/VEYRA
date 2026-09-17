import { getSessionUserByToken } from "../services/auth-service.js";

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-session-token"]) {
      token = req.headers["x-session-token"];
    } else if (req.cookies && req.cookies.sajilomarts_session) {
      token = req.cookies.sajilomarts_session;
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/sajilomarts_session=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (!token || token === "null" || token === "undefined") {
      req.user = null;
      req.sessionToken = null;
      return next();
    }

    const user = await getSessionUserByToken(token);
    req.user = user;
    req.sessionToken = token;
    next();
  } catch (error) {
    req.user = null;
    req.sessionToken = null;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized access. Please log in." });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin rights required." });
  }
  next();
}
