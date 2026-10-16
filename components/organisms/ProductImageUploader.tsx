"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { HiOutlineArrowUpTray, HiOutlineStar, HiOutlineTrash } from "react-icons/hi2";
import { ProductThumbnail } from "@/components/molecules/ProductThumbnail";
import { FormAlert } from "@/components/molecules/FormAlert";
import { IconButton } from "@/components/atoms/IconButton";
import { Spinner } from "@/components/atoms/Spinner";
import { ACCEPTED_IMAGE_TYPES, uploadProductImage, validateImageFile } from "@/features/products/api";
import { MAX_PRODUCT_IMAGES } from "@/features/products/schema";
import { useSignedImageUrls } from "@/features/products/useSignedImageUrls";

export interface ProductImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export function ProductImageUploader({ value, onChange, onUploadingChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const { signed, error: signError } = useSignedImageUrls(value);
  const remaining = MAX_PRODUCT_IMAGES - value.length;

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const problems: string[] = [];
    if (files.length > remaining) problems.push(`Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added.`);
    const valid = files.slice(0, Math.max(remaining, 0)).filter((file) => {
      const problem = validateImageFile(file);
      if (problem) problems.push(problem);
      return !problem;
    });
    setErrors(problems);
    if (valid.length === 0) return;

    setUploadingCount(valid.length);
    onUploadingChange?.(true);
    const results = await Promise.allSettled(valid.map(uploadProductImage));
    const uploaded = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const failed = results.flatMap((r) => (r.status === "rejected" ? [r.reason instanceof Error ? r.reason.message : "Upload failed."] : []));
    setErrors((prev) => [...prev, ...failed]);
    setUploadingCount(0);
    onUploadingChange?.(false);
    if (uploaded.length) onChange([...value, ...uploaded]);
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));
  const makePrimary = (url: string) => onChange([url, ...value.filter((u) => u !== url)]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url} className="group relative">
            <ProductThumbnail src={signed[url]} alt={`Product image ${index + 1}`} className="h-24 w-24" />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-white">Primary</span>
            )}
            <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {index > 0 && (
                <IconButton label="Make primary image" onClick={() => makePrimary(url)} size="sm" className="bg-white/90">
                  <HiOutlineStar className="h-3.5 w-3.5" />
                </IconButton>
              )}
              <IconButton label="Remove image" onClick={() => remove(url)} size="sm" className="bg-white/90 hover:text-red-600">
                <HiOutlineTrash className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </div>
        ))}

        {Array.from({ length: uploadingCount }, (_, i) => (
          <div key={`uploading-${i}`} className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-glass-border bg-white/40">
            <Spinner size={20} />
          </div>
        ))}

        {remaining > 0 && uploadingCount === 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-champagne-500/60 bg-white/40 text-xs font-medium text-champagne-700 transition-colors hover:bg-white/70"
          >
            <HiOutlineArrowUpTray className="h-5 w-5" />
            Upload
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} multiple hidden onChange={handleFiles} />
      <p className="text-xs text-ink-muted">
        JPG, PNG or WebP, up to 10 MB each · {value.length}/{MAX_PRODUCT_IMAGES} images · the first image is shown as the primary.
      </p>

      {(errors.length > 0 || signError) && (
        <FormAlert variant="error">
          {[...errors, ...(signError ? [signError] : [])].map((msg) => (
            <div key={msg}>{msg}</div>
          ))}
        </FormAlert>
      )}
    </div>
  );
}
