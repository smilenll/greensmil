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
  - `RESEND_API_KEY=re_jpWQcqLy_DnLcjd5KqCieMRGkFwRroAfK`
  - `RESEND_FROM_EMAIL=noreply@greensmil.com`
  - `RESEND_TO_EMAIL=web@greensmil.com`
  - `RECAPTCHA_SECRET_KEY=6LevfeMrAAAAAH8Dl64NqVvwyQm934qnaGL2rBKx`
  - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LevfeMrAAAAALsdCccoU_VuUOUk3xuQ1TP3FTRh`
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
- [ ] Migrate to AWS Secrets Manager for sensitive API keys (RESEND_API_KEY, RECAPTCHA_SECRET_KEY)
- [ ] Add error monitoring/alerting for email failures
- [ ] Add rate limiting to contact form

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