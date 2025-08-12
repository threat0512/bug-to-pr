import { NextRequest, NextResponse } from 'next/server';

interface ApiResponse {
  pr_title?: string;
  commit_plan?: string[];
  files_to_modify?: string[];
  code_snippets?: Record<string, string>;
  error?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url: string };

    // Validate GitHub URL format
    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    const issuePattern = /github\.com\/[^\/]+\/[^\/]+\/issues\/\d+/;
    if (!issuePattern.test(body.url)) {
      return NextResponse.json(
        { error: 'Please provide a valid GitHub issue URL' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    try {
      const response = await fetch(`${backendUrl}/generate-pr-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: ApiResponse;
      try {
        data = (await response.json()) as ApiResponse;
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        return NextResponse.json(
          { error: 'Invalid response from AI service' },
          { status: 502 }
        );
      }

      if (!response.ok) {
        // Enhanced error handling based on status codes
        let errorMessage = 'Failed to generate PR plan';
        
        switch (response.status) {
          case 400:
            errorMessage = data.error || data.message || 'Invalid request - please check the GitHub URL';
            break;
          case 401:
            errorMessage = 'Authentication failed - please check API configuration';
            break;
          case 403:
            errorMessage = 'Access denied - the repository might be private or rate limited';
            break;
          case 404:
            errorMessage = 'GitHub issue not found - please verify the URL is correct';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded - please try again in a few minutes';
            break;
          case 500:
            errorMessage = data.error || data.message || 'AI service error - please try again';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'Service temporarily unavailable - please try again later';
            break;
          default:
            errorMessage = data.error || data.message || `Service error (${response.status})`;
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: response.status },
        );
      }

      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle specific fetch errors
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out - the issue might be too complex. Please try again.' },
          { status: 408 }
        );
      }
      
      if (fetchError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'AI service is not available - please try again later' },
          { status: 503 }
        );
      }

      throw fetchError; // Re-throw to be caught by outer catch
    }

  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error - please try again' },
      { status: 500 },
    );
  }
}
