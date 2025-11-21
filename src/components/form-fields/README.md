# Form Field Components

Reusable form components that integrate seamlessly with `react-hook-form` for consistent styling and validation across the application.

## Components

### FormInput

Text input component with label, error, and hint support.

```tsx
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/form-fields';

function MyForm() {
  const { register, formState: { errors }, handleSubmit } = useForm();

  return (
    <FormInput
      label="Email"
      type="email"
      placeholder="you@example.com"
      required
      hint="We'll never share your email"
      registration={register('email', {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address'
        }
      })}
      error={errors.email?.message}
    />
  );
}
```

**Props:**
- `label` - Label text
- `error` - Error message from form validation
- `hint` - Helper text (hidden when error is shown)
- `required` - Shows asterisk next to label
- `registration` - react-hook-form register return value
- `containerClassName` - Additional classes for the wrapper div
- All standard HTML input attributes

### FormTextarea

Textarea component with label, error, and hint support.

```tsx
import { FormTextarea } from '@/components/form-fields';

<FormTextarea
  label="Message"
  rows={6}
  placeholder="Tell us about your project..."
  required
  hint="Maximum 1000 characters"
  registration={register('message', {
    required: 'Message is required',
    maxLength: {
      value: 1000,
      message: 'Message must not exceed 1000 characters'
    }
  })}
  error={errors.message?.message}
/>
```

**Props:**
- Same as FormInput, plus all standard HTML textarea attributes
- `rows` - Number of visible text lines

### FormField

Low-level wrapper component for custom inputs.

```tsx
import { FormField } from '@/components/form-fields';
import { Input } from '@/components/ui/input';

<FormField
  label="Custom Field"
  error={errors.custom?.message}
  hint="This is a hint"
  required
  htmlFor="custom-field"
>
  <Input
    id="custom-field"
    {...register('custom')}
  />
</FormField>
```

## Best Practices

### 1. Always use with react-hook-form

```tsx
const { register, formState: { errors } } = useForm({
  mode: 'onTouched', // Validate on blur for better UX
  defaultValues: {
    email: '',
    password: '',
  },
});
```

### 2. Pass validation through register

```tsx
<FormInput
  registration={register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  })}
  error={errors.email?.message}
/>
```

### 3. Disable during submission

```tsx
const { isSubmitting } = formState;

<FormInput
  label="Email"
  registration={register('email')}
  disabled={isSubmitting}
/>
```

### 4. Use hints for guidance

```tsx
<FormInput
  label="Password"
  type="password"
  hint="At least 8 characters with uppercase, lowercase, number and special character"
  registration={register('password')}
  error={errors.password?.message}
/>
```

## Complete Example

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { FormInput, FormTextarea } from '@/components/form-fields';
import { Button } from '@/components/ui/button';

interface ContactData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactData) => {
    // Handle submission
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Name"
        required
        registration={register('name', {
          required: 'Name is required',
          minLength: { value: 2, message: 'Name must be at least 2 characters' },
        })}
        error={errors.name?.message}
        disabled={isSubmitting}
      />

      <FormInput
        label="Email"
        type="email"
        required
        registration={register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <FormTextarea
        label="Message"
        rows={4}
        required
        hint="Tell us what you need"
        registration={register('message', {
          required: 'Message is required',
          minLength: { value: 10, message: 'Message must be at least 10 characters' },
        })}
        error={errors.message?.message}
        disabled={isSubmitting}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

## Benefits

✅ **Consistent UI** - All forms look and behave the same way
✅ **Less Code** - No need to repeat label/error/hint markup
✅ **Type Safe** - Full TypeScript support
✅ **Accessible** - Proper ARIA attributes and label associations
✅ **Flexible** - Easy to extend or customize
✅ **DRY** - Don't repeat yourself
