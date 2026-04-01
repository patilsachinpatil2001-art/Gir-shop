// Common utilities and functions used across all pages

// Get cart from localStorage (VULNERABILITY: Client-side storage manipulation)
function getCart() {
    const cart = localStorage.getItem('girshop_cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage (VULNERABILITY: No server validation)
function saveCart(cart) {
    localStorage.setItem('girshop_cart', JSON.stringify(cart));
    updateCartBadge();
}

// Update cart badge count
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
    }
}

// Add item to cart (VULNERABILITY: Price can be manipulated client-side)
function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price, // VULNERABILITY: Client controls price
            image: product.image,
            category: product.category,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showAlert('Product added to cart!', 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

// Update cart item quantity (VULNERABILITY: No stock validation)
function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
        }
    }
}

// Get current user from localStorage (VULNERABILITY: No secure authentication)
function getCurrentUser() {
    const user = localStorage.getItem('girshop_user');
    return user ? JSON.parse(user) : null;
}

// Save user session (VULNERABILITY: Client-side session management)
function saveUserSession(user) {
    localStorage.setItem('girshop_user', JSON.stringify(user));
    updateUserDisplay();
}

// Logout user
function logout() {
    localStorage.removeItem('girshop_user');
    localStorage.removeItem('girshop_cart');
    window.location.href = 'index.html';
}

// Update user display in header
function updateUserDisplay() {
    const user = getCurrentUser();
    const userLabel = document.getElementById('userLabel');
    const userBtn = document.getElementById('userBtn');
    
    if (user && userLabel) {
        userLabel.textContent = user.name.split(' ')[0];
        userBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm('Do you want to logout?')) {
                logout();
            }
        };
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Fetch all products from API
async function fetchProducts(filters = {}) {
    try {
        let url = 'tables/products?limit=100';
        
        // Add filters if provided
        if (filters.category) {
            url += `&search=${filters.category}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        let products = result.data || [];
        
        // Client-side filtering (VULNERABILITY: Can be bypassed)
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        
        // Client-side sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'price-low':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
            }
        }
        
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Fetch single product by ID
async function fetchProductById(productId) {
    try {
        const response = await fetch(`tables/products/${productId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Generate product card HTML
function generateProductCard(product) {
    const stockClass = product.stock < 20 ? 'low-stock' : '';
    const stockText = product.stock < 20 ? `Only ${product.stock} left!` : 'In Stock';
    
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">${generateStarRating(product.rating)}</div>
                    <span class="rating-text">${product.rating}</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${formatCurrency(product.price)}</span>
                    <span class="original-price">${formatCurrency(product.originalPrice)}</span>
                    <span class="discount-badge">${product.discount}% OFF</span>
                </div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                <button class="add-to-cart-btn" onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})'>
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    updateUserDisplay();
});

// Search functionality (VULNERABILITY: No input sanitization)
function searchProducts(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm.trim()) {
        window.location.href = `categories.html?search=${encodeURIComponent(searchTerm)}`;
    }
}