import { forwardRef } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Input, type InputProps } from "@/components/atoms/Input";
import { cn } from "@/lib/cn";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>(function SearchInput({ className, ...props }, ref) {
  return (
    <div className={cn("relative w-full sm:w-64 lg:w-72", className)}>
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
      <Input ref={ref} type="search" className="pl-10" {...props} />
    </div>
  );
});
