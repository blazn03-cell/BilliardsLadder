import type { Express } from "express";
import { IStorage } from "../storage";
import { sanitizeBody } from "../utils/sanitize";
import * as playerController from "../controllers/player.controller";
import { isAuthenticated } from "../replitAuth";

export function setupPlayerRoutes(app: Express, storage: IStorage) {
  app.get("/api/players", isAuthenticated, playerController.getPlayers(storage));

  app.post("/api/players",
    isAuthenticated,
    sanitizeBody(["name", "username", "notes", "bio"]),
    playerController.createPlayer(storage)
  );

  app.put("/api/players/:id",
    isAuthenticated,
    sanitizeBody(["name", "username", "notes", "bio"]),
    playerController.updatePlayer(storage)
  );

  app.delete("/api/players/:id", isAuthenticated, playerController.deletePlayer(storage));

  app.post("/api/players/graduate", isAuthenticated, playerController.graduatePlayer(storage));

  app.get("/api/birthday-players", isAuthenticated, playerController.getBirthdayPlayers(storage));
}
