# GreenSMiL Portfolio & Web Platform

A modern full-stack portfolio and web platform built with Next.js, AWS Amplify, and shadcn/ui.

**Live Site**: [greensmil.com](https://greensmil.com)

## 📋 Active Tasks

### Contact Form Email Delivery Issue (Priority: HIGH)
**Problem**: Contact form returns 500 error on production. Emails not arriving at web@greensmil.com

**Root Cause**: Environment variables not properly configured in AWS Amplify Console for Next.js SSR runtime

**Action Items**:
- [ ] Update local .env: `RESEND_TO_EMAIL=web@greensmil.com` (currently set to smilenlyubenov@gmail.com)
- [ ] Set environment variables in AWS Amplify Console → Environment variables:
  - `RESEND_API_KEY` - Get from Resend dashboard
  - `RESEND_FROM_EMAIL=noreply@greensmil.com`
  - `RESEND_TO_EMAIL=web@greensmil.com`
  - `RECAPTCHA_SECRET_KEY` - Get from Google reCAPTCHA console
  - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Get from Google reCAPTCHA console
- [ ] Verify greensmil.com domain is verified at https://resend.com/domains
- [ ] Redeploy application in Amplify Console
- [ ] Test contact form on production
- [ ] Check AWS Amplify logs if still not working

**Recent Changes**:
- ✅ Updated amplify.yml to export all env vars to .env.production (line 15)
- ✅ Removed insecure env object from next.config.ts

### User Profile & Authentication Improvements
- [ ] Improve current user functionality
  - [ ] Add user name field to profile
  - [ ] Remove profile picture functionality
  - [ ] Add liked images feature
- [ ] Add comments system for pictures
- [ ] Fix bug: Auth not working from random routes
- [ ] Add login with Google (OAuth integration)
- [ ] Make email templates consistent across all emails

### Infrastructure & Security
- [ ] Introduce proper logging system (replace console.log with structured logger)
  - [ ] Choose logging library (pino, winston, or custom)
  - [ ] Implement logger utility with log levels
  - [ ] Replace console.log throughout codebase
  - [ ] Add request ID tracking for debugging
- [ ] Migrate to AWS Secrets Manager for sensitive API keys (RESEND_API_KEY, RECAPTCHA_SECRET_KEY)
- [ ] Add error monitoring/alerting for email failures
- [ ] Add rate limiting to contact form

### UX Improvements
- [ ] Enhance loading behaviors throughout the app
  - [ ] Add loading skeletons for page transitions
  - [ ] Improve photo gallery loading states
  - [ ] Add loading indicators for form submissions
  - [ ] Implement optimistic UI updates where appropriate
  - [ ] Add progress indicators for long-running operations (image uploads, etc.)

## 🚀 Tech Stack

### Core Framework
- **Next.js 15.5.3** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5** - Type safety

### Backend & Authentication
- **AWS Amplify Gen 2** (v6.15.2) - Backend infrastructure
- **AWS Cognito** - User authentication and authorization
- **@aws-amplify/adapter-nextjs** - Next.js integration
- **@aws-amplify/ui-react** - Pre-built auth components

### UI & Styling
- **shadcn/ui** - Component library built on Radix UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants
- **clsx + tailwind-merge** - Conditional class merging

### Forms & Validation
- **react-hook-form** - Form state management and validation

## 📚 Official Documentation References

When working on this project, always consult the official documentation for the following technologies:

### AWS Amplify
- **Gen 2 Documentation**: https://docs.amplify.aws/
- **Authentication (React)**: https://docs.amplify.aws/react/build-a-backend/auth/
- **Data & GraphQL**: https://docs.amplify.aws/react/build-a-backend/data/
- **Storage**: https://docs.amplify.aws/react/build-a-backend/storage/
- **Server-side Rendering**: https://docs.amplify.aws/react/build-a-backend/server-side-rendering/
- **Amplify UI Components**: https://ui.docs.amplify.aws/react/

### Next.js
- **Official Documentation**: https://nextjs.org/docs
- **App Router**: https://nextjs.org/docs/app
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware
- **API Reference**: https://nextjs.org/docs/app/api-reference

### React Hook Form
- **Official Documentation**: https://react-hook-form.com/
- **API Reference**: https://react-hook-form.com/docs
- **Examples**: https://react-hook-form.com/form-builder

### shadcn/ui
- **Official Documentation**: https://ui.shadcn.com/
- **Components**: https://ui.shadcn.com/docs/components
- **Installation**: https://ui.shadcn.com/docs/installation/next
- **Theming**: https://ui.shadcn.com/docs/theming

**Note**: Always verify implementation patterns against the latest official documentation, especially for:
- AWS Amplify auth functions (e.g., `deleteUser`, `signIn`, `signOut`)
- Next.js App Router patterns and best practices
- React Hook Form validation and integration
- shadcn/ui component usage and customization

## ⚠️ Important Constraints & Guidelines

### AWS Amplify Version Compatibility
**CRITICAL**: This project uses AWS Amplify Gen 2 for hosting and backend infrastructure. Always ensure compatibility with Amplify's supported Next.js versions before upgrading.

- **Supported Next.js versions**: 13.5.0 - 15.9.x (Amplify JS v6)
- **Current version**: Next.js 15.5.3 (stable)
- **Do NOT upgrade** to Next.js canary builds or unsupported versions
- **Before upgrading to Next.js 16**:
  - Verify AWS Amplify officially supports it
  - Check Amplify documentation for breaking changes
  - Test thoroughly in staging environment
  - Enable PPR (Partial Prerendering) only after Amplify confirms support

### Next.js Features & Limitations
- **PPR (Partial Prerendering)**: Currently disabled (only available in canary builds)
  - TODO in next.config.ts to enable when Next.js 16 stable is released
  - Must verify Amplify support before enabling
- **Server Components**: Fully supported and used throughout the app
- **Server Actions**: Enabled with 10MB body size limit for image uploads
- **Middleware**: Only runs on `/admin` routes for optimal performance

### Authentication Architecture
- **Hybrid approach**: Server-side security + client-side UX
  - Server-side: `requireAuth()`, `requireRole()` for all data access
  - Client-side: `AuthContext` for UI state and optimistic updates
- **Defense in depth**:
  - Middleware blocks `/admin` routes for non-admins (returns 404)
  - Admin layout double-checks authorization with `requireRole('admin')`
- **No force-dynamic**: All pages use time-based revalidation instead
  - Photography pages: No revalidation (dynamic on every request for auth checks)
  - Admin dashboard: 60s cache
  - Admin users/photos: 30s cache
  - Admin groups: 60s cache
  - Photo upload form: 5min cache