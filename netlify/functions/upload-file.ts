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
    const { email, fileContent, fileName } = JSON.parse(event.body || '{}');

    if (!email || !fileContent || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Extract quotes based on file type
    const fileExt = fileName.toLowerCase().split('.').pop();
    let quotes: Quote[];
    
    try {
      if (fileExt === 'json') {
        quotes = parseJsonQuotes(fileContent);
      } else {
        quotes = parseTextQuotes(fileContent);
      }
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid file format. Please check the example format.' 
        }),
      };
    }

    // Validate quotes
    if (quotes.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'No valid quotes found in file. Please check the format.' 
        }),
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
      .insert([{ 
        user_id: user.id, 
        filename: fileName 
      }])
      .select()
      .single();

    if (uploadError) {
      throw new Error(`Error creating upload record: ${uploadError.message}`);
    }

    // Store quotes
    const quoteRecords = quotes.map(quote => ({
      user_id: user.id,
      upload_id: upload.id,
      quote_text: quote.text,
      source: quote.source,
      link: quote.link
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

function parseJsonQuotes(content: string): Quote[] {
  const data = JSON.parse(content);
  if (!Array.isArray(data.quotes)) {
    throw new Error('Invalid JSON format');
  }

  return data.quotes.map(quote => {
    if (!quote.text || !quote.source) {
      throw new Error('Each quote must have text and source');
    }
    return {
      text: quote.text.trim(),
      source: quote.source.trim(),
      link: quote.link?.trim()
    };
  });
}

function parseTextQuotes(content: string): Quote[] {
  const blocks = content.split('==').map(block => block.trim()).filter(Boolean);
  
  return blocks.map(block => {
    const parts = block.split('--').map(part => part.trim());
    if (parts.length < 2) {
      throw new Error('Each quote must have text and source');
    }
    
    return {
      text: parts[0],
      source: parts[1],
      link: parts[2]
    };
  });
}

export { handler };