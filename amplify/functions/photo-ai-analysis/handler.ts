import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Use region from environment or default to us-east-2
const AWS_REGION = process.env.AWS_REGION_OVERRIDE || process.env.AWS_REGION || 'us-east-2';

const s3Client = new S3Client({ region: AWS_REGION });
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

interface PhotoAnalysisResult {
  composition: {
    score: number;
    rationale: string;
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
  overall: number;
}

export const handler = async (event: any) => {
  try {
    const { imageKey, bucketName } = event;

    if (!imageKey || !bucketName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'imageKey and bucketName are required' }),
      };
    }

    // Get image from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: imageKey,
    });

    const s3Response = await s3Client.send(getObjectCommand);
    const imageBytes = await s3Response.Body?.transformToByteArray();

    if (!imageBytes) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to retrieve image' }),
      };
    }

    // Prepare prompt for Claude
    const prompt = `You are a professional photography critic and judge. Analyze this photograph based on these five essential principles of photography:

1. **Composition**: Evaluate how well the photograph follows compositional rules such as the rule of thirds, leading lines, balance, framing, and symmetry.

2. **Lighting and Exposure**: Assess the technical handling of natural or artificial light in the shot, as well as the overall exposure (too dark, too bright, or just right).

3. **Subject and Storytelling**: Evaluate how well the image communicates a narrative or elicits emotional impact. Consider the main subject clarity and the story being told.

4. **Technical Quality**: Assess sharpness, focus, resolution, and absence of artifacts (e.g., noise, blurriness, compression issues).

5. **Creativity and Originality**: Rate how unique or innovative the image is, whether in its angle, perspective, use of elements, or conceptual approach.

For each principle, provide:
- A score from 1 to 5 (where 1 is poor and 5 is excellent)
- A brief rationale (2-3 sentences) explaining why you gave that score

Respond in this exact JSON format:
{
  "composition": {
    "score": <1-5>,
    "rationale": "<explanation>"
  },
  "lighting": {
    "score": <1-5>,
    "rationale": "<explanation>"
  },
  "subject": {
    "score": <1-5>,
    "rationale": "<explanation>"
  },
  "technical": {
    "score": <1-5>,
    "rationale": "<explanation>"
  },
  "creativity": {
    "score": <1-5>,
    "rationale": "<explanation>"
  }
}`;

    // Call Bedrock with Claude Haiku (cheapest model)
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4000, // Increased to ensure Claude can complete the JSON even for detailed responses
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: Buffer.from(imageBytes).toString('base64'),
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    };

    // Use cross-region inference profile for on-demand access
    // This is required for on-demand throughput in Bedrock
    const command = new InvokeModelCommand({
      modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const bedrockResponse = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));

    // Extract the text response
    const textContent = responseBody.content.find((c: any) => c.type === 'text')?.text;

    if (!textContent) {
      throw new Error('No text response from Claude');
    }

    console.log('Raw Claude response:', textContent);

    // Parse the JSON response from Claude
    // Claude might wrap the JSON in markdown code blocks, so let's clean it
    let jsonText = textContent.trim();

    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Extract JSON object by finding matching braces
    const firstBrace = jsonText.indexOf('{');
    if (firstBrace !== -1) {
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = firstBrace; i < jsonText.length; i++) {
        const char = jsonText[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonText = jsonText.substring(firstBrace, i + 1);
              break;
            }
          }
        }
      }
    }

    console.log('Cleaned JSON text:', jsonText);

    let analysis: PhotoAnalysisResult;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response.');
      console.error('Raw response:', textContent);
      console.error('Cleaned JSON:', jsonText);
      console.error('Parse error:', parseError);

      // Try to fix incomplete JSON by adding missing closing braces
      console.log('Attempting to fix incomplete JSON...');
      let fixedJson = jsonText.trim();

      // Count open and close braces more carefully
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < fixedJson.length; i++) {
        const char = fixedJson[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
      }

      // Add missing closing braces
      if (braceCount > 0) {
        console.log(`Adding ${braceCount} missing closing brace(s)`);
        fixedJson += '}'.repeat(braceCount);
        console.log('Fixed JSON:', fixedJson);
      }

      // Try parsing again
      try {
        analysis = JSON.parse(fixedJson);
        console.log('Successfully fixed and parsed incomplete JSON');
      } catch (retryError) {
        // If still fails, return error with more context
        console.error('Failed to fix JSON. Retry error:', retryError);
        const errorPos = parseError instanceof SyntaxError && parseError.message.match(/position (\d+)/)
          ? parseInt(parseError.message.match(/position (\d+)/)![1])
          : 0;
        const contextStart = Math.max(0, errorPos - 100);
        const contextEnd = Math.min(jsonText.length, errorPos + 100);
        const problemArea = jsonText.substring(contextStart, contextEnd);

        throw new Error(`Invalid JSON from Claude at position ${errorPos}. Context: ...${problemArea}...`);
      }
    }

    // Calculate overall score (average of all scores)
    const overall =
      (analysis.composition.score +
        analysis.lighting.score +
        analysis.subject.score +
        analysis.technical.score +
        analysis.creativity.score) /
      5;

    analysis.overall = Math.round(overall * 10) / 10; // Round to 1 decimal place

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        analysis,
      }),
    };
  } catch (error) {
    console.error('Error analyzing photo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to analyze photo',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
