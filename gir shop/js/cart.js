// Shopping cart JavaScript with intentional vulnerabilities

// Render cart page
function renderCart() {
    const cart = getCart();
    const cartContent = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    // Calculate totals (VULNERABILITY: Client-side calculation only)
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    cartContent.innerHTML = `
        <div class="cart-content">
            <div class="cart-items">
                <h2>Cart Items (${cart.length})</h2>
                ${cart.map(item => `
                    <div class="cart-item" data-product-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h3 class="cart-item-name">${item.name}</h3>
                            <div class="cart-item-category">${item.category}</div>
                            <div class="cart-item-price">${formatCurrency(item.price)} each</div>
                            <div class="cart-item-actions">
                                <div class="quantity-controls">
                                    <button onclick="decreaseQuantity('${item.id}')">-</button>
                                    <span id="qty-${item.id}">${item.quantity}</span>
                                    <button onclick="increaseQuantity('${item.id}')">+</button>
                                </div>
                                <button class="remove-btn" onclick="removeItem('${item.id}')">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                            <div style="margin-top: 10px; font-weight: bold; color: var(--secondary-color);">
                                Subtotal: ${formatCurrency(item.price * item.quantity)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="cart-summary">
                <h2>Order Summary</h2>
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span id="subtotal">${formatCurrency(subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span id="shipping">${shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (8%):</span>
                    <span id="tax">${formatCurrency(tax)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span id="total">${formatCurrency(total)}</span>
                </div>
                <button class="checkout-btn" onclick="proceedToCheckout()">
                    <i class="fas fa-lock"></i> Proceed to Checkout
                </button>
                <a href="index.html" class="continue-shopping-btn" style="display: block; text-align: center; margin-top: 15px;">
                    Continue Shopping
                </a>
            </div>
        </div>
    `;
}

// VULNERABILITY: Client-side quantity manipulation without validation
function increaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity++;
        saveCart(cart);
        renderCart();
    }
}

function decreaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
            removeItem(productId);
        } else {
            saveCart(cart);
            renderCart();
        }
    }
}

function removeItem(productId) {
    if (confirm('Remove this item from cart?')) {
        removeFromCart(productId);
        renderCart();
        showAlert('Item removed from cart', 'info');
    }
}

function proceedToCheckout() {
    const user = getCurrentUser();
    if (!user) {
        showAlert('Please login to proceed to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    window.location.href = 'checkout.html';
}

// VULNERABILITY FUNCTIONS: Exposed for testing cart tampering

// Function to tamper with cart prices (VULNERABILITY)
window.editCartPrice = function(productId, newPrice) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        console.log(`CART TAMPERING: Changed ${item.name} price from $${item.price} to $${newPrice}`);
        item.price = newPrice;
        saveCart(cart);
        renderCart();
        showAlert(`Price changed to $${newPrice}! (Cart Tampering)`, 'success');
    } else {
        console.log('Product not found in cart');
    }
};

// Function to apply massive discount (VULNERABILITY)
window.tamperedCart = function() {
    const cart = getCart();
    cart.forEach(item => {
        item.price = item.price * 0.1; // 90% discount!
    });
    saveCart(cart);
    renderCart();
    console.log('CART TAMPERING: Applied 90% discount to all items!');
    showAlert('🎉 90% discount applied to all items! (Cart Tampering)', 'success');
};

// Function to set negative prices (VULNERABILITY)
window.setNegativePrice = function(productId, negativeAmount) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.price = negativeAmount;
        saveCart(cart);
        renderCart();
        console.log(`CART TAMPERING: Set negative price $${negativeAmount} for ${item.name}`);
        showAlert(`Negative price set! They'll pay YOU! (Cart Tampering)`, 'success');
    }
};

// Function to add unlimited quantity (VULNERABILITY)
window.setUnlimitedQuantity = function(productId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCart(cart);
        renderCart();
        console.log(`CART TAMPERING: Set quantity to ${quantity} for ${item.name}`);
        showAlert(`Quantity set to ${quantity}! (Cart Tampering)`, 'success');
    }
};

// Log available vulnerability functions
console.log('%c🔓 CART TAMPERING FUNCTIONS AVAILABLE:', 'color: red; font-size: 16px; font-weight: bold;');
console.log('%ceditCartPrice(productId, newPrice) - Change any product price', 'color: orange;');
console.log('%ctamperedCart() - Apply 90% discount to all items', 'color: orange;');
console.log('%csetNegativePrice(productId, negativeAmount) - Set negative price', 'color: orange;');
console.log('%csetUnlimitedQuantity(productId, quantity) - Set any quantity', 'color: orange;');
console.log('%cExample: editCartPrice("prod1", 1)', 'color: green;');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});