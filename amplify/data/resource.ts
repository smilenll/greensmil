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
      likeCount: a.integer().default(0),
      // AI Analysis fields
      aiAnalyzed: a.boolean().default(false), // Whether AI analysis has been performed
      // Composition
      aiCompositionScore: a.integer(), // Score 1-5
      aiCompositionRationale: a.string(), // Explanation for composition score
      // Lighting and Exposure
      aiLightingScore: a.integer(), // Score 1-5
      aiLightingRationale: a.string(), // Explanation for lighting score
      // Subject and Storytelling
      aiSubjectScore: a.integer(), // Score 1-5
      aiSubjectRationale: a.string(), // Explanation for subject/storytelling score
      // Technical Quality
      aiTechnicalScore: a.integer(), // Score 1-5
      aiTechnicalRationale: a.string(), // Explanation for technical quality score
      // Creativity and Originality
      aiCreativityScore: a.integer(), // Score 1-5
      aiCreativityRationale: a.string(), // Explanation for creativity score
      // Overall
      aiOverallScore: a.float(), // Average of all scores
      aiAnalyzedAt: a.datetime(), // When analysis was performed
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']), // Only authenticated users can read
      allow.group('admin').to(['create', 'update', 'delete']),
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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
