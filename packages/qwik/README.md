# RevenueHero Qwik SDK

The official RevenueHero SDK for Qwik applications.

## Installation

```bash
npm install @revenuehero/sdk-qwik
```

```bash
yarn add @revenuehero/sdk-qwik
```

```bash
pnpm add @revenuehero/sdk-qwik
```

## Usage

The SDK provides three approaches for integrating RevenueHero with your Qwik forms:

### Method 1: Traditional Forms (Auto-attach)

For traditional HTML forms without Qwik's reactive form handling:

```tsx
import { component$ } from '@builder.io/qwik';
import { RevenueHero } from '@revenuehero/sdk-qwik';

export default component$(() => {
  return (
    <div>
      <form id="contact-form">
        <input type="email" name="email" required />
        <input type="text" name="firstName" required />
        <button type="submit">Submit</button>
      </form>

      <RevenueHero
        enabled={true}
        routerId="your-router-id"
        formId="#contact-form"
        showLoader={true}
      />
    </div>
  );
});
```

### Method 2: Qwik Reactive Forms (Manual)

For Qwik forms with `preventdefault:submit` or reactive form libraries:

```tsx
import { component$, $ } from '@builder.io/qwik';
import { useRevenueHero } from '@revenuehero/sdk-qwik';

export default component$(() => {
  const submitToRevenueHero = useRevenueHero({ 
    routerId: 'your-router-id',
    showLoader: true 
  });

  const handleSubmit = $((event: SubmitEvent, form: HTMLFormElement) => {
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Your custom form logic here
    console.log('Form submitted:', data);
    
    // Submit to RevenueHero
    submitToRevenueHero(data)
      .then((response) => {
        console.log('RevenueHero response:', response);
        // Dialog opens automatically
      })
      .catch((error) => {
        console.error('RevenueHero error:', error);
      });
  });

  return (
    <form 
      id="qwik-form" 
      preventdefault:submit
      onSubmit$={handleSubmit}
    >
      <input type="email" name="email" required />
      <input type="text" name="firstName" required />
      <button type="submit">Submit</button>
    </form>
  );
});
```

### Method 3: With Modular Forms

For [@modular-forms/qwik](https://modularforms.dev/) integration:

```tsx
import { component$ } from '@builder.io/qwik';
import { useForm, type SubmitHandler } from '@modular-forms/qwik';
import { useRevenueHero } from '@revenuehero/sdk-qwik';

type ContactForm = {
  email: string;
  firstName: string;
};

export default component$(() => {
  const [contactForm, { Form, Field }] = useForm<ContactForm>({
    loader: useFormLoader(),
  });

  const submitToRevenueHero = useRevenueHero({ 
    routerId: 'your-router-id' 
  });

  const handleSubmit: SubmitHandler<ContactForm> = $((values) => {
    // Process with Modular Forms
    console.log('Form values:', values);
    
    // Submit to RevenueHero
    submitToRevenueHero(values);
  });

  return (
    <Form onSubmit$={handleSubmit}>
      <Field name="email">
        {(field, props) => (
          <input {...props} type="email" placeholder="Email" />
        )}
      </Field>
      
      <Field name="firstName">
        {(field, props) => (
          <input {...props} type="text" placeholder="First Name" />
        )}
      </Field>
      
      <button type="submit">Submit</button>
    </Form>
  );
});
```

## API Reference

### RevenueHero Component

The main component for traditional form integration.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `enabled` | `boolean` | No | `false` | Whether to enable RevenueHero |
| `routerId` | `string` | Yes | - | Your RevenueHero router ID |
| `formId` | `string` | No | - | CSS selector for the form to attach to |
| `embedTarget` | `string` | No | - | CSS selector for where to embed the scheduler |
| `formType` | `'pardot' \| 'jotForm'` | No | - | Specific form type for custom handling |
| `greetingText` | `string` | No | - | Custom greeting text |
| `locale` | `string` | No | - | Locale for the scheduler |
| `showLoader` | `boolean` | No | `true` | Whether to show loading indicator |
| `onLoad` | `() => void` | No | - | Callback when SDK is loaded |

### useRevenueHero Hook

Hook for manual form submission integration.

#### Parameters

```tsx
const submitToRevenueHero = useRevenueHero({
  routerId: string;           // Required: Your router ID
  formType?: 'pardot' | 'jotForm';
  greetingText?: string;
  locale?: string;
  showLoader?: boolean;       // Default: true
});
```

#### Returns

A function that submits form data to RevenueHero:

```tsx
(formData: Record<string, any>) => Promise<any>
```

## Why Three Methods?

**Method 1 (Traditional)** works great for standard HTML forms where RevenueHero can attach event listeners directly.

**Method 2 (Manual)** is needed for Qwik's reactive forms because:

- Qwik uses `preventdefault:submit` which prevents traditional form submission
- RevenueHero's event listeners can't intercept the form data
- Manual submission gives you full control over when and how RevenueHero is triggered

**Method 3 (Modular Forms)** is the same as Method 2 but shows the specific integration pattern for the popular Modular Forms library.

## Error Handling

```tsx
const handleSubmit = $((event: SubmitEvent, form: HTMLFormElement) => {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  submitToRevenueHero(data)
    .then((response) => {
      // Success - dialog opens automatically
      console.log('Success:', response);
    })
    .catch((error) => {
      // Handle errors
      if (error.message === 'RevenueHero not loaded') {
        console.error('SDK failed to load');
      } else {
        console.error('Submission failed:', error);
      }
    });
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type safety:

```tsx
import type { IRevenueHeroParams, IRevenueHeroProps } from '@revenuehero/sdk-qwik';
```

## Examples

Check out our [demo application](https://github.com/revenuehero/sdk/tree/main/packages/qwik-demo-app) for complete working examples.

## Support

- [Documentation](https://docs.revenuehero.io)
- [GitHub Issues](https://github.com/revenuehero/sdk/issues)
- [Contact Support](mailto:support@revenuehero.io)

## License

MIT License - see [LICENSE](../../LICENSE) for details.