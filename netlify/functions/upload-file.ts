import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Quote {
  text: string;
  source?: string;
  link?: string;
}

const RATE_LIMIT = 10; // requests per minute
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(email);

  if (!userRequests || now - userRequests.timestamp > 60000) {
    requestCounts.set(email, { count: 1, timestamp: now });
    return false;
  }

  if (userRequests.count >= RATE_LIMIT) {
    return true;
  }

  userRequests.count++;
  return false;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseJsonQuotes(content: string): Quote[] {
  try {
    const data = JSON.parse(content);
    if (!Array.isArray(data.quotes)) {
      throw new Error('Invalid JSON format: missing quotes array');
    }

    return data.quotes.map(quote => {
      if (!quote.text) {
        throw new Error('Each quote must have text');
      }
      return {
        text: quote.text.trim(),
        source: quote.source?.trim(),
        link: quote.link?.trim()
      };
    });
  } catch (error) {
    throw new Error(`JSON parsing error: ${error instanceof Error ? error.message : 'Invalid format'}`);
  }
}

function parseStructuredText(content: string): Quote[] {
  const blocks = content.split('==').map(block => block.trim()).filter(Boolean);
  
  return blocks.map(block => {
    const parts = block.split('--').map(part => part.trim());
    if (!parts[0]) {
      throw new Error('Each quote must have text');
    }
    
    return {
      text: parts[0],
      source: parts[1],
      link: parts[2]
    };
  });
}

function parseMarkdown(content: string): Quote[] {
  const tokens = marked.lexer(content);
  const quotes: Quote[] = [];

  tokens.forEach(token => {
    if (token.type === 'blockquote') {
      const text = token.text.trim();
      const nextToken = tokens[tokens.indexOf(token) + 1];
      
      quotes.push({
        text,
        source: nextToken?.type === 'paragraph' ? nextToken.text : undefined
      });
    } else if (token.type === 'list') {
      token.items.forEach(item => {
        const parts = item.text.split('--').map(part => part.trim());
        quotes.push({
          text: parts[0],
          source: parts[1],
          link: parts[2]
        });
      });
    }
  });

  return quotes;
}

function parsePlainText(content: string): Quote[] {
  // Try different delimiters
  const lines = content.split(/\r?\n/).filter(Boolean);
  const quotes: Quote[] = [];
  let currentQuote = '';

  lines.forEach(line => {
    line = line.trim();
    
    // Skip empty lines
    if (!line) return;

    // Check if line starts with quote marks or bullet points
    if (line.match(/^["""']/) || line.match(/^[-*•]/) || line.match(/^\d+\./)) {
      if (currentQuote) {
        quotes.push({ text: currentQuote.trim() });
      }
      currentQuote = line.replace(/^["""'[-*•]\d+\.\s]/, '');
    } else if (line.match(/^--/)) {
      // This line is a source
      const lastQuote = quotes[quotes.length - 1];
      if (lastQuote) {
        lastQuote.source = line.replace(/^--\s*/, '');
      }
    } else if (line.match(/^https?:\/\//)) {
      // This line is a link
      const lastQuote = quotes[quotes.length - 1];
      if (lastQuote) {
        lastQuote.link = line;
      }
    } else {
      // Append to current quote or start new one
      if (currentQuote && !line.match(/^[A-Z]/)) {
        currentQuote += ' ' + line;
      } else {
        if (currentQuote) {
          quotes.push({ text: currentQuote.trim() });
        }
        currentQuote = line;
      }
    }
  });

  // Add last quote if exists
  if (currentQuote) {
    quotes.push({ text: currentQuote.trim() });
  }

  return quotes;
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

    // Validate input
    if (!email || !fileContent || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    if (!validateEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid email format' }),
      };
    }

    if (isRateLimited(email)) {
      return {
        statusCode: 429,
        body: JSON.stringify({ message: 'Too many requests. Please try again later.' }),
      };
    }

    // Parse quotes based on file type
    let quotes: Quote[] = [];
    const warnings: string[] = [];
    const fileExt = fileName.toLowerCase().split('.').pop();
    
    try {
      if (fileExt === 'json') {
        quotes = parseJsonQuotes(fileContent);
      } else if (fileExt === 'md' || fileExt === 'markdown') {
        quotes = parseMarkdown(fileContent);
      } else if (fileContent.includes('==') && fileContent.includes('--')) {
        quotes = parseStructuredText(fileContent);
      } else {
        quotes = parsePlainText(fileContent);
        if (quotes.length === 1) {
          warnings.push('Content treated as a single quote. Consider using structured format for better parsing.');
        }
      }
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Failed to parse file content',
          error: error instanceof Error ? error.message : 'Unknown error'
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
      content: quote.text,
      author: quote.source || null,
      source: quote.link || null,
      tags: [],
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
        quotesCount: quotes.length,
        warnings: warnings.length > 0 ? warnings : undefined
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

export { handler };