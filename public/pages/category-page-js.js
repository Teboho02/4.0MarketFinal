document.addEventListener('DOMContentLoaded', function() {
    // Determine which category page we're on
    const pathName = window.location.pathname;
    let category;
    
    if (pathName.includes('laptop-page')) {
        category = 'laptops';
    } else if (pathName.includes('smartphone-page')) {
        category = 'smartphones';
    } else if (pathName.includes('gaming-page')) {
        category = 'gaming';
    }
    
    if (!category) {
        console.error('Unknown category page');
        return;
    }
    
    // Display user email if logged in
    if (window.sessionStorage.getItem('email')) {
        const userEmail = JSON.parse(window.sessionStorage.getItem('email'));
        const headerEmailEl = document.createElement('div');
        headerEmailEl.id = 'header-email';
        headerEmailEl.textContent = userEmail;
        document.querySelector('.nav-menu').prepend(headerEmailEl);
    } else {
        // Add login link if not logged in
        const loginLink = document.createElement('a');
        loginLink.href = './login-page.html';
        loginLink.textContent = 'Login';
        document.querySelector('.nav-menu').insertBefore(loginLink, document.querySelector('.cart-icon'));
    }
    
    // Initialize cart
    initializeCart();
    
    // Fetch products for this category
    fetchCategoryProducts(category);
    
    // Add event listeners for filter selects
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', function() {
            applyFilters(category);
        });
    });
});

function initializeCart() {
    // Initialize cart if it doesn't exist in local storage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Update cart count
    updateCartCount();
}

function updateCartCount() {
    // Get cart from local storage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total quantity
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count in header
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = totalItems;
    
    // Show/hide cart count based on number of items
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

async function fetchCategoryProducts(category) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/category/${category}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        
        // Store the full product list for filtering
        window.allProducts = products;
        
        // Display products
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        const productsContainer = document.querySelector('.products');
        productsContainer.innerHTML = `
            <div class="error-message">
                <p>Could not load products. Please try again later.</p>
            </div>
        `;
    }
}

function displayProducts(products) {
    const productsContainer = document.querySelector('.products');
    
    // If no products, show message
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <p>No products available in this category.</p>
            </div>
        `;
        return;
    }
    
    // Clear current products
    productsContainer.innerHTML = '';
    
    // Add products from database
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-price', product.price);
        productCard.setAttribute('data-brand', product.brand);
        
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-specs">${product.specs}</p>
                <p class="product-price">R${parseFloat(product.price).toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image_url}">Add to Cart</button>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
    });
    
    // Add event listeners to the "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

function addToCart(productId, productName, productPrice, productImage) {
    // Get current cart from local storage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        // Increment quantity if product already in cart
        existingProduct.quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save updated cart to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show feedback to user
    alert(`${productName} added to cart!`);
}

function applyFilters(category) {
    // Get filter values
    const priceFilter = document.querySelector('select[aria-label="Price Range"]').value;
    const brandFilter = document.querySelector('select[aria-label="Brand"]').value;
    const categoryFilter = document.querySelector('select[aria-label="Category Filter"]')?.value;
    
    // Get all products
    let filteredProducts = window.allProducts || [];
    
    // Apply price filter
    if (priceFilter && priceFilter !== 'All Prices') {
        if (priceFilter === 'Under R5,000') {
            filteredProducts = filteredProducts.filter(product => product.price < 5000);
        } else if (priceFilter === 'R5,000 - R10,000') {
            filteredProducts = filteredProducts.filter(product => product.price >= 5000 && product.price <= 10000);
        } else if (priceFilter === 'R10,000 - R20,000') {
            filteredProducts = filteredProducts.filter(product => product.price >= 10000 && product.price <= 20000);
        } else if (priceFilter === 'Over R20,000') {
            filteredProducts = filteredProducts.filter(product => product.price > 20000);
        }
    }
    
    // Apply brand filter
    if (brandFilter && brandFilter !== 'All Brands') {
        filteredProducts = filteredProducts.filter(product => product.brand === brandFilter);
    }
    
    // Apply sub-category filter if available (e.g., "Business" for laptops)
    if (categoryFilter && categoryFilter !== 'All Categories') {
        // This would require sub-categories to be stored in the database
        // For now, this is a placeholder
    }
    
    // Display filtered products
    displayProducts(filteredProducts);
}