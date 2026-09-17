import { useSelector, useDispatch } from "react-redux";
import {
  pushLiveOrder,
  updateLiveOrderStatus,
  toggleSoundAlerts,
  clearLiveStream,
} from "../redux/slices/adminStreamSlice";
import {
  selectLiveOrders,
  selectLiveOrderCount,
  selectSoundAlertsEnabled,
} from "../redux/selectors/adminSelectors";
import { useRealTimeStream } from "./useRealTimeStream";
import { playOrderChime } from "../services/soundEffects";

export function useAdminOrderStream() {
  const dispatch = useDispatch();

  const liveOrders = useSelector(selectLiveOrders);
  const orderCount = useSelector(selectLiveOrderCount);
  const soundAlertsEnabled = useSelector(selectSoundAlertsEnabled);

  // Bind real-time stream (SSE in Production / Socket.io in Dev)
  const { isConnected } = useRealTimeStream({
    channelType: "admin",
    events: {
      "order:new": (order) => {
        dispatch(pushLiveOrder(order));
        if (soundAlertsEnabled) {
          playOrderChime();
        }
      },
      "order:status_updated": (data) => {
        dispatch(updateLiveOrderStatus(data));
      },
    },
  });

  return {
    liveOrders,
    orderCount,
    soundAlertsEnabled,
    isConnected,
    toggleSound: () => dispatch(toggleSoundAlerts()),
    clearStream: () => dispatch(clearLiveStream()),
  };
}
