import React from "react";
import { Badge } from "../../common/Badge";

export function PaymentStatusBadge({ status = "pending" }) {
  const cleanStatus = status?.toLowerCase();

  switch (cleanStatus) {
    case "paid":
      return (
        <Badge variant="success" size="sm">
          PAID
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" size="sm" pulse>
          PENDING
        </Badge>
      );
    case "authorized":
      return (
        <Badge variant="brand" size="sm">
          AUTHORIZED
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="glow" size="sm">
          REFUNDED
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="danger" size="sm">
          FAILED
        </Badge>
      );
    default:
      return (
        <Badge variant="default" size="sm">
          {status?.toUpperCase()}
        </Badge>
      );
  }
}
