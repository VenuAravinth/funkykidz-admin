"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { HiOutlineArrowPath, HiOutlineSparkles } from "react-icons/hi2";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormAlert } from "@/components/molecules/FormAlert";
import { analyzeProductImage, type AiProductAnalysis } from "@/features/products/api";

// AI help for the product form (Gemini, through the ERP backend): reads the primary product photo
// and drafts the title, short description, category and visible details — automatically on a new
// product's first photo (once), and again only when the admin asks. Failures never block saving.

export interface ProductAiAssistantProps {
  /** The primary product photo (stored image URL). */
  imageUrl?: string;
  /** Analyse the first uploaded photo without being asked (new products). */
  autoAnalyze: boolean;
  /** "fill" = only fields the admin hasn't touched; "replace" = every field the AI could fill. */
  onApplyDetails: (analysis: AiProductAnalysis, mode: "fill" | "replace") => void;
  getHints: () => Record<string, string>;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
}

export function ProductAiAssistant({ imageUrl, autoAnalyze, onApplyDetails, getHints, onBusyChange, disabled }: ProductAiAssistantProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AiProductAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoDone = useRef(false);

  useEffect(() => onBusyChange(analyzing), [analyzing, onBusyChange]);

  const analyze = async (mode: "fill" | "replace") => {
    if (!imageUrl) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeProductImage(imageUrl, mode === "fill" ? { hints: getHints() } : { regenerate: true });
      setAnalysis(result);
      onApplyDetails(result, mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't analyse the photo.");
    } finally {
      setAnalyzing(false);
    }
  };

  // New product: describe the first photo as soon as it's uploaded (once).
  const autoAnalyzeOnce = useEffectEvent(() => {
    if (!autoAnalyze || autoDone.current) return;
    autoDone.current = true;
    void analyze("fill");
  });
  useEffect(() => {
    if (imageUrl) autoAnalyzeOnce();
  }, [imageUrl]);

  const mode = analysis ? "replace" : "fill";

  return (
    <div className="mt-5 rounded-2xl border border-champagne-300/70 bg-gradient-to-br from-champagne-100/50 to-white/40 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <HiOutlineSparkles className="h-5 w-5 text-champagne-600" aria-hidden />
            AI assistant
          </div>
          <div className="mt-1 text-sm text-ink-muted" aria-live="polite">
            {!imageUrl && "Upload a product photo and AI will draft the title, short description and visible details for you to review."}
            {imageUrl && analyzing && (
              <span className="flex items-center gap-2 text-ink">
                <Spinner size={16} /> Reading the photo and drafting the details… (usually a few seconds)
              </span>
            )}
            {imageUrl && !analyzing && analysis && (
              <span className="text-emerald-700">
                Title, short description and visible details filled from the photo. Review and edit them before saving — gender, fabric,
                size and care are yours to fill.
              </span>
            )}
            {imageUrl && !analyzing && !analysis && "Let AI fill in the product details from the primary photo."}
          </div>
        </div>
        {imageUrl && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => analyze(mode)}
            disabled={analyzing || disabled}
            className="shrink-0"
            title={analysis ? "Replaces the AI-filled fields with a new draft" : undefined}
          >
            {analysis ? <HiOutlineArrowPath className="h-4 w-4" /> : <HiOutlineSparkles className="h-4 w-4" />}
            {analysis ? "Regenerate details" : "Fill details with AI"}
          </Button>
        )}
      </div>

      {error && (
        <FormAlert variant="error" className="mt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error} You can still fill in the details yourself and save.</span>
            <Button type="button" size="sm" variant="secondary" onClick={() => analyze(mode)} disabled={analyzing}>
              Retry
            </Button>
          </div>
        </FormAlert>
      )}

    </div>
  );
}
