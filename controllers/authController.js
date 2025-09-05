import supabase from '../config/supabaseClient.js';

export const createAccount = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullname,
          role: 'regular'
        } 
      }
    });

    error 
      ? res.status(400).json({ error: error.message }) 
      : res.status(201).json({ message: 'Account created!', data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    error
      ? res.status(401).json({ error: error.message })
      : res.status(200).json({
          message: 'Login successful!',
          session: data.session,
          user: data.user,
        });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};