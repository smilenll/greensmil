# AI Photo Analysis - Step by Step Setup

## ✅ Step 1: Enable AWS Bedrock Access (DO THIS FIRST!)

1. **Open AWS Console**: https://console.aws.amazon.com/
2. **Switch to us-east-2 region** (top right - should say "Ohio")
3. **Go to Amazon Bedrock**:
   - Search "Bedrock" in the search bar
   - Click "Amazon Bedrock"
4. **Enable Model Access**:
   - Click "Model access" in left sidebar
   - Click "Manage model access" or "Modify model access" button (orange button)
   - Scroll to **Anthropic** section
   - ✅ Check the box next to **"Claude 3 Haiku"**
   - Scroll to bottom, click **"Save changes"**
5. **Wait for approval** (~1 minute)
   - Status should change from "In progress" to **"Access granted"** ✅

---

## ✅ Step 2: Install Lambda Function Dependencies

```bash
cd amplify/functions/photo-ai-analysis
npm install
cd ../../..
```

---

## ✅ Step 3: Install Main Project Dependencies

```bash
npm install
```

---

## ✅ Step 4: Deploy Backend to Sandbox

```bash
npx ampx sandbox
```

**What to expect:**
- You'll see messages like "Deploying..."
- This takes ~2-3 minutes
- You should see:
  ```
  ✅ data
  ✅ storage
  ✅ auth
  ✅ photoAiAnalysis (NEW!)
  ```

**Wait until you see: "Watching for file changes..."**

---

## ✅ Step 5: Verify amplify_outputs.json Updated

After deployment completes, check:

```bash
cat amplify_outputs.json | grep -A 3 "custom"
```

You should see something like:
```json
"custom": {
  "photoAiAnalysisFunctionName": "photo-ai-analysis-smilen-sandbox..."
}
```

If you see this, **SUCCESS!** ✅

---

## ✅ Step 6: Restart Your Dev Server

In a **NEW terminal** (keep sandbox running):

```bash
npm run dev
```

---

## ✅ Step 7: Test the Feature!

1. **Open browser**: http://localhost:3000
2. **Sign in as admin**
3. **Go to**: http://localhost:3000/admin/photos
4. **Click the ⋯ (three dots)** on any photo card
5. **Click "Analyze with AI"**
6. **Wait 10-20 seconds** (first time is slower - cold start)
7. **Success toast appears!** 🎉
8. **Click the photo** to see the full AI report

---

## Troubleshooting

### "Function not found" error
- **Cause**: Lambda not deployed yet
- **Fix**: Make sure Step 4 completed successfully

### "Access Denied" or "Bedrock" error
- **Cause**: Bedrock access not enabled
- **Fix**: Go back to Step 1, verify "Access granted" status

### Analysis never completes
- **First time**: Cold start can take 15-20 seconds - normal!
- **Check CloudWatch logs**:
  ```bash
  npx ampx sandbox --logs
  ```

### Can't find Lambda function name in outputs
- **Fix**: Redeploy:
  ```bash
  npx ampx sandbox --force
  ```

---

## Success Checklist

- [ ] Bedrock access shows "Access granted" in AWS Console
- [ ] Dependencies installed in `amplify/functions/photo-ai-analysis/`
- [ ] Main dependencies installed
- [ ] `npx ampx sandbox` deployed successfully
- [ ] `amplify_outputs.json` contains `custom.photoAiAnalysisFunctionName`
- [ ] Dev server running on port 3000
- [ ] "Analyze with AI" button appears in admin gallery
- [ ] First analysis completes successfully

---

**Current Status**: Step 1 (Enable Bedrock) → Start here!
