// src/routes/exchangeBookRoute.js
import { Router } from "express";
import {
  BookExchangeIntializer,
  fetchExchangeDetails,
  declineBookExchange,
  approveBookExchange,
} from "../controllers/BookExchangeController.js";
import { addClient, removeClient } from "../utils/sse.js";
import { calculateExchangeCounts } from "../utils/sse.js";

const exchangeRouter = Router();

exchangeRouter.post('/exchange-books', BookExchangeIntializer);
exchangeRouter.get('/exchanges', fetchExchangeDetails);
exchangeRouter.post('/decline-exchange', declineBookExchange);
exchangeRouter.post('/accept-exchange', approveBookExchange);

// SSE endpoint for real-time notifications and counts.
exchangeRouter.get('/notifications', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  // Use a unique id and also store the authenticated user's email.
  const clientId = Date.now();
  const newClient = { id: clientId, res, email: req.user.email };
  addClient(newClient);
  console.log(`SSE client ${clientId} connected for user ${req.user.email}`);


  calculateExchangeCounts(req.user.email)
    .then((counts) => {
      res.write(
        `data: ${JSON.stringify({ event: "exchange-counts", data: counts })}\n\n`
      );
    })
    .catch((err) => {
      console.error("Error calculating initial counts:", err);
    });

  req.on('close', () => {
    console.log(`SSE client ${clientId} disconnected`);
    removeClient(clientId);
  });
});

export default exchangeRouter;
