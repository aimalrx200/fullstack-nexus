import {
  acquireInventoryHold,
  releaseInventoryHold,
} from "#services/inventoryLockService.js";
import { calculateShippingQuote } from "#services/googleMapsService.js";
import { asyncHandler } from "#utils/asyncHandler.js";

export const holdCheckoutInventory = asyncHandler(async (req, res) => {
  const { items, sessionId, cartId } = req.body;
  const holdResults = [];

  for (const item of items) {
    const result = await acquireInventoryHold({
      variantId: item.variantId,
      sessionId,
      cartId,
      quantity: item.quantity,
    });

    if (!result.success) {
      // Compensating action: release any previously acquired holds
      await releaseInventoryHold(sessionId, cartId);
      return res.status(409).json({ success: false, message: result.message });
    }

    holdResults.push(result);
  }

  return res.status(200).json({
    success: true,
    message: "Stock successfully locked for 10 minutes during checkout.",
    holds: holdResults,
  });
});

export const getShippingQuote = asyncHandler(async (req, res) => {
  const { destinationCity, destinationCoordinates } = req.body;
  const quote = calculateShippingQuote({
    destinationCity,
    destinationCoordinates,
  });
  return res.status(200).json({ success: true, quote });
});
