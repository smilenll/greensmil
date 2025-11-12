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