import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export type User = {
  id: string;
  email: string;
  created_at: string;
}

export type FileUpload = {
  id: string;
  user_id: string;
  filename: string;
  created_at: string;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createUser(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function recordFileUpload(userId: string, filename: string): Promise<FileUpload | null> {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .insert([{
        user_id: userId,
        filename
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording file upload:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}