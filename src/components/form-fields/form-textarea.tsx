import * as React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";
import { Editor } from "@tinymce/tinymce-react";

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
  FormTextareaProps & { editor?: boolean; value?: string }
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
      editor,
      disabled,
      placeholder,
      value,
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
        {editor ? (
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TEXT_EDITOR}
            id={textareaId}
            disabled={disabled}
            init={{
              plugins: [
                // Core editing features
                "anchor",
                "autolink",
                "charmap",
                "codesample",
                "emoticons",
                "link",
                "lists",
                "media",
                "searchreplace",
                "table",
                "visualblocks",
                "wordcount",
                // Your account includes a free trial of TinyMCE premium features
                // Try the most popular premium features until Dec 5, 2025:
                "checklist",
                "mediaembed",
                "casechange",
                "formatpainter",
                "pageembed",
                "a11ychecker",
                "tinymcespellchecker",
                "permanentpen",
                "powerpaste",
                "advtable",
                "advcode",
                "advtemplate",
                "uploadcare",
                "mentions",
                "tinycomments",
                "tableofcontents",
                "footnotes",
                "mergetags",
                "autocorrect",
                "typography",
                "inlinecss",
                "markdown",
                "importword",
                "exportword",
                "exportpdf",
              ],
              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
              tinycomments_mode: "embedded",
              tinycomments_author: "Author name",
              mergetags_list: [
                { value: "First.Name", title: "First Name" },
                { value: "Email", title: "Email" },
              ],
              uploadcare_public_key: "34cf7196c12cfd6ca7d9",
              placeholder: placeholder,
            }}
            initialValue={value || ""}
            onEditorChange={(content) => {
              registration?.onChange({
                target: {
                  name: registration.name,
                  value: content,
                },
              });
            }}
            onBlur={registration?.onBlur}
          />
        ) : (
          <Textarea id={textareaId} ref={ref} {...registration} {...props} disabled={disabled} placeholder={placeholder} />
        )}
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";
