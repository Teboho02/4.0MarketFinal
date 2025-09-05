// Save this as database-test.js in your backend folder
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bvzsshxorcqrrkvbybho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2enNzaHhvcmNxcnJrdmJ5YmhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njk2OTIwNCwiZXhwIjoyMDYyNTQ1MjA0fQ.FaZog0hXqLhe8s-GPfvlP0C08WID0DwTYs5b4rcqv_A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test database connection
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Database error:', error.message);
      return;
    }
    
    console.log(`Successfully connected to database! Found ${products.length} products.`);
    
    // Display product categories
    const categories = {};
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = 0;
      }
      categories[product.category]++;
    });
    
    console.log('Products by category:');
    for (const [category, count] of Object.entries(categories)) {
      console.log(`- ${category}: ${count} products`);
    }
    
    // List a few products as examples
    console.log('\nSample products:');
    products.slice(0, 3).forEach(product => {
      console.log(`- ${product.name} (${product.category}): R${product.price}`);
    });
    
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
  }
}

// Run the test
testDatabaseConnection();
