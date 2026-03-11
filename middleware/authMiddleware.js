import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const requireAdmin = async (req, res, next) => {
  // Must run after authenticateToken
  const user = req.user
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const isAdmin =
    user.role === 'admin' ||
    user.email?.includes('admin') ||
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin'

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  }

  next()
}

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(403).json({ error: 'Forbidden: Invalid token', details: error?.message });
    }

    req.user = data.user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};
