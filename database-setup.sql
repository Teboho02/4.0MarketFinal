-- DROP existing tables and triggers if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- ===========================================
-- ✅ Create products table (RLS disabled)
-- ===========================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    specs TEXT,
    brand TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- ✅ Create orders table (RLS disabled)
-- ===========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    billing_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- ✅ Create order_items table (RLS disabled)
-- ===========================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- ✅ Create user_profiles table (RLS disabled)
-- ===========================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    full_name TEXT,
    address TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================
-- (OPTIONAL) Trigger for auto-creating user profile
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- ✅ Insert test products
-- ===========================================
INSERT INTO products (name, category, price, stock, specs, brand, description, image_url)
VALUES 
    ('MacBook Pro 16"', 'laptops', 29999.00, 10, 'M3 Max • 32GB RAM • 1TB SSD', 'Apple', 'The most powerful MacBook Pro ever.', 'macbook.png'),
    ('Dell XPS 15', 'laptops', 24599.00, 8, 'Intel i7 • 16GB RAM • 1TB SSD', 'Dell', 'Premium Windows laptop.', 'dell.png'),
    ('iPhone 16 Pro Max', 'smartphones', 14199.00, 15, 'A17 Pro • 256GB', 'Apple', 'Apple flagship smartphone.', 'iphone16.png'),
    ('PS5 Digital Edition', 'gaming', 14099.00, 5, '825GB SSD • 4K • 120fps', 'Sony', 'Next-gen console.', 'ps5.png');
