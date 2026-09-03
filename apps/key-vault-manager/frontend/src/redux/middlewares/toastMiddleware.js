// src/redux/middlewares/toastMiddleware.js

import { toast } from "sonner";
import { triggerToast } from "../slices/notificationSlice";

export const toastMiddleware = () => (next) => (action) => {
  const isRejected = action.type?.endsWith("/rejected");
  const isExplicitToast = triggerToast.match(action);

  if (isRejected || isExplicitToast) {
    let message = "An unexpected error occurred.";
    let toastType = "error";
    let description = undefined;
    let duration = undefined;

    if (isExplicitToast) {
      // 🟢 Explicitly triggered via dispatch(triggerToast({...}))
      message = action.payload?.message || message;
      toastType = action.payload?.type || "info";
      description = action.payload?.description;
      duration = action.payload?.duration;
    } else if (isRejected) {
      // 🟢 Intercepted Redux Toolkit /rejected async actions
      toastType = "error";

      if (typeof action.payload === "string") {
        message = action.payload;
      } else if (action.payload?.message) {
        message = action.payload.message;
        description = action.payload?.description;
      } else if (action.error?.message) {
        message = action.error.message;
      }
    }

    // Sonner deduplication via unique signature ID
    const signature = `${toastType}:${message}:${description || ""}`;
    const options = {
      id: signature,
      ...(description && { description }),
      ...(duration && { duration }),
    };

    // Render corresponding Sonner toast variant
    switch (toastType) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      case "info":
      default:
        toast.info(message, options);
        break;
    }
  }

  return next(action);
};
