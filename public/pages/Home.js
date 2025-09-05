document.addEventListener('DOMContentLoaded', function() {
    const headeremail = document.getElementById('header-email');
    const token = window.sessionStorage.getItem('token');
    
    // Display user email if logged in
    if (window.sessionStorage.getItem('email')) {
        headeremail.innerHTML = JSON.parse(window.sessionStorage.getItem('email'));
        headeremail.style.display = 'block';
    } else {
        // Add login link if not logged in
        const loginLink = document.createElement('a');
        loginLink.href = '../auth/login-page.html';
        loginLink.textContent = 'Login';
        document.querySelector('.nav-menu').insertBefore(loginLink, document.querySelector('.cart-icon'));
    }
    
    // Slider functionality
    initializeSlider();
    
    // Fetch products from database
    fetchProducts();
    
    // Initialize cart functionality
    initializeCart();
});

function initializeSlider() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentIndex = 0;

    // Set initial position
    updateSlider();

    // Set up dots functionality
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });

    // Auto-rotate slides
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }, 5000);

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

async function fetchProducts() {
    try {
        console.log('Fetching products...');
        
        // Fetch all products first
        const allProductsResponse = await fetch('http://localhost:3000/api/products');
        if (!allProductsResponse.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const allProducts = await allProductsResponse.json();
        console.log('All products loaded:', allProducts.length);
        
        // Group products by category
        const laptops = allProducts.filter(product => product.category === 'laptops');
        const smartphones = allProducts.filter(product => product.category === 'smartphones');
        const gaming = allProducts.filter(product => product.category === 'gaming');
        const accessories = allProducts.filter(product => product.category === 'accessories');
        
        // Display products by category
        displayProductsByCategory('Laptops', laptops.slice(0, 4));
        displayProductsByCategory('Smartphones', smartphones.slice(0, 4));
        displayProductsByCategory('Gaming', gaming.slice(0, 4));
        displayProductsByCategory('Accessories', accessories.slice(0, 4));
        
    } catch (error) {
        console.error('Error fetching products:', error);
        // Display fallback message on each product shelf
        const shelves = document.querySelectorAll('.product-shelf');
        shelves.forEach(shelf => {
            const productGrid = shelf.querySelector('.product-grid');
            productGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>Could not load products. Please try again later.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        });
    }
}

function displayProductsByCategory(categoryTitle, products) {
    // Find the product shelf with the matching category title
    const shelves = document.querySelectorAll('.product-shelf');
    let targetShelf = null;
    
    for (const shelf of shelves) {
        const header = shelf.querySelector('.shelf-header h2');
        if (header && header.textContent === categoryTitle) {
            targetShelf = shelf;
            break;
        }
    }
    
    if (!targetShelf) {
        console.error(`Product shelf for category "${categoryTitle}" not found`);
        return;
    }
    
    const productGrid = targetShelf.querySelector('.product-grid');
    
    // If no products for this category or grid not found, return
    if (!productGrid) {
        console.error(`Product grid for category "${categoryTitle}" not found`);
        return;
    }
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p>No products available in this category.</p>
            </div>
        `;
        return;
    }
    
    // Clear existing hardcoded products
    productGrid.innerHTML = '';
    
    // Add products from database
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Note: Make sure image paths are correct
        const imagePath = product.image_url.startsWith('http') ? 
            product.image_url : 
            `../../public/images/${product.image_url}`;
            
        productCard.innerHTML = `
            <img src="${imagePath}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-specs">${product.specs || ''}</p>
                <p class="product-price">R${parseFloat(product.price).toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${imagePath}">Add to Cart</button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Add event listeners to the new "Add to Cart" buttons
    targetShelf.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

function initializeCart() {
    // Initialize cart if it doesn't exist in local storage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Update cart count
    updateCartCount();
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

function updateCartCount() {
    // Get cart from local storage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate total quantity
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart count in header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
        
        // Show/hide cart count based on number of items
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}