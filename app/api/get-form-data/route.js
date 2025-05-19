import get from 'lodash/get';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get form ID from query params or environment variable
    const formId = process.env.GOOGLE_FORM_ID;

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // Set up authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/forms.responses.readonly'],
    });

    const forms = google.forms({
      version: 'v1',
      auth,
    });

    // Fetch form responses
    const response = await forms.forms.responses.list({
      formId,
    });

    const formResponses = get(response, 'data.responses', []);

    return NextResponse.json({ formResponses });
  } catch (error) {
    console.error('Error fetching Google Form responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form responses' },
      { status: 500 }
    );
  }
}
