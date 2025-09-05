document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is an admin
    const token = window.sessionStorage.getItem('token');
    const email = window.sessionStorage.getItem('email');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = '../auth/login-page.html';
        return;
    }
    
    // Display user email
    if (email) {
        document.getElementById('admin-email').textContent = JSON.parse(email);
    }
    
    // Handle logout
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        window.sessionStorage.removeItem('token');
        window.sessionStorage.removeItem('email');
        window.location.href = '../auth/login-page.html';
    });
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Image preview functionality
    const imageFileInput = document.getElementById('product-image-file');
    const imageUrlInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    
    // Preview uploaded file
    imageFileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Product Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = `<span>Image preview will appear here</span>`;
        }
    });
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitButton = productForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        
        try {
            // Check if we have a file to upload
            const imageFile = imageFileInput.files[0];
            let imageUrl = '';
            
            if (imageFile) {
                // Upload image to Supabase Storage first
                imageUrl = await uploadImageToSupabase(imageFile, token);
            } else {
                showStatusMessage('Please select an image file', 'error');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                return;
            }
            
            // Set the image URL in the hidden input
            imageUrlInput.value = imageUrl;
            
            // Prepare product data
            const productData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                specs: document.getElementById('product-specs').value,
                brand: document.getElementById('product-brand').value,
                description: document.getElementById('product-description').value,
                image_url: imageUrl
            };
            
            // Send product data to server
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showStatusMessage('Product added successfully!', 'success');
                productForm.reset();
                imagePreview.innerHTML = `<span>Image preview will appear here</span>`;
                loadProducts(); // Refresh product list
            } else {
                showStatusMessage(`Error: ${result.error}`, 'error');
            }
        } catch (err) {
            showStatusMessage(`Error: ${err.message}`, 'error');
        } finally {
            // Restore button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
    
    // Function to upload image to Supabase Storage
    async function uploadImageToSupabase(file, token) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload image');
            }
            
            const result = await response.json();
            return result.url;
        } catch (error) {
            throw error;
        }
    }
    
    // Function to show status messages
    function showStatusMessage(message, type) {
        const statusMessageElement = document.getElementById('status-message');
        statusMessageElement.textContent = message;
        statusMessageElement.classList.remove('success-message', 'error-message');
        statusMessageElement.classList.add(`${type}-message`);
        statusMessageElement.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            statusMessageElement.style.display = 'none';
        }, 5000);
    }
    
    // Load products for the manage products tab
    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const products = await response.json();
                displayProducts(products);
            } else {
                const errorData = await response.json();
                showStatusMessage(`Error loading products: ${errorData.error}`, 'error');
            }
        } catch (err) {
            showStatusMessage(`Network error: ${err.message}`, 'error');
        }
    }
    
    // Display products in the manage products table
    function displayProducts(products) {
        const tableBody = document.getElementById('product-table-body');
        tableBody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            // Determine if image is a full URL or relative path
            const imageSrc = product.image_url.startsWith('http') ? 
                product.image_url : 
                `../../public/images/${product.image_url}`;
            
            row.innerHTML = `
                <td data-label="Image"><img src="${imageSrc}" alt="${product.name}" width="50" height="50" style="object-fit: cover;"></td>
                <td data-label="Name">${product.name}</td>
                <td data-label="Category">${product.category}</td>
                <td data-label="Price">R${product.price.toFixed(2)}</td>
                <td data-label="Stock">${product.stock}</td>
                <td data-label="Actions">
                    <button class="action-btn edit" data-id="${product.id}">Edit</button>
                    <button class="action-btn delete" data-id="${product.id}">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.action-btn.edit').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                editProduct(productId);
            });
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(button => {
            button.addEventListener('click', async function() {
                const productId = this.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
    }
    
    // Function to edit a product
    async function editProduct(productId) {
        try {
            // Fetch product details
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch product');
            }
            
            const product = await response.json();
            
            // Switch to add product tab
            document.querySelector('.tab-button[data-tab="add-product"]').click();
            
            // Fill form with product details
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-specs').value = product.specs || '';
            document.getElementById('product-brand').value = product.brand || '';
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-image').value = product.image_url;
            
            // Show image preview
            const imagePreview = document.getElementById('image-preview');
            if (product.image_url) {
                const imageSrc = product.image_url.startsWith('http') ? 
                    product.image_url : 
                    `../../public/images/${product.image_url}`;
                    
                imagePreview.innerHTML = `<img src="${imageSrc}" alt="${product.name}">`;
            }
            
            // Change submit button to update
            const submitButton = document.querySelector('.submit-btn');
            submitButton.textContent = 'Update Product';
            
            // Add hidden input for product ID
            let productIdInput = document.getElementById('product-id');
            if (!productIdInput) {
                productIdInput = document.createElement('input');
                productIdInput.type = 'hidden';
                productIdInput.id = 'product-id';
                productIdInput.name = 'id';
                productForm.appendChild(productIdInput);
            }
            productIdInput.value = productId;
            
            // Update form submission to handle updates
            productForm.removeEventListener('submit', handleFormSubmit);
            productForm.addEventListener('submit', handleFormUpdate);
            
        } catch (err) {
            showStatusMessage(`Error: ${err.message}`, 'error');
        }
    }
    
    // Function to handle form update
    async function handleFormUpdate(e) {
        e.preventDefault();
        
        const productId = document.getElementById('product-id').value;
        
        // Show loading state
        const submitButton = productForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;
        
        try {
            // Check if we have a file to upload
            const imageFile = imageFileInput.files[0];
            let imageUrl = document.getElementById('product-image').value;
            
            if (imageFile) {
                // Upload new image to Supabase Storage
                imageUrl = await uploadImageToSupabase(imageFile, token);
            }
            
            // Prepare product data
            const productData = {
                name: document.getElementById('product-name').value,
                category: document.getElementById('product-category').value,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                specs: document.getElementById('product-specs').value,
                brand: document.getElementById('product-brand').value,
                description: document.getElementById('product-description').value,
                image_url: imageUrl
            };
            
            // Send product data to server
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showStatusMessage('Product updated successfully!', 'success');
                
                // Reset form and switch back to manage products
                productForm.reset();
                imagePreview.innerHTML = `<span>Image preview will appear here</span>`;
                document.querySelector('.tab-button[data-tab="manage-products"]').click();
                
                // Change submit button back to add
                submitButton.textContent = 'Add Product';
                
                // Remove product ID input
                const productIdInput = document.getElementById('product-id');
                if (productIdInput) {
                    productIdInput.remove();
                }
                
                // Reset form submission handler
                productForm.removeEventListener('submit', handleFormUpdate);
                productForm.addEventListener('submit', handleFormSubmit);
                
                // Refresh product list
                loadProducts();
            } else {
                showStatusMessage(`Error: ${result.error}`, 'error');
            }
        } catch (err) {
            showStatusMessage(`Error: ${err.message}`, 'error');
        } finally {
            // Restore button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    }
    
    // Function to delete a product
    async function deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    showStatusMessage('Product deleted successfully!', 'success');
                    loadProducts(); // Refresh product list
                } else {
                    const errorData = await response.json();
                    showStatusMessage(`Error deleting product: ${errorData.error}`, 'error');
                }
            } catch (err) {
                showStatusMessage(`Network error: ${err.message}`, 'error');
            }
        }
    }
    
    // Store original form submit handler
    const handleFormSubmit = productForm.onsubmit;
    
    // Initial load of products
    loadProducts();
});