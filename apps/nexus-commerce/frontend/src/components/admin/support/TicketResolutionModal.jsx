import React, { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";

export function TicketResolutionModal({
  isOpen,
  onClose,
  ticket,
  onResolve,
  isLoading,
}) {
  const [status, setStatus] = useState(ticket?.status || "resolved");
  const [adminNotes, setAdminNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onResolve({
      ticketId: ticket?._id,
      status,
      adminNotes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Support Ticket"
      description={`Ticket #${ticket?.ticketNumber || "TKT"} • ${ticket?.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Update Ticket Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
          >
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-muted">
            Internal Agent Resolution Notes
          </label>
          <textarea
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Document resolution or follow-up details..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs resize-none focus:outline-hidden focus:border-brand-primary"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={CheckCircle2}
            isLoading={isLoading}
          >
            Update Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
