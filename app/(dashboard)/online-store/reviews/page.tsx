"use client";

import { useState } from "react";
import { HiOutlineStar, HiOutlineCheckCircle, HiOutlineEyeSlash, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatTile } from "@/components/molecules/StatTile";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { IconButton } from "@/components/atoms/IconButton";
import { DeleteButton } from "@/components/molecules/DeleteButton";
import { Table, TableHead, TableBody, TableRow, Th, Td, TableEmpty } from "@/components/atoms/Table";
import { ReviewResponseModal } from "@/components/organisms/ReviewResponseModal";
import { formatDate } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { deleteReview, selectProductReviews, setReviewStatus } from "@/stores/slices/onlineStoreSlice";
import type { ProductReview } from "@/types/onlineStore";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-champagne-500">
      {Array.from({ length: 5 }, (_, i) => (
        <HiOutlineStar key={i} className={i < rating ? "h-4 w-4 fill-current" : "h-4 w-4 text-ink-muted/40"} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  const reviews = useAppSelector(selectProductReviews);
  const [responding, setResponding] = useState<ProductReview | undefined>(undefined);

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate product reviews from online customers." backHref="/online-store" backLabel="Online Store" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
        <StatTile label="Average Rating" value={avgRating.toFixed(1)} icon={<HiOutlineStar className="h-5 w-5" />} tone="champagne" />
        <StatTile label="Total Reviews" value={String(reviews.length)} icon={<HiOutlineChatBubbleLeftRight className="h-5 w-5" />} tone="sky" />
        <StatTile label="Pending Approval" value={String(pending)} icon={<HiOutlineEyeSlash className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="my-5" />

      <Table stickyActions>
        <TableHead>
          <TableRow>
            <Th>Product</Th>
            <Th>Customer</Th>
            <Th>Rating</Th>
            <Th>Comment</Th>
            <Th>Status</Th>
            <Th>Date</Th>
            <Th className="text-right">Actions</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          {reviews.length === 0 && <TableEmpty colSpan={7} message="No reviews yet." />}
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <Td className="font-medium text-ink">{review.productName}</Td>
              <Td>{review.customerName}</Td>
              <Td>
                <Stars rating={review.rating} />
              </Td>
              <Td className="max-w-xs whitespace-normal text-ink-muted">
                {review.comment}
                {review.adminResponse && <div className="mt-1 text-xs italic text-champagne-700">Reply: {review.adminResponse}</div>}
              </Td>
              <Td>
                <StatusBadge status={review.status} />
              </Td>
              <Td>{formatDate(review.createdDate)}</Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  {review.status !== "approved" && (
                    <IconButton label="Approve" onClick={() => dispatch(setReviewStatus({ id: review.id, status: "approved" }))}>
                      <HiOutlineCheckCircle className="h-4 w-4" />
                    </IconButton>
                  )}
                  {review.status !== "hidden" && (
                    <IconButton label="Hide" onClick={() => dispatch(setReviewStatus({ id: review.id, status: "hidden" }))}>
                      <HiOutlineEyeSlash className="h-4 w-4" />
                    </IconButton>
                  )}
                  <IconButton label="Respond" onClick={() => setResponding(review)}>
                    <HiOutlineChatBubbleLeftRight className="h-4 w-4" />
                  </IconButton>
                  <DeleteButton
                    itemLabel={`review from ${review.customerName}`}
                    description="This will permanently remove this review. This action cannot be undone."
                    onDelete={() => dispatch(deleteReview(review.id))}
                  />
                </div>
              </Td>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReviewResponseModal key={responding?.id ?? "none"} open={!!responding} review={responding} onClose={() => setResponding(undefined)} />
    </div>
  );
}
