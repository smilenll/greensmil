# AI Photo Analysis - Quick Setup Guide

## Prerequisites

- ✅ AWS Amplify Gen2 project (already set up)
- ✅ AWS Account with Bedrock access
- ✅ Admin role configured in Cognito

## Step-by-Step Setup

### Step 1: Enable AWS Bedrock

1. Open **AWS Console** → **Amazon Bedrock**
2. Navigate to **Model access** in left sidebar
3. Click **Manage model access** or **Edit**
4. Find **Anthropic** section
5. Check the box for **Claude 3 Haiku**
6. Click **Save changes**
7. Wait for status to show **Access granted** (usually instant)

**Region Note**: Make sure you're in the same region as your Amplify app (check `amplify_outputs.json` for `aws_region`)

### Step 2: Install Required Dependencies

```bash
cd amplify/functions/photo-ai-analysis
npm install
cd ../../..
```

### Step 3: Add Lambda Dependency to Main Project

```bash
npm install @aws-sdk/client-lambda
```

### Step 4: Deploy to Amplify Sandbox

```bash
npx ampx sandbox
```

Wait for deployment to complete. You should see:
- ✅ Data (DynamoDB tables updated with new fields)
- ✅ Storage (S3 bucket)
- ✅ Auth (Cognito)
- ✅ Function (photo-ai-analysis Lambda)

### Step 5: Test the Function (Optional)

Test in AWS Console:

1. Go to **AWS Lambda** → Find function `photo-ai-analysis-[sandbox-id]`
2. Click **Test** tab
3. Create test event with payload:
```json
{
  "imageKey": "photos/your-test-photo.jpg",
  "bucketName": "your-bucket-name"
}
```
4. Click **Test** button
5. Check response for AI analysis results

### Step 6: Use in Your App

#### For Admin Users:

1. Navigate to any photo page
2. Import and use the analysis button:

```typescript
import { PhotoAIAnalysisButton } from '@/components/photography/photo-ai-analysis-button';

// In your admin component
<PhotoAIAnalysisButton
  photoId={photo.id}
  isAnalyzed={photo.aiAnalyzed}
/>
```

3. Click **"Analyze with AI"** button
4. Wait 5-15 seconds for results
5. View the comprehensive report!

#### Display AI Report:

```typescript
import { PhotoAIReport } from '@/components/photography/photo-ai-report';
import { getPhotoAIAnalysis } from '@/actions/photo-actions';

// Server component
const result = await getPhotoAIAnalysis(photoId);

if (result.success && result.data) {
  return <PhotoAIReport analysis={result.data} />;
}
```

## Verification Checklist

After setup, verify:

- [ ] Bedrock model access granted in AWS Console
- [ ] Lambda function deployed (check AWS Lambda console)
- [ ] Function has S3 read permissions (check IAM role)
- [ ] Function has Bedrock invoke permissions (check IAM role)
- [ ] Database schema updated with AI fields (check DynamoDB)
- [ ] Frontend components available

## Cost Monitoring

To monitor costs:

1. **AWS Cost Explorer**:
   - Go to AWS Console → Cost Management → Cost Explorer
   - Filter by Service: "Bedrock" and "Lambda"

2. **Bedrock Usage**:
   - AWS Console → Bedrock → Invocation logging
   - Enable logging for detailed tracking

3. **Lambda Metrics**:
   - AWS Console → Lambda → Your function → Monitoring
   - Check invocation count and duration

**Expected costs**: ~$0.0014 per photo analysis (less than 1 cent!)

## Troubleshooting

### Error: "Access Denied to Bedrock"

**Fix**: Enable Claude 3 Haiku in Bedrock Model Access (Step 1)

### Error: "Function not found"

**Check**:
1. Lambda function name in AWS Console
2. Set environment variable if needed:
   ```bash
   PHOTO_AI_ANALYSIS_FUNCTION_NAME=your-actual-name
   ```

### Error: "Cannot read property 'Payload'"

**Fix**: Ensure Lambda invocation has correct permissions. Redeploy backend.

### Analysis Never Completes

**Possible issues**:
1. Lambda timeout (check CloudWatch logs)
2. Image too large (should be compressed client-side)
3. Bedrock throttling (wait and retry)

**Check logs**:
```bash
npx ampx sandbox --logs
```

## Production Deployment

When ready for production:

1. **Push to Git** (if using Amplify Hosting):
```bash
git add .
git commit -m "Add AI photo analysis feature"
git push
```

2. **Manual Deploy** (if not using Git):
```bash
npx ampx pipeline-deploy --branch main --app-id <your-app-id>
```

3. **Set Production Environment Variables** (if needed):
   - Go to Amplify Console → Your App → Environment variables
   - Add `PHOTO_AI_ANALYSIS_FUNCTION_NAME` if function name differs

4. **Monitor First Production Run**:
   - Check CloudWatch logs for any issues
   - Verify costs in AWS Cost Explorer after first analyses

## Next Steps

After setup:

1. Analyze some test photos
2. Review AI scores and rationales
3. Consider adding analysis button to admin photo management UI
4. Optionally display AI scores on public photo gallery
5. Monitor costs and usage patterns

## Need Help?

- 📖 Read full documentation: [AI_PHOTO_ANALYSIS.md](./AI_PHOTO_ANALYSIS.md)
- 🔍 Check AWS CloudWatch logs for detailed error messages
- 💬 Review AWS Bedrock quotas and limits
- 📧 Contact AWS Support for Bedrock access issues

---

**Setup Time**: ~10-15 minutes
**First Analysis Time**: ~15-20 seconds (includes cold start)
**Subsequent Analyses**: ~5-10 seconds each
