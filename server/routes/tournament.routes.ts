import type { Express } from "express";
import { IStorage } from "../storage";
import Stripe from "stripe";
import { sanitizeBody } from "../utils/sanitize";
import * as tournamentController from "../controllers/tournament.controller";
import { calcStakeDeposit } from "../utils/stakeDeposits";

export function setupTournamentRoutes(app: Express, storage: IStorage, stripe: Stripe) {
  app.get("/api/matches", tournamentController.getMatches(storage));
  
  // Match creation with auto deposit calculation
  app.post("/api/matches", 
    sanitizeBody(["notes", "description", "title"]), 
    async (req, res) => {
      try {
        const { stake, ...rest } = req.body;
        // Calculate deposit requirements when stake is provided
        let depositInfo = null;
        if (stake && Number(stake) > 0) {
          const stakeAmountCents = Math.round(Number(stake) * 100);
          depositInfo = calcStakeDeposit(stakeAmountCents);
        }
        const matchData = { stake, ...rest };
        const match = await storage.createMatch(matchData);
        res.status(201).json({ match, depositInfo });
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Get deposit requirements for a given stake amount
  app.get("/api/matches/deposit-calc", (req, res) => {
    const stakeAmount = Number(req.query.stake);
    if (!stakeAmount || stakeAmount <= 0) {
      return res.status(400).json({ message: "Invalid stake amount" });
    }
    const stakeAmountCents = Math.round(stakeAmount * 100);
    const deposit = calcStakeDeposit(stakeAmountCents);
    return res.json({
      stake: stakeAmount,
      stakeCents: stakeAmountCents,
      ...deposit,
      depositDollars: (deposit.depositAmount / 100).toFixed(2),
    });
  });

  app.put("/api/matches/:id", 
    sanitizeBody(["notes", "description", "title"]), 
    tournamentController.updateMatch(storage)
  );
  
  app.put("/api/matches/:id", 
    sanitizeBody(["notes", "description", "title"]), 
    tournamentController.updateMatch(storage)
  );
  
  app.get("/api/tournaments", tournamentController.getTournaments(storage));
  
  app.post("/api/tournaments", 
    sanitizeBody(["title", "description", "name", "rules"]), 
    tournamentController.createTournament(storage)
  );
  
  app.put("/api/tournaments/:id", 
    sanitizeBody(["title", "description", "name", "rules"]), 
    tournamentController.updateTournament(storage)
  );
  
  app.get("/api/tournament-calcuttas", tournamentController.getTournamentCalcuttas(storage));
  
  app.get("/api/tournaments/:tournamentId/calcuttas", 
    tournamentController.getTournamentCalcuttasByTournament(storage)
  );
  
  app.post("/api/tournament-calcuttas", 
    sanitizeBody(["description"]), 
    tournamentController.createTournamentCalcutta(storage)
  );
  
  app.put("/api/tournament-calcuttas/:id", 
    sanitizeBody(["description"]), 
    tournamentController.updateTournamentCalcutta(storage)
  );
  
  app.get("/api/calcutta-bids", tournamentController.getCalcuttaBids(storage));
  
  app.get("/api/tournament-calcuttas/:calcuttaId/bids", 
    tournamentController.getCalcuttaBidsByCalcutta(storage)
  );
  
  app.post("/api/calcutta-bids", tournamentController.createCalcuttaBid(storage));
  
  app.get("/api/match-divisions", tournamentController.getMatchDivisions(storage));
  
  app.get("/api/match-divisions/:id", tournamentController.getMatchDivision(storage));
  
  app.post("/api/match-entries", 
    sanitizeBody(["description"]), 
    tournamentController.createMatchEntry(storage, stripe)
  );
  
  app.get("/api/match-entries/:id", tournamentController.getMatchEntry(storage));
  
  app.patch("/api/match-entries/:id", 
    sanitizeBody(["description"]), 
    tournamentController.updateMatchEntry(storage)
  );
  
  app.post("/api/match-entries/:id/complete", 
    tournamentController.completeMatchEntry(storage, stripe)
  );
}
