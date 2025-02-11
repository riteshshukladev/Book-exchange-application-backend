// src/utils/sse.js
import { db } from "../config/database.js";
import { eq, or } from "drizzle-orm";
import { exchange } from "../db/schema.js";

// This array holds all connected SSE clients.
let sseClients = [];

// Add a new SSE client.
export function addClient(client) {
  sseClients.push(client);
}

// Remove a client by its id.
export function removeClient(clientId) {
  sseClients = sseClients.filter((client) => client.id !== clientId);
}

// Broadcast a generic SSE event to all connected clients.
export function broadcastNotification(data) {
  sseClients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

/**
 * Helper: Calculate exchange counts for a given user's email.
 * Returns an object like:
 * { total: number, pending: number, accepted: number, declined: number }
 */
export async function calculateExchangeCounts(email) {
  // Get all exchange records where the user is either owner or requester.
  const results = await db.query.exchange.findMany({
    where: or(
      eq(exchange.ownerEmail, email),
      eq(exchange.requesterEmail, email)
    ),
  });
  const total = results.length;
  const pending = results.filter((r) => r.status === "pending").length;
  const accepted = results.filter((r) => r.status === "approved").length;
  const declined = results.filter((r) => r.status === "declined").length;
  return { total, pending, accepted, declined };
}

/**
 * Broadcast the latest exchange counts to each connected client,
 * calculating the counts based on the stored client email.
 */
export async function broadcastExchangeCounts() {
  for (const client of sseClients) {
    if (client.email) {
      const counts = await calculateExchangeCounts(client.email);
      // Send a custom SSE event (e.g., event: "exchange-counts") with the counts.
      client.res.write(
        `data: ${JSON.stringify({
          event: "exchange-counts",
          data: counts,
        })}\n\n`
      );
    }
  }
}
/**
 * Broadcast the latest exchange counts to a specific client.
 * @param {string} email - The email of the client to broadcast to.
 * @param {object} counts - The exchange counts to broadcast.
 */
export function broadcastExchangeCountsWithParams(email, counts) {
  const client = sseClients.find((client) => client.email === email);
  if (client) {
    client.res.write(
      `data: ${JSON.stringify({ event: "exchange-counts", data: counts })}\n\n`
    );
  }
}
