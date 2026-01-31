import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Photo: a
    .model({
      title: a.string().required(),
      description: a.string(),
      imageKey: a.string().required(), // S3 key for the image
      imageUrl: a.string(), // Public URL for the image
      uploadedBy: a.string().required(), // User ID who uploaded
      likes: a.hasMany('PhotoLike', 'photoId'),
      aiReports: a.hasMany('PhotoAIReport', 'photoId'),
      comments: a.hasMany('Comment', 'photoId'),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']), // Only authenticated users can read
      allow.group('admin').to(['create', 'update', 'delete']),
    ]),

  PhotoAIReport: a
    .model({
      photoId: a.id().required(),
      photo: a.belongsTo('Photo', 'photoId'),
      // Composition
      compositionScore: a.float().required(),
      compositionRationale: a.string().required(),
      // Lighting and Exposure
      lightingScore: a.float().required(),
      lightingRationale: a.string().required(),
      // Subject and Storytelling
      subjectScore: a.float().required(),
      subjectRationale: a.string().required(),
      // Technical Quality
      technicalScore: a.float().required(),
      technicalRationale: a.string().required(),
      // Creativity and Originality
      creativityScore: a.float().required(),
      creativityRationale: a.string().required(),
      // Overall
      overallScore: a.float().required(),
      analyzedAt: a.datetime().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.group('admin').to(['create', 'delete']),
    ]),

  PhotoLike: a
    .model({
      photoId: a.id().required(),
      photo: a.belongsTo('Photo', 'photoId'),
      userId: a.string().required(), // Cognito user ID
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ])
    .identifier(['photoId', 'userId']), // Composite key to prevent duplicate likes

  Comment: a
    .model({
      photoId: a.id().required(),
      photo: a.belongsTo('Photo', 'photoId'),
      userId: a.string().required(), // Cognito user ID
      username: a.string().required(), // Username for display
      content: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read', 'create']), // Authenticated users can read and create
      allow.owner(), // Users can update/delete their own comments
      allow.group('admin').to(['delete']), // Admins can delete any comment
    ]),

  Email: a
    .model({
      messageId: a.string().required(), // Resend email ID
      from: a.string().required(), // Sender email address
      fromName: a.string(), // Sender display name
      to: a.string().required(), // Recipient (web@greensmil.com)
      subject: a.string().required(),
      htmlBody: a.string(), // HTML version
      textBody: a.string(), // Plain text version
      threadId: a.string(), // For grouping conversations
      inReplyTo: a.string(), // Email message ID this is replying to
      references: a.string(), // Full reference chain
      isRead: a.boolean().default(false),
      isStarred: a.boolean().default(false),
      receivedAt: a.datetime().required(),
      replies: a.hasMany('EmailReply', 'emailId'),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('admin').to(['read', 'update', 'delete']),
    ]),

  EmailReply: a
    .model({
      emailId: a.id().required(),
      email: a.belongsTo('Email', 'emailId'),
      messageId: a.string().required(), // Resend message ID
      from: a.string().required(), // web@greensmil.com
      to: a.string().required(), // Recipient email
      subject: a.string().required(),
      htmlBody: a.string(),
      textBody: a.string(),
      sentBy: a.string().required(), // Admin user ID who sent
      sentAt: a.datetime().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('admin').to(['read', 'create', 'delete']),
    ]),

  EmailAttachment: a
    .model({
      emailId: a.id().required(),
      resendAttachmentId: a.string().required(),
      filename: a.string().required(),
      contentType: a.string().required(),
      size: a.integer(), // Bytes
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('admin').to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
