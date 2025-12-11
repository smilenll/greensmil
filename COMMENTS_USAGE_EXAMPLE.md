# Comment Functionality - Usage Guide

## Overview

The comment functionality has been successfully implemented with the following features:
- ✅ Create comments (authenticated users only)
- ✅ View comments (authenticated users only)
- ✅ Delete comments (comment owners and admins)
- ✅ Real-time comment count
- ✅ Timestamps with relative time formatting (e.g., "2 hours ago")

## Files Created

### 1. Database Schema
**File:** `amplify/data/resource.ts`
- Added `Comment` model with fields: photoId, userId, username, content, createdAt, updatedAt
- Added `comments` relationship to `Photo` model
- Authorization: authenticated users can read/create, admins can delete any comment, users can delete their own

### 2. Types
**File:** `src/types/comment.ts`
- Type definitions for Comment
- Zod validation schemas for input validation
- Helper functions for response validation

### 3. Server Actions
**File:** `src/actions/comment-actions.ts`

Functions available:
```typescript
// Create a new comment
createComment(input: CreateCommentInput): Promise<ActionResponse<Comment>>

// Get all comments for a photo
getCommentsByPhotoId(photoId: string): Promise<ActionResponse<CommentsData>>

// Delete a comment (owner or admin)
deleteComment(commentId: string): Promise<ActionResponse<void>>

// Get comment count for a photo
getCommentCount(photoId: string): Promise<ActionResponse<number>>
```

### 4. UI Component
**File:** `src/components/photography/photo-comments.tsx`

## Usage Example

### In a photo detail page:

```typescript
import { PhotoComments } from '@/components/photography/photo-comments';
import { requireAuth } from '@/lib/auth-server';

export default async function PhotoDetailPage({ params }: { params: { id: string } }) {
  const user = await requireAuth();

  // Fetch photo data here...
  const photoId = params.id;

  return (
    <div>
      {/* Photo display */}

      {/* Comments section */}
      <PhotoComments
        photoId={photoId}
        currentUserId={user.userId}
        isAdmin={user.groups?.includes('admin')}
      />
    </div>
  );
}
```

### Props for PhotoComments component:

```typescript
interface PhotoCommentsProps {
  photoId: string;         // Required: The photo ID to load comments for
  currentUserId?: string;  // Optional: Current user's ID (for delete permissions)
  isAdmin?: boolean;       // Optional: Whether current user is admin
}
```

## Features

### 1. Comment Creation
- Textarea with character count (max 1000 characters)
- Real-time validation
- Loading state during submission
- Success/error toast notifications

### 2. Comment Display
- Sorted by newest first
- Shows username and relative timestamp
- Responsive layout with hover effects
- Loading spinner while fetching

### 3. Comment Deletion
- Delete button only shown for comment owner or admin
- Confirmation via delete button click
- Loading state on delete button
- Optimistic UI updates

### 4. Time Formatting
Comments show relative time:
- "Just now"
- "5 minutes ago"
- "2 hours ago"
- "3 days ago"
- Full date if older than 7 days

## Next Steps

1. **Deploy Schema Changes:**
   ```bash
   npx ampx sandbox  # For development
   # or
   npx ampx deploy   # For production
   ```

2. **Add Comments to Photo Pages:**
   - Import and use the `PhotoComments` component in your photo detail pages
   - Pass the required props (photoId, currentUserId, isAdmin)

3. **Optional Enhancements:**
   - Add comment edit functionality
   - Add comment likes/reactions
   - Add reply/threading functionality
   - Add pagination for large comment lists
   - Add real-time updates with subscriptions

## Authorization Rules

- **Read comments:** Any authenticated user
- **Create comments:** Any authenticated user
- **Delete own comments:** Comment owner
- **Delete any comments:** Admin users
- **View comments on photos:** Only authenticated users (photos are not public)

## Database Schema

```typescript
Comment {
  id: ID!
  photoId: ID!
  photo: Photo
  userId: String!
  username: String!
  content: String!
  createdAt: DateTime
  updatedAt: DateTime
}
```

The Comment model is fully integrated with AWS Amplify's authorization system and will automatically sync with your backend once deployed.
