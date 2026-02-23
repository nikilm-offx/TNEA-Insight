import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import digiLockerRoutes from "./digilocker/routes";
import adminRoutes from "./admin/routes";
// import OpenAI from "openai";
// OpenAI integration disabled
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  // Blueprint: javascript_auth_all_persistance integration
  setupAuth(app);

  // Register DigiLocker routes
  app.use(digiLockerRoutes);

  // Register admin routes
  app.use(adminRoutes);

  // College and suggestion routes
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getAllColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch colleges" });
    }
  });

  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getAllBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  });

  app.post("/api/college-suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { marks, category, preferences } = req.body;
      const suggestions = await storage.getCollegeSuggestions(
        parseFloat(marks), 
        category, 
        preferences
      );
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get college suggestions" });
    }
  });

  // Historical data routes
  app.get("/api/placement-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await storage.getPlacementHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch placement history" });
    }
  });

  app.get("/api/cutoff-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { collegeId, branchId } = req.query;
      const history = await storage.getCutoffHistory(
        collegeId as string, 
        branchId as string
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cutoff history" });
    }
  });

  // Chat/AI assistant routes
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { message, language = "en" } = req.body;
      const userId = req.user!.id;

      const chatbotUrl = process.env.CHATBOT_SERVICE_URL || "http://127.0.0.1:8000/chat";

      // Proxy to Python FastAPI chatbot microservice.
      // If the microservice is not running, fall back to a safe static response
      // so the TNEA web app can run standalone.
      let chatbotPayload: any = null;
      let aiResponse: string | null = null;

      try {
        // Forward cookies so the microservice can call internal authenticated /api/* endpoints if needed.
        const r = await fetch(chatbotUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
            ...(req.headers.authorization ? { authorization: req.headers.authorization as string } : {}),
          },
          body: JSON.stringify({
            user_id: userId,
            session_id: req.sessionID,
            message,
            language,
          }),
        });

        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Chatbot service error (${r.status}): ${text}`);
        }

        chatbotPayload = await r.json();
        aiResponse =
          chatbotPayload?.response_text ||
          (language === "ta"
            ? "மன்னிக்கவும்—தற்சமயம் பதில் வழங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "Sorry—I couldn’t generate a response right now. Please try again.");
      } catch (proxyErr) {
        // Standalone mode: chatbot microservice not available
        chatbotPayload = null;
        aiResponse =
          language === "ta"
            ? "Chatbot சேவை தற்போது இயங்கவில்லை. அடிப்படை உதவி மட்டும் வழங்கப்படும். (Standalone mode)"
            : "Chatbot service is not running. Providing basic help only. (Standalone mode)";
      }

      // Save chat message to database
      await storage.saveChatMessage({
        userId,
        message,
        response: aiResponse,
        language
      });

      // Backwards compatible shape: keep `response` while returning structured payload for the UI.
      res.json({ response: aiResponse, ...(chatbotPayload || {}) });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get("/api/chat-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const history = await storage.getChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Application management routes (for students)
  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { marks, category, documents } = req.body;
      
      // Generate application number
      const applicationNumber = `TN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const application = await storage.createApplication({
        userId,
        applicationNumber,
        marks: parseFloat(marks),
        category,
        documents,
        status: "submitted"
      });
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      let applications;
      if (userRole === "admin") {
        applications = await storage.getAllApplications();
      } else {
        applications = await storage.getApplicationsByUser(userId);
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Cutoff prediction route (simple ML regression)
  app.post("/api/predict-cutoff", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { marks, category, collegeId, branchId } = req.body;
      
      // Get historical cutoff data for prediction
      const history = await storage.getCutoffHistory(collegeId, branchId);
      
      if (history.length === 0) {
        return res.json({ 
          prediction: null, 
          confidence: 0,
          message: "No historical data available for prediction" 
        });
      }

      // Simple linear regression prediction based on recent trends
      const recentData = history.slice(0, 5); // Last 5 years
      const categoryField = `${category}Cutoff`;
      const cutoffs = recentData
        .map(h => h[categoryField])
        .filter(c => c !== null)
        .map(c => parseFloat(c));

      if (cutoffs.length === 0) {
        return res.json({ 
          prediction: null, 
          confidence: 0,
          message: "No cutoff data available for this category" 
        });
      }

      // Calculate average and trend
      const avgCutoff = cutoffs.reduce((a, b) => a + b, 0) / cutoffs.length;
      const trend = cutoffs.length > 1 ? (cutoffs[0] - cutoffs[cutoffs.length - 1]) / cutoffs.length : 0;
      
      // Predict next year's cutoff
      const predictedCutoff = avgCutoff + trend;
      const confidence = Math.min(0.9, Math.max(0.3, 1 - (Math.abs(trend) / avgCutoff)));
      
      // Calculate admission probability
      const admissionProbability = marks > predictedCutoff ? 
        Math.min(0.95, 0.5 + ((marks - predictedCutoff) / predictedCutoff)) : 
        Math.max(0.05, (marks / predictedCutoff) * 0.5);

      res.json({
        prediction: Math.round(predictedCutoff * 10) / 10,
        confidence: Math.round(confidence * 100),
        admissionProbability: Math.round(admissionProbability * 100),
        trend: trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable",
        basedOnYears: cutoffs.length
      });
    } catch (error) {
      console.error("Cutoff prediction error:", error);
      res.status(500).json({ error: "Failed to predict cutoff" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
