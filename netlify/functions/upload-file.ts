import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const handler: Handler = async (event) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, fileContent } = JSON.parse(event.body || '{}');

    if (!email || !fileContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing email or file content' }),
      };
    }

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ email }])
        .select()
        .single();

      if (createError) {
        throw new Error(`Error creating user: ${createError.message}`);
      }
      user = newUser;
    }

    // Create file upload record
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .insert([{ user_id: user.id, filename: 'uploaded-file.txt' }])
      .select()
      .single();

    if (uploadError) {
      throw new Error(`Error creating upload record: ${uploadError.message}`);
    }

    // Extract and store quotes
    const quotes = extractQuotes(fileContent);
    const quoteRecords = quotes.map(quote => ({
      user_id: user.id,
      upload_id: upload.id,
      quote_text: quote
    }));

    const { error: quotesError } = await supabase
      .from('quotes')
      .insert(quoteRecords);

    if (quotesError) {
      throw new Error(`Error storing quotes: ${quotesError.message}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'File processed successfully',
        quotesCount: quotes.length
      }),
    };
  } catch (error) {
    console.error('Error processing upload:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Error processing upload',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

function extractQuotes(content: string): string[] {
  // Split by double newlines or markdown headers
  const blocks = content.split(/\n\s*\n|(?=^#{1,6}\s)/m);
  
  // Clean up and filter empty blocks
  return blocks
    .map(block => block.trim())
    .filter(block => block.length > 0)
    // Remove markdown headers
    .map(block => block.replace(/^#{1,6}\s+/m, ''));
}

export { handler };