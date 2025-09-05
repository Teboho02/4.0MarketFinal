import fs from 'fs';
import path from 'path';
import supabase from '../config/supabaseClient.js';



export const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const timestamp = Date.now();

    // Check if it's a single or multiple upload
    const files = req.files || (req.file ? [req.file] : null);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file(s) uploaded' });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const filePath = file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const storagePath = `products/${userId}/${timestamp}_${path.basename(file.originalname)}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      fs.unlinkSync(filePath); // Delete temp file

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(storagePath);

      uploadedFiles.push({
        name: file.originalname,
        url: urlData.publicUrl,
        file: data,
      });
    }

    res.status(200).json({
      message: 'File(s) uploaded successfully',
      files: uploadedFiles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
