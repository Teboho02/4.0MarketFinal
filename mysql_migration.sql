    CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
    );

    -- =====================================================
    -- E-COMMERCE DATABASE SCHEMA
    -- =====================================================

    -- 1. CATEGORIES TABLE
    CREATE TABLE categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        parent_id INT NULL,
        image_url VARCHAR(500),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_parent (parent_id),
        INDEX idx_active (is_active)
    );

    -- 2. SUPPLIERS TABLE
    CREATE TABLE suppliers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(50),
        province VARCHAR(50),
        postal_code VARCHAR(10),
        country VARCHAR(50) DEFAULT 'South Africa',
        website VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        payment_terms TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_active (is_active)
    );

    -- 3. PRODUCTS TABLE
    CREATE TABLE products (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        category_id INT NOT NULL,
        brand VARCHAR(100),
        specifications JSON,
        wholesale_price DECIMAL(10,2) NOT NULL,
        retail_price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2),
        stock_quantity INT DEFAULT 0,
        min_stock_level INT DEFAULT 5,
        max_stock_level INT DEFAULT 100,
        sku VARCHAR(100) UNIQUE NOT NULL,
        supplier_sku VARCHAR(100),
        supplier_id INT NOT NULL,
        weight_kg DECIMAL(8,3),
        dimensions JSON,
        insurance_type ENUM('none', 'hills', 'other') DEFAULT 'none',
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        meta_title VARCHAR(200),
        meta_description TEXT,
        search_keywords TEXT,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_slug (slug),
        INDEX idx_category (category_id),
        INDEX idx_brand (brand),
        INDEX idx_sku (sku),
        INDEX idx_supplier (supplier_id),
        INDEX idx_active (is_active),
        INDEX idx_featured (is_featured),
        FULLTEXT idx_search (name, description, search_keywords)
    );

    -- 4. PRODUCT IMAGES TABLE
    CREATE TABLE product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id CHAR(36) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(200),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_primary (product_id, is_primary)
    );

    -- 5. PRODUCT TAGS TABLE
    CREATE TABLE tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(20) DEFAULT 'blue',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_slug (slug)
    );

    -- 6. PRODUCT_TAGS (Many-to-Many)
    CREATE TABLE product_tags (
        product_id CHAR(36) NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (product_id, tag_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    -- 7. ORDERS TABLE
    CREATE TABLE orders (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id CHAR(36) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        shipping_cost DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash', 'card', 'eft', 'credit') NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        shipping_address TEXT,
        billing_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_order_number (order_number),
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_created (created_at)
    );

    -- 8. ORDER ITEMS TABLE
    CREATE TABLE order_items (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        order_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        product_sku VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        wholesale_price DECIMAL(10,2) NOT NULL,
        retail_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        INDEX idx_order (order_id),
        INDEX idx_product (product_id)
    );

    -- 9. INVENTORY TRANSACTIONS TABLE
    CREATE TABLE inventory_transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id CHAR(36) NOT NULL,
        transaction_type ENUM('purchase', 'sale', 'return', 'adjustment', 'damaged') NOT NULL,
        quantity INT NOT NULL,
        cost_per_unit DECIMAL(10,2),
        reference_type ENUM('order', 'purchase_order', 'manual') NOT NULL,
        reference_id CHAR(36),
        notes TEXT,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_product (product_id),
        INDEX idx_type (transaction_type),
        INDEX idx_created (created_at)
    );

    -- 10. PURCHASE ORDERS TABLE (for inventory management)
    CREATE TABLE purchase_orders (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INT NOT NULL,
        status ENUM('draft', 'sent', 'received', 'cancelled') DEFAULT 'draft',
        total_amount DECIMAL(10,2) NOT NULL,
        expected_delivery DATE,
        received_date DATE,
        notes TEXT,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_po_number (po_number),
        INDEX idx_supplier (supplier_id),
        INDEX idx_status (status)
    );

    -- 11. PURCHASE ORDER ITEMS TABLE
    CREATE TABLE purchase_order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        purchase_order_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        quantity INT NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        received_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id),
        INDEX idx_po (purchase_order_id),
        INDEX idx_product (product_id)
    );

    -- 12. CUSTOMER ADDRESSES TABLE
    CREATE TABLE customer_addresses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id CHAR(36) NOT NULL,
        address_type ENUM('shipping', 'billing', 'both') NOT NULL,
        address_line1 VARCHAR(200) NOT NULL,
        address_line2 VARCHAR(200),
        city VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(50) DEFAULT 'South Africa',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_default (user_id, is_default)
    );

