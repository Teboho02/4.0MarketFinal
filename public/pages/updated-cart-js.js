document.addEventListener('DOMContentLoaded', function() {
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
    
    // Load cart items
    loadCartItems();
    
    // Add event listener for clear cart button
    const clearCartBtn = document.querySelector('.cart-header .remove-item');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
                loadCartItems(); // Reload cart UI
            }
        });
    }
    
    // Add event listener for checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const token = window.sessionStorage.getItem('token');
            if (!token) {
                alert('Please log in to complete your purchase.');
                window.location.href = './login-page.html';
                return;
            }
            
            // Process checkout
            alert('Thank you for your order! Your purchase has been processed.');
            clearCart();
            loadCartItems(); // Reload cart UI
        });
    }
});

function loadCartItems() {
    // Get cart from local storage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Get cart section and order summary
    const cartSection = document.querySelector('.cart-section');
    const orderSummary = document.querySelector('.order-summary');
    
    // Update cart count in header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // If cart is empty, show empty cart message
    if (cart.length === 0) {
        cartSection.innerHTML = `
            <div class="cart-header">
                <h1>Your Cart</h1>
            </div>
            <div class="empty-cart">
                <p>Your cart is empty. <a href="./Home.html">Continue shopping</a></p>
            </div>
        `;
        
        // Hide order summary if cart is empty
        if (orderSummary) {
            orderSummary.style.display = 'none';
        }
        return;
    }
    
    // Show order summary if cart has items
    if (orderSummary) {
        orderSummary.style.display = 'block';
    }
    
    // Generate cart header with clear button
    cartSection.innerHTML = `
        <div class="cart-header">
            <h1>Your Cart</h1>
            <button class="remove-item">Clear Cart</button>
        </div>
    `;
    
    // Reattach clear cart event listener
    const clearCartBtn = document.querySelector('.cart-header .remove-item');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
                loadCartItems();
            }
        });
    }
    
    // Add each cart item to the cart section
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="quantity-control">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <input type="text" value="${item.quantity}" class="quantity-input" readonly>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="cart-item-price">R${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-item" data-id="${item.id}">✕</button>
        `;
        cartSection.appendChild(cartItem);
    });
    
    // Add event listeners for quantity buttons and remove item buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            decreaseQuantity(productId);
            loadCartItems();
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            increaseQuantity(productId);
            loadCartItems();
        });
    });
    
    document.querySelectorAll('.cart-item .remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
            loadCartItems();
        });
    });
    
    // Update order summary
    updateOrderSummary(cart);
}

function updateOrderSummary(cart) {
    const orderSummary = document.querySelector('.order-summary');
    if (!orderSummary) return;
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate shipping (free over R5000, otherwise R299)
    const shipping = subtotal > 5000 ? 0 : 299;
    
    // Calculate tax (15%)
    const tax = subtotal * 0.15;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update order summary HTML
    orderSummary.innerHTML = `
        <h2>Order Summary</h2>
        <div class="summary-row">
            <span>Subtotal</span>
            <span>R${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'Free' : 'R' + shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (15%)</span>
            <span>R${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row summary-total">
            <span>Total</span>
            <span>R${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn">Proceed to Checkout</button>
    `;
    
    // Reattach checkout button event listener
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const token = window.sessionStorage.getItem('token');
            if (!token) {
                alert('Please log in to complete your purchase.');
                window.location.href = './login-page.html';
                return;
            }
            
            // Process checkout
            alert('Thank you for your order! Your purchase has been processed.');
            clearCart();
            loadCartItems();
        });
    }
}

function increaseQuantity(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        product.quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

function decreaseQuantity(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = cart.find(item => item.id === productId);
    
    if (product) {
        if (product.quantity > 1) {
            product.quantity -= 1;
        } else {
            // If quantity is 1, remove the item
            removeFromCart(productId);
            return;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

function removeFromCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
}