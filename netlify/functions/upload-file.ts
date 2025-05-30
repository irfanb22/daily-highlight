import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Quote {
  text: string;
  source: string;
  link?: string;
}

const handler: Handler = async (event) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { email, quotes } = JSON.parse(event.body);

    // Validate input
    if (!email || !quotes || !Array.isArray(quotes) || quotes.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          message: 'Missing required fields',
          details: {
            email: !email ? 'Email is required' : null,
            quotes: !quotes ? 'Quotes are required' : !Array.isArray(quotes) ? 'Quotes must be an array' : quotes.length === 0 ? 'At least one quote is required' : null
          }
        })
      };
    }

    // Validate quotes structure
    for (const quote of quotes) {
      if (!quote.text || !quote.source) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'Invalid quote format',
            details: 'Each quote must have text and source'
          })
        };
      }
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
        console.error('Error creating user:', createError);
        throw new Error('Failed to create user account');
      }
      user = newUser;
    }

    // Store quotes
    const quoteRecords = quotes.map(quote => ({
      user_id: user.id,
      content: quote.text,
      author: quote.source,
      source: quote.link,
      tags: []
    }));

    const { error: quotesError } = await supabase
      .from('quotes')
      .insert(quoteRecords);

    if (quotesError) {
      console.error('Error storing quotes:', quotesError);
      throw new Error('Failed to store quotes');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Quotes processed successfully',
        quotesCount: quotes.length
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      })
    };
  }
};

export { handler };