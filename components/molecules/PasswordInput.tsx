"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Input, type InputProps } from "@/components/atoms/Input";
import { IconButton } from "@/components/atoms/IconButton";
import { cn } from "@/lib/cn";

export type PasswordInputProps = Omit<InputProps, "type"> & Pick<InputHTMLAttributes<HTMLInputElement>, "autoComplete">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-11!", className)} {...props} />
      <IconButton
        label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2"
      >
        {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </IconButton>
    </div>
  );
});
