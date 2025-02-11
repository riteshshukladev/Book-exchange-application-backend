import { db } from "../config/database.js";
import { exchange } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { calculateExchangeCounts, broadcastExchangeCountsWithParams } from "./sse.js";

/**
 *
 * Schedules deletion of an exchange record after a specified delay.
 * @param {number} exchangeId - The ID of the exchange record to delete.
 * @param {number} [delay=600000] - The delay in milliseconds (default is 10 minutes).
 */

export const scheduleExchangeDeletion = (
  exchangeId,
  delay = 1000
) => {
  setTimeout(async () => {
    try {

      const exchangeRecord = await db.query.exchange.findFirst({ 
        where:eq(exchange.id, exchangeId)
      })

      if (!exchangeRecord) {
        console.error(`Exchange record ${exchangeId} not found.`);
        return;
      }

      await db.delete(exchange).where(eq(exchange.id, exchangeId))

      const requesterEmail = exchangeRecord.requesterEmail;
      const ownerEmail = exchangeRecord.ownerEmail;

      const requesterCounts = await calculateExchangeCount(requesterEmail);
      const ownerCounts = await calculateExchangeCount(ownerEmail);

      

      broadcastExchangeCountsWithParams(requesterEmail, requesterCounts);
      broadcastExchangeCountsWithParams(ownerEmail, ownerCounts);
      
    } catch (error) {
      console.error("Error removing exchange record:", error);
    }


  }, delay);


};
