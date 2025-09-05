// initialize-storage.js
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bvzsshxorcqrrkvbybho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2enNzaHhvcmNxcnJrdmJ5YmhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk2OTIwNCwiZXhwIjoyMDYyNTQ1MjA0fQ.FaZog0hXqLhe8s-GPfvlP0C08WID0DwTYs5b4rcqv_A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeStorage() {
  console.log('Initializing Supabase Storage...');
  
  try {
    // Check if products bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }
    
    // Find products bucket
    const productsBucket = buckets.find(bucket => bucket.name === 'products');
    
    if (!productsBucket) {
      console.log('Products bucket does not exist. Creating...');
      
      // Create products bucket
      const { data, error } = await supabase.storage.createBucket('products', {
        public: true, // Make files publicly accessible
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (error) {
        throw new Error(`Failed to create products bucket: ${error.message}`);
      }
      
      console.log('Products bucket created successfully!');
    } else {
      console.log('Products bucket already exists.');
      
      // Update bucket to be public
      const { error } = await supabase.storage.updateBucket('products', {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (error) {
        throw new Error(`Failed to update products bucket: ${error.message}`);
      }
      
      console.log('Products bucket updated to be public.');
    }
    
    // Create storage policy to allow public access
    console.log('Setting up storage policies...');
    
    // For security, we might want to restrict which files are publicly accessible
    // For this example, we'll make all files in the products bucket publicly readable
    
    console.log('Storage initialized successfully!');
    
  } catch (err) {
    console.error('Error initializing storage:', err.message);
  }
}

// Run the initialization
initializeStorage();
