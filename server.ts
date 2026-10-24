import express from "express";
import { createServer as createViteServer } from "vite";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize APP_URL (remove trailing slash)
const APP_URL = (process.env.APP_URL || "").replace(/\/$/, "");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Auth will not work.");
}

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);

// Database setup
const db = new Database("immomanager.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    google_id TEXT UNIQUE,
    refresh_token TEXT
  );
  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    name TEXT,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS portfolio_shares (
    portfolio_id TEXT,
    user_email TEXT,
    permission TEXT,
    PRIMARY KEY(portfolio_id, user_email),
    FOREIGN KEY(portfolio_id) REFERENCES portfolios(id)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS portfolio_data (
    portfolio_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json({ limit: '10mb' }));

// Middleware to check token
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token) as any;
    if (session) {
      req.userId = session.user_id;
      return next();
    }
  }
  res.status(401).json({ error: "Not authenticated" });
};

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${APP_URL}/auth/google/callback`
);

// Auth Routes
app.get("/api/auth/google/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/drive.file"
    ],
    prompt: "consent"
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error("Google Auth Callback Error Query:", error);
    return res.status(500).send(`Google Auth Error: ${error}`);
  }

  if (!code) {
    console.error("No code received from Google");
    return res.status(400).send("No code received from Google");
  }

  try {
    console.log("Exchanging code for tokens...");
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const user = {
      id: userInfo.data.id!,
      email: userInfo.data.email!,
      name: userInfo.data.name!,
      google_id: userInfo.data.id!,
      refresh_token: tokens.refresh_token || null
    };

    console.log("Google Auth Success for:", user.email);

    // Upsert user
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, google_id, refresh_token)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(google_id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        refresh_token = COALESCE(excluded.refresh_token, users.refresh_token)
    `);
    stmt.run(user.id, user.email, user.name, user.google_id, user.refresh_token);

    // Create default portfolio if not exists
    const portfolioStmt = db.prepare("INSERT OR IGNORE INTO portfolios (id, owner_id, name) VALUES (?, ?, ?)");
    portfolioStmt.run(user.id, user.id, "Mein Portfolio");

    // Generate token
    const token = crypto.randomUUID();
    db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, user.id);

    console.log("Session saved for user:", user.id);

    res.send(`
      <html>
        <head>
          <title>Anmeldung erfolgreich</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; text-align: center; padding: 20px; }
            .loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #10b981; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .btn { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; margin-top: 20px; display: inline-block; }
            .btn:hover { background: #059669; }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <h2 style="margin-bottom: 10px;">Anmeldung erfolgreich!</h2>
          <p style="color: #94a3b8; margin-bottom: 20px;">Die App sollte sich nun automatisch aktualisieren.</p>
          
          <button onclick="finishLogin()" class="btn">Zurück zur App</button>
          
          <script>
            const token = "${token}";
            
            function finishLogin() {
              console.log("Manual finish requested");
              try {
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: token }, '*');
                  setTimeout(() => {
                    window.close();
                  }, 500);
                } else {
                  window.location.href = '/?token=' + token;
                }
              } catch (e) {
                window.location.href = '/?token=' + token;
              }
            }

            // Auto-attempt
            console.log("Sending OAUTH_AUTH_SUCCESS to opener");
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: token }, '*');
                setTimeout(() => {
                  // Only auto-close if we think it worked
                  // window.close(); 
                }, 2000);
              }
            } catch (e) {
              console.error("PostMessage Error:", e);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).send("Authentication failed: " + (error instanceof Error ? error.message : String(error)));
  }
});

app.get("/api/auth/me", requireAuth, async (req: any, res) => {
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.userId);
  res.json(user);
});

app.post("/api/auth/logout", requireAuth, (req: any, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  res.json({ success: true });
});

// Portfolio Sharing Routes
app.get("/api/portfolios", requireAuth, (req: any, res) => {
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.userId) as any;
  
  const owned = db.prepare("SELECT * FROM portfolios WHERE owner_id = ?").all(req.userId);
  const shared = db.prepare(`
    SELECT p.*, ps.permission 
    FROM portfolios p 
    JOIN portfolio_shares ps ON p.id = ps.portfolio_id 
    WHERE ps.user_email = ?
  `).all(user.email);
  
  res.json({ owned, shared });
});

app.post("/api/portfolios/share", requireAuth, (req: any, res) => {
  const { portfolioId, email, permission } = req.body;
  
  // Check ownership
  const portfolio = db.prepare("SELECT * FROM portfolios WHERE id = ? AND owner_id = ?").get(portfolioId, req.userId);
  if (!portfolio) return res.status(403).json({ error: "Not authorized" });
  
  db.prepare("INSERT OR REPLACE INTO portfolio_shares (portfolio_id, user_email, permission) VALUES (?, ?, ?)")
    .run(portfolioId, email, permission);
    
  res.json({ success: true });
});

// Drive Proxy
async function getDriveClient(userId: string) {
  const user = db.prepare("SELECT refresh_token FROM users WHERE id = ?").get(userId) as any;
  if (!user?.refresh_token) return null;

  const auth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: user.refresh_token });
  return google.drive({ version: "v3", auth });
}

app.get("/api/drive/data", requireAuth, async (req: any, res) => {
  const portfolioId = req.query.portfolioId as string || req.userId;
  
  // Check access
  let ownerId = portfolioId;
  if (portfolioId !== req.userId) {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.userId) as any;
    const share = db.prepare("SELECT * FROM portfolio_shares WHERE portfolio_id = ? AND user_email = ?")
      .get(portfolioId, user.email);
    if (!share) return res.status(403).json({ error: "No access to this portfolio" });
    ownerId = portfolioId; // Portfolio ID is the owner's user ID in our simple setup
  }

  const drive = await getDriveClient(ownerId);
  if (!drive) {
    const stored = db.prepare("SELECT data FROM portfolio_data WHERE portfolio_id = ?").get(portfolioId) as { data: string } | undefined;
    return res.json(stored ? JSON.parse(stored.data) : null);
  }

  try {
    const list = await drive.files.list({
      q: "name = 'immomanager_data.json' and trashed = false",
      fields: "files(id, name)",
      spaces: 'drive'
    });

    if (list.data.files?.length) {
      const fileId = list.data.files[0].id!;
      const file = await drive.files.get({ fileId, alt: 'media' });
      res.json(file.data);
    } else {
      const stored = db.prepare("SELECT data FROM portfolio_data WHERE portfolio_id = ?").get(portfolioId) as { data: string } | undefined;
      res.json(stored ? JSON.parse(stored.data) : null);
    }
  } catch (error) {
    console.error("Drive Read Error; falling back to SQLite:", error);
    const stored = db.prepare("SELECT data FROM portfolio_data WHERE portfolio_id = ?").get(portfolioId) as { data: string } | undefined;
    res.json(stored ? JSON.parse(stored.data) : null);
  }
});

app.post("/api/drive/data", requireAuth, async (req: any, res) => {
  const portfolioId = req.query.portfolioId as string || req.userId;

  // Check access
  let ownerId = portfolioId;
  if (portfolioId !== req.userId) {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.userId) as any;
    const share = db.prepare("SELECT * FROM portfolio_shares WHERE portfolio_id = ? AND user_email = ?")
      .get(portfolioId, user.email) as any;
    if (!share || share.permission !== 'write') return res.status(403).json({ error: "No write access" });
    ownerId = portfolioId;
  }

  const drive = await getDriveClient(ownerId);
  if (!drive) {
    db.prepare("INSERT INTO portfolio_data (portfolio_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(portfolio_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP")
      .run(portfolioId, JSON.stringify(req.body));
    return res.json({ success: true, storage: "sqlite" });
  }

  try {
    const list = await drive.files.list({
      q: "name = 'immomanager_data.json' and trashed = false",
      fields: "files(id, name)",
      spaces: 'drive'
    });

    const media = {
      mimeType: 'application/json',
      body: JSON.stringify(req.body)
    };

    if (list.data.files?.length) {
      const fileId = list.data.files[0].id!;
      await drive.files.update({ fileId, media });
    } else {
      await drive.files.create({
        requestBody: { name: 'immomanager_data.json', mimeType: 'application/json' },
        media
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Drive Write Error; falling back to SQLite:", error);
    db.prepare("INSERT INTO portfolio_data (portfolio_id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(portfolio_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP")
      .run(portfolioId, JSON.stringify(req.body));
    res.json({ success: true, storage: "sqlite" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
