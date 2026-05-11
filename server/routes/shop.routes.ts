import type { Express } from "express";
import {
  getPlayerCredits,
  getShopItems,
  purchaseShopItem,
  getPlayerBadges,
  getDailyMissionsHandler,
} from "../controllers/shop.controller";

export function setupShopRoutes(app: Express) {
  app.get("/api/player/credits", getPlayerCredits);
  app.get("/api/player/shop", getShopItems);
  app.post("/api/player/shop/purchase", purchaseShopItem);
  app.get("/api/player/badges", getPlayerBadges);
  app.get("/api/player/daily-missions", getDailyMissionsHandler);
}
