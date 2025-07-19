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

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/generate-pr-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as ApiResponse;

    if (!response.ok) {
      const errorMessage =
        data && typeof data === 'object' && 'message' in data
          ? (data.message as string)
          : 'Failed to generate PR plan';
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
