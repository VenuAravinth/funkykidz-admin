import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Checkbox } from "@/components/atoms/Checkbox";
import { cn } from "@/lib/cn";

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: ReactNode;
  labelClassName?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField(
  { id, label, labelClassName, ...props },
  ref,
) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} ref={ref} {...props} />
      <label htmlFor={id} className={cn("cursor-pointer text-sm text-ink-muted select-none", labelClassName)}>
        {label}
      </label>
    </div>
  );
});
