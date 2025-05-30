import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Quote {
  text: string;
  source: string;
  link?: string;
}

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
    const { email, quotes } = JSON.parse(event.body || '{}');

    if (!email || !quotes || !Array.isArray(quotes) || quotes.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Validate quotes
    for (const quote of quotes) {
      if (!quote.text || !quote.source) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: 'Each quote must have text and source' 
          }),
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
        throw new Error(`Error creating user: ${createError.message}`);
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
      throw new Error(`Error storing quotes: ${quotesError.message}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Quotes processed successfully',
        quotesCount: quotes.length
      }),
    };
  } catch (error) {
    console.error('Error processing quotes:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Error processing quotes',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };