  import pool, { query, execute } from '../config/mysql.js';
  import bcrypt from 'bcryptjs';
  import jwt from 'jsonwebtoken';
  import { randomUUID } from 'crypto';
  import validator from 'validator'; // npm install validator

  const JWT_SECRET = 'djwajkh4ia3yeadawe823yeauhdLJAadwj83' ;
  const JWT_EXPIRES_IN = '7d';

  export const createAccount = async (req, res) => {
    try {
      const { email, password, fullname } = req.body;

      // ✅ Input validation
      if (!email || !password || !fullname) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // ✅ Sanitize and validate email
      const sanitizedEmail = validator.normalizeEmail(email);
      if (!validator.isEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // ✅ Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // ✅ Sanitize fullname (remove dangerous characters)
      const sanitizedFullname = validator.escape(fullname.trim());
      if (sanitizedFullname.length < 2 || sanitizedFullname.length > 255) {
        return res.status(400).json({ error: 'Name must be between 2 and 255 characters' });
      }

      // ✅ SAFE - Parameterized query
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ?',
        [sanitizedEmail]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      const userId = randomUUID();

      // ✅ SAFE - Parameterized query
      await execute(
        'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [userId, sanitizedEmail, password_hash, sanitizedFullname, 'regular']
      );

      const [newUser] = await query(
        'SELECT id, email, full_name, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      res.status(201).json({
        message: 'Account created!',
        data: { user: newUser }
      });
    } catch (err) {
      console.error('Create account error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };

  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // ✅ Sanitize and validate email
      const sanitizedEmail = validator.normalizeEmail(email);
      if (!validator.isEmail(sanitizedEmail)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // ✅ SAFE - Parameterized query
      const users = await query(
        'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
        [sanitizedEmail]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // ✅ SAFE - Parameterized query
      await execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      delete user.password_hash;

      res.status(200).json({
        message: 'Login successful!',
        session: {
          access_token: token,
          token_type: 'bearer',
          expires_in: JWT_EXPIRES_IN
        },
        user: user
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };

  export const verifyToken = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database using UUID
      const users = await query(
        'SELECT id, email, full_name, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = users[0];
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };