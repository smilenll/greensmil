# Deploy AI Photo Analysis Feature

## Step 1: Enable Bedrock Access in AWS Console

**IMPORTANT**: Do this BEFORE deploying!

1. Open AWS Console → **Amazon Bedrock** (us-east-2 region)
2. Navigate to **Model access** in left sidebar
3. Click **Manage model access** or **Modify model access**
4. Find **Anthropic** section
5. Check the box for **Claude 3 Haiku**
6. Click **Save changes** at bottom
7. Wait for status to show **Access granted** (usually ~1 minute)

## Step 2: Install Dependencies

```bash
cd amplify/functions/photo-ai-analysis
npm install
cd ../../..
npm install
```

## Step 3: Deploy to Sandbox

```bash
npx ampx sandbox
```

This will:
- ✅ Deploy updated Photo model with AI analysis fields
- ✅ Deploy Lambda function for AI analysis
- ✅ Configure IAM permissions
- ✅ Update `amplify_outputs.json` with function name

**Wait for deployment to complete** (~2-3 minutes)

## Step 4: Restart Next.js Dev Server

After sandbox deployment completes:

```bash
# Press Ctrl+C to stop current dev server
npm run dev
```

## Step 5: Test the Feature

1. Go to `http://localhost:3000/admin/photos`
2. Click the **three dots (⋯)** menu on any photo
3. Select **"Analyze with AI"**
4. Wait 5-15 seconds
5. Check for success toast notification
6. View the photo detail page to see the AI report!

## Troubleshooting

### Error: "Function not found"

**Solution**: Make sure sandbox deployment completed successfully. Check that `amplify_outputs.json` was updated with the custom output.

### Error: "Access Denied" or "Bedrock" error

**Solution**:
1. Confirm Bedrock model access is granted in AWS Console (us-east-2 region)
2. Make sure you selected **Claude 3 Haiku** model
3. Wait a few minutes after granting access

### Analysis takes > 30 seconds

**Possible causes**:
- First invocation (Lambda cold start) - normal, retry
- Large image file - client-side compression should handle this
- Bedrock throttling - wait and retry

### Check Lambda function was deployed

```bash
aws lambda list-functions --region us-east-2 | grep photo-ai-analysis
```

You should see a function name like: `photo-ai-analysis-[sandbox-id]`

### View Lambda logs

```bash
npx ampx sandbox --logs
```

Or check CloudWatch Logs in AWS Console:
- Log group: `/aws/lambda/photo-ai-analysis-[sandbox-id]`

## Production Deployment (Later)

When ready for production:

```bash
# Commit changes
git add .
git commit -m "Add AI photo analysis feature"

# Push to main (if using Amplify Hosting)
git push origin main
```

Amplify Hosting will automatically deploy the backend and frontend.

---

## What Gets Deployed

### Backend (AWS):
- ✅ DynamoDB table updated (Photo model with AI fields)
- ✅ Lambda function (`photo-ai-analysis`)
- ✅ IAM role with S3 + Bedrock permissions
- ✅ Function name exported to `amplify_outputs.json`

### Frontend (Next.js):
- ✅ AI analysis button in admin gallery
- ✅ AI analysis button on photo detail pages (admin only)
- ✅ AI report display component
- ✅ Server actions for triggering and fetching AI analysis

## Cost Estimate (First Test)

- Lambda invocation: **~$0.00001** (essentially free)
- Bedrock (Claude Haiku): **~$0.0014** (0.14 cents)
- **Total: ~$0.0015 per photo** (less than 1 cent!)

100 photos analyzed: ~$0.15
1,000 photos analyzed: ~$1.50

---

**Ready? Run Step 1, then Step 2, then Step 3!** 🚀
