"use client";

import { useState } from "react";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch } from "@/stores/hooks";
import { respondToReview } from "@/stores/slices/onlineStoreSlice";
import type { ProductReview } from "@/types/onlineStore";

export function ReviewResponseModal({ open, review, onClose }: { open: boolean; review?: ProductReview; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [response, setResponse] = useState(review?.adminResponse ?? "");

  if (!review) return null;

  const onSubmit = () => {
    dispatch(respondToReview({ id: review.id, response }));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Respond to Review" subtitle={`${review.customerName} · ${review.productName}`}>
      <div className="flex flex-col gap-5">
        <p className="rounded-xl border border-glass-border bg-white/40 p-3 text-sm text-ink-muted">{review.comment}</p>
        <FormField id="review-response" label="Your response">
          <textarea
            id="review-response"
            rows={3}
            placeholder="Thank the customer or address their feedback…"
            className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit}>
            Send Response
          </Button>
        </div>
      </div>
    </Modal>
  );
}
