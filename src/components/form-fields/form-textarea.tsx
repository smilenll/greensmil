import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";

export interface FormTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "ref"> {
  label?: string;
  error?: string;
  hint?: string;
  registration?: UseFormRegisterReturn;
  containerClassName?: string;
}

/**
 * FormTextarea - Reusable textarea component with react-hook-form integration
 *
 * @example
 * <FormTextarea
 *   label="Description"
 *   rows={4}
 *   registration={register('description')}
 *   error={errors.description?.message}
 *   hint="Tell us about your project"
 * />
 */
export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
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
    const textareaId = id || registration?.name || undefined;

    return (
      <FormField
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={textareaId}
        className={containerClassName}
      >
        <Textarea id={textareaId} ref={ref} {...registration} {...props} />
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
