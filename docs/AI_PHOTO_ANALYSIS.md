# AI Photo Analysis Integration

## Overview

The AI Photo Analysis feature provides automated, professional-grade photography critique for images in your gallery. Using Claude AI (Anthropic) via AWS Bedrock, it evaluates each photo based on five essential photography principles and provides detailed scores and rationales.

## Features

### Five Essential Photography Principles

The AI analyzes photos based on these criteria:

1. **Composition** (1-5 score)
   - Rule of thirds, leading lines, balance, framing, and symmetry
   - Evaluates how well the photograph directs viewer attention

2. **Lighting and Exposure** (1-5 score)
   - Technical handling of natural or artificial light
   - Overall exposure (darkness, brightness, balance)
   - Impact on mood and detail clarity

3. **Subject and Storytelling** (1-5 score)
   - Main subject recognition and clarity
   - Narrative communication
   - Emotional impact and viewer connection

4. **Technical Quality** (1-5 score)
   - Sharpness and focus
   - Resolution quality
   - Absence of artifacts (noise, blur, compression issues)

5. **Creativity and Originality** (1-5 score)
   - Unique angles and perspectives
   - Innovative use of elements
   - Conceptual approach and photographer's style

### What You Get

For each photo analysis:
- **Score (1-5)** for each of the five principles
- **Detailed rationale** (2-3 sentences) explaining each score
- **Overall score** (average of all five categories)
- **Timestamp** of when the analysis was performed

## Architecture

```
┌─────────────┐
│   Next.js   │
│   Frontend  │
└──────┬──────┘
       │
       │ Server Action
       ▼
┌─────────────┐
│  AWS Lambda │
│   Function  │
└──────┬──────┘
       │
       ├──────► S3 Bucket (get photo)
       │
       └──────► AWS Bedrock (Claude Haiku)
```

### Components

1. **Database Schema** ([amplify/data/resource.ts](../amplify/data/resource.ts))
   - Extended Photo model with AI analysis fields
   - Stores scores and rationales for each principle

2. **Lambda Function** ([amplify/functions/photo-ai-analysis/](../amplify/functions/photo-ai-analysis/))
   - Retrieves photo from S3
   - Calls AWS Bedrock (Claude Haiku model)
   - Processes and returns analysis results

3. **Server Actions** ([src/actions/photo-actions.ts](../src/actions/photo-actions.ts))
   - `analyzePhotoWithAI()` - Triggers AI analysis (Admin only)
   - `getPhotoAIAnalysis()` - Retrieves existing analysis

4. **UI Components**
   - `PhotoAIReport` - Displays analysis results
   - `PhotoAIAnalysisButton` - Triggers analysis (Admin only)

## Setup Instructions

### 1. Enable AWS Bedrock Access

You need to enable Claude access in AWS Bedrock:

1. Go to AWS Console → Bedrock → Model access
2. Request access to **Anthropic Claude 3 Haiku** model
3. Wait for approval (usually instant for Haiku)

### 2. Deploy Backend Changes

The backend configuration is already set up. Deploy your Amplify backend:

```bash
npx ampx sandbox
```

Or for production:

```bash
git push  # If using Amplify Hosting
```

### 3. Set Environment Variable (Optional)

If your Lambda function name differs from the default:

```bash
# .env.local or Amplify Console
PHOTO_AI_ANALYSIS_FUNCTION_NAME=your-function-name
```

### 4. Grant Necessary Permissions

The backend configuration already includes:
- ✅ S3 read access for Lambda
- ✅ Bedrock InvokeModel permission for Claude Haiku

## Usage

### For Admins

1. Navigate to a photo detail page or admin photos list
2. Click the **"Analyze with AI"** button
3. Wait ~5-15 seconds for analysis to complete
4. View the comprehensive AI report with all scores and rationales

### For Users

- View AI analysis reports on photo detail pages (if photo has been analyzed)
- See overall scores and detailed breakdowns
- Read AI-generated explanations for each photography principle

## Cost Analysis

### AWS Bedrock Pricing (Claude 3 Haiku)

- **Model**: Anthropic Claude 3 Haiku (cheapest vision model)
- **Input**: $0.25 per million tokens (~$0.0003 per image)
- **Output**: $1.25 per million tokens (~$0.001 per analysis)
- **Estimated cost per photo**: **~$0.0013** (less than 1 cent!)

### AWS Lambda Pricing

- **Free Tier**: 1 million requests/month, 400,000 GB-seconds/month
- **After Free Tier**: $0.20 per 1 million requests
- **Memory**: 512MB configured (generous for image processing)
- **Estimated cost per photo**: **~$0.00001** (essentially free at low volume)

### Total Estimated Cost

- **Per photo analysis**: ~**$0.0014** (0.14 cents)
- **100 photos**: ~$0.14
- **1,000 photos**: ~$1.40

This is **extremely cost-effective** compared to:
- Manual professional reviews ($50-200 per photo)
- Other AI APIs (OpenAI GPT-4V: ~$0.01-0.03 per image)

## Technical Details

### Model Selection

We use **Claude 3 Haiku** because it's:
- ✅ **Cheapest** vision model from Anthropic
- ✅ **Fast** (~5-10 seconds per analysis)
- ✅ **Accurate** for photography assessment
- ✅ **Reliable** JSON output format

### Lambda Configuration

- **Timeout**: 60 seconds (generous for Bedrock calls)
- **Memory**: 512 MB (handles image processing comfortably)
- **Runtime**: Node.js with TypeScript
- **Cold start**: ~2-3 seconds (first call only)

### Data Storage

All AI analysis data is stored in your DynamoDB table (via Amplify Data):
- Indexed scores for potential filtering/sorting
- Full rationale text for display
- Timestamp for tracking when analysis was performed
- Boolean flag for quick checks if photo has been analyzed

## API Reference

### Server Actions

#### `analyzePhotoWithAI(photoId: string)`

Analyzes a photo with AI and saves results to database.

**Authorization**: Admin only

**Parameters**:
- `photoId` - The ID of the photo to analyze

**Returns**: `ActionResponse<PhotoAIAnalysis>`

**Example**:
```typescript
const result = await analyzePhotoWithAI('photo-123');
if (result.success) {
  console.log('Overall score:', result.data.overall);
  console.log('Composition:', result.data.composition);
}
```

#### `getPhotoAIAnalysis(photoId: string)`

Retrieves existing AI analysis for a photo.

**Authorization**: Authenticated users

**Parameters**:
- `photoId` - The ID of the photo

**Returns**: `ActionResponse<PhotoAIAnalysis | null>`

**Example**:
```typescript
const result = await getPhotoAIAnalysis('photo-123');
if (result.success && result.data) {
  console.log('Analysis exists:', result.data.overall);
} else {
  console.log('Not yet analyzed');
}
```

### Type Definitions

```typescript
export type PhotoAIAnalysis = {
  composition: {
    score: number;        // 1-5
    rationale: string;    // Explanation
  };
  lighting: {
    score: number;
    rationale: string;
  };
  subject: {
    score: number;
    rationale: string;
  };
  technical: {
    score: number;
    rationale: string;
  };
  creativity: {
    score: number;
    rationale: string;
  };
  overall: number;        // Average of all scores
};
```

## Troubleshooting

### "Access Denied" Error

**Problem**: Lambda can't access Bedrock

**Solution**:
1. Check Bedrock model access in AWS Console
2. Verify IAM permissions in [amplify/backend.ts](../amplify/backend.ts)
3. Ensure you've deployed the latest backend

### Analysis Takes Too Long

**Problem**: Lambda timeout

**Possible causes**:
- Cold start (first invocation)
- Large image file
- Bedrock throttling

**Solution**:
- Wait and retry (cold starts are one-time)
- Optimize image sizes before upload (already handled by client-side compression)
- Check AWS Bedrock quotas in console

### Wrong Lambda Function Name

**Problem**: "Function not found"

**Solution**:
Set environment variable:
```bash
PHOTO_AI_ANALYSIS_FUNCTION_NAME=<your-actual-function-name>
```

Check actual function name in AWS Lambda console or Amplify outputs.

## Future Enhancements

Potential improvements:
- [ ] Batch analysis (analyze all photos at once)
- [ ] Scheduled re-analysis (track improvement over time)
- [ ] Custom analysis criteria (user-defined focus areas)
- [ ] Comparison mode (compare two photos side-by-side)
- [ ] Export reports (PDF/CSV format)
- [ ] Public AI scores (display on photo cards in gallery)

## Security Considerations

- ✅ **Admin-only analysis**: Only admins can trigger AI analysis (prevents abuse)
- ✅ **Rate limiting**: AWS Bedrock has built-in throttling
- ✅ **Signed URLs**: S3 access uses IAM roles (no public access)
- ✅ **Data privacy**: Images never leave AWS infrastructure
- ✅ **Cost controls**: Lambda timeout prevents runaway costs

## Support

For issues or questions:
1. Check this documentation first
2. Review AWS CloudWatch logs for Lambda function
3. Check Bedrock model access in AWS Console
4. Review Amplify deployment logs

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
