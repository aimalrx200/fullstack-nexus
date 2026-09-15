// Pre-load audio assets located in public/audio/
const orderChimeAudio =
  typeof Audio !== "undefined" ? new Audio("/audio/order-chime.mp3") : null;
const messageAlertAudio =
  typeof Audio !== "undefined" ? new Audio("/audio/message-alert.mp3") : null;

if (orderChimeAudio) orderChimeAudio.volume = 0.75;
if (messageAlertAudio) messageAlertAudio.volume = 0.6;

/**
 * Plays order chime notification safely (ignoring user gesture browser blocks)
 */
export const playOrderChime = () => {
  if (!orderChimeAudio) return;
  orderChimeAudio.currentTime = 0;
  orderChimeAudio.play().catch(() => {
    // Silently ignore browser autoplay security blocks until user interacts with DOM
  });
};

/**
 * Plays customer support message alert
 */
export const playMessageAlert = () => {
  if (!messageAlertAudio) return;
  messageAlertAudio.currentTime = 0;
  messageAlertAudio.play().catch(() => {});
};
