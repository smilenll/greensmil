'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createComment, getCommentsByPhotoId, deleteComment } from '@/actions/comment-actions';
import type { Comment } from '@/types/comment';

interface PhotoCommentsProps {
  photoId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function PhotoComments({ photoId, currentUserId, isAdmin = false }: PhotoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingComments, setIsFetchingComments] = useState(true);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Fetch comments on mount
  useEffect(() => {
    loadComments();
  }, [photoId]);

  const loadComments = async () => {
    setIsFetchingComments(true);
    const result = await getCommentsByPhotoId(photoId);

    if (result.status === 'success') {
      setComments(result.data.comments);
    } else {
      toast.error(result.error || 'Failed to load comments');
    }
    setIsFetchingComments(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsLoading(true);
    const result = await createComment({
      photoId,
      content: newComment.trim(),
    });

    if (result.status === 'success') {
      setComments([result.data, ...comments]);
      setNewComment('');
      toast.success('Comment posted successfully');
    } else {
      toast.error(result.error || 'Failed to post comment');
    }
    setIsLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    const result = await deleteComment(commentId);

    if (result.status === 'success') {
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete comment');
    }
    setDeletingCommentId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : 'Just now';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isLoading}
            className="min-h-[80px]"
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {newComment.length}/1000 characters
            </span>
            <Button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {isFetchingComments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const canDelete = isAdmin || comment.userId === currentUserId;

              return (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                    >
                      {deletingCommentId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
