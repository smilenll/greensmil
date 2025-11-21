import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";

export interface FormInputProps
  extends Omit<React.ComponentProps<"input">, "ref"> {
  label?: string;
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
  containerClassName?: string;
}

/**
 * FormInput - Reusable input component with react-hook-form integration
 *
 * @example
 * // Basic usage
 * <FormInput
 *   label="Email"
 *   type="email"
 *   registration={register('email')}
 *   error={errors.email?.message}
 * />
 *
 * @example
 * // With hint and required
 * <FormInput
 *   label="Password"
 *   type="password"
 *   required
 *   hint="At least 8 characters"
 *   registration={register('password')}
 *   error={errors.password?.message}
 * />
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      registration,
      containerClassName,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || registration?.name || undefined;

    return (
      <FormField
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={inputId}
        className={containerClassName}
      >
        <Input id={inputId} ref={ref} {...registration} {...props} />
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";
