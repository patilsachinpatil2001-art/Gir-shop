// Checkout page JavaScript with intentional vulnerabilities

let orderSubtotal = 0;
let orderShipping = 0;
let orderTax = 0;
let orderTotal = 0;

// Initialize checkout page
function initCheckout() {
    const user = getCurrentUser();
    if (!user) {
        showAlert('Please login to continue', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
        showAlert('Your cart is empty', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }
    
    // Pre-fill user information
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone;
    document.getElementById('address').value = user.address;
    
    // Load order summary
    loadOrderSummary();
    
    // Setup payment method change handler
    setupPaymentMethodHandlers();
}

// Load order summary
function loadOrderSummary() {
    const cart = getCart();
    const orderItemsDiv = document.getElementById('orderItems');
    
    // Display cart items
    orderItemsDiv.innerHTML = cart.map(item => `
        <div class="summary-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    // Calculate totals (VULNERABILITY: Client-side calculation)
    orderSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderShipping = orderSubtotal >= 50 ? 0 : 5.99;
    orderTax = orderSubtotal * 0.08; // 8% tax
    orderTotal = orderSubtotal + orderShipping + orderTax;
    
    // Update summary display
    document.getElementById('summarySubtotal').textContent = formatCurrency(orderSubtotal);
    document.getElementById('summaryShipping').textContent = orderShipping === 0 ? 'FREE' : formatCurrency(orderShipping);
    document.getElementById('summaryTax').textContent = formatCurrency(orderTax);
    document.getElementById('summaryTotal').textContent = formatCurrency(orderTotal);
    
    // VULNERABILITY: Store order data in hidden fields (can be tampered)
    document.getElementById('hiddenTotal').value = orderTotal;
    document.getElementById('hiddenItems').value = JSON.stringify(cart);
}

// Setup payment method handlers
function setupPaymentMethodHandlers() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardDetails = document.getElementById('cardDetails');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            
            const selectedMethod = option.querySelector('input[type="radio"]').value;
            if (selectedMethod === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

// VULNERABILITY: Handle checkout submission with no server validation
async function handleCheckout(event) {
    event.preventDefault();
    
    const user = getCurrentUser();
    const cart = getCart();
    
    // Get form data
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // VULNERABILITY: Get total from hidden field (can be tampered!)
    const tamperedTotal = parseFloat(document.getElementById('hiddenTotal').value);
    const tamperedItems = document.getElementById('hiddenItems').value;
    
    console.log('ORIGINAL TOTAL:', orderTotal);
    console.log('SUBMITTED TOTAL:', tamperedTotal);
    
    if (tamperedTotal !== orderTotal) {
        console.log('%c⚠️ PARAMETER TAMPERING DETECTED!', 'color: red; font-size: 16px; font-weight: bold;');
        console.log(`Total changed from $${orderTotal.toFixed(2)} to $${tamperedTotal.toFixed(2)}`);
    }
    
    // VULNERABILITY: No validation of card details
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        
        console.log('Card Details (NO VALIDATION):');
        console.log('Card Number:', cardNumber);
        console.log('Expiry:', expiry);
        console.log('CVV:', cvv);
    }
    
    // Create order (VULNERABILITY: Uses tampered total from client)
    try {
        const orderData = {
            userId: user.id,
            items: tamperedItems, // VULNERABILITY: Items from hidden field
            totalAmount: tamperedTotal, // VULNERABILITY: Total from hidden field
            status: 'Confirmed',
            paymentMethod: paymentMethod,
            shippingAddress: address
        };
        
        const response = await fetch('tables/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const order = await response.json();
        
        // Clear cart after successful order
        localStorage.removeItem('girshop_cart');
        
        // Show success message
        showAlert('🎉 Order placed successfully!', 'success');
        
        // Redirect to success page with order details
        setTimeout(() => {
            const orderInfo = encodeURIComponent(JSON.stringify({
                orderId: order.id,
                total: tamperedTotal,
                items: cart.length,
                paymentMethod: paymentMethod
            }));
            window.location.href = `order-success.html?order=${orderInfo}`;
        }, 2000);
        
    } catch (error) {
        console.error('Order placement error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    }
}

// VULNERABILITY FUNCTIONS: Exposed for testing parameter tampering

// Function to tamper with order total (VULNERABILITY)
window.tamperOrderAmount = function(newTotal) {
    document.getElementById('hiddenTotal').value = newTotal;
    document.getElementById('summaryTotal').textContent = formatCurrency(newTotal);
    console.log(`%c💰 PARAMETER TAMPERING: Order total changed to $${newTotal}`, 'color: green; font-size: 14px; font-weight: bold;');
    showAlert(`Order total tampered to $${newTotal}!`, 'success');
};

// Function to modify order items (VULNERABILITY)
window.tamperOrderItems = function(newItems) {
    document.getElementById('hiddenItems').value = JSON.stringify(newItems);
    console.log('%c📦 PARAMETER TAMPERING: Order items modified', 'color: green; font-size: 14px; font-weight: bold;');
    console.log('New items:', newItems);
    showAlert('Order items tampered!', 'success');
};

// Function to apply discount (VULNERABILITY)
window.applyHiddenDiscount = function(discountPercent) {
    const newTotal = orderTotal * (1 - discountPercent / 100);
    document.getElementById('hiddenTotal').value = newTotal;
    document.getElementById('summaryTotal').textContent = formatCurrency(newTotal);
    console.log(`%c🎁 PARAMETER TAMPERING: Applied ${discountPercent}% discount`, 'color: green; font-size: 14px; font-weight: bold;');
    showAlert(`${discountPercent}% discount applied! (Parameter Tampering)`, 'success');
};

// Function to set free order (VULNERABILITY)
window.setFreeOrder = function() {
    tamperOrderAmount(0);
    console.log('%c🎉 PARAMETER TAMPERING: Order set to FREE!', 'color: green; font-size: 14px; font-weight: bold;');
    showAlert('Order is now FREE! (Parameter Tampering)', 'success');
};

// Log available vulnerability functions
console.log('%c🔓 PARAMETER TAMPERING FUNCTIONS AVAILABLE:', 'color: red; font-size: 16px; font-weight: bold;');
console.log('%ctamperOrderAmount(newTotal) - Change order total', 'color: orange;');
console.log('%capplyHiddenDiscount(percent) - Apply discount percentage', 'color: orange;');
console.log('%csetFreeOrder() - Set order total to $0', 'color: orange;');
console.log('%ctamperOrderItems(newItems) - Modify order items', 'color: orange;');
console.log('%cExample: tamperOrderAmount(10)', 'color: green;');
console.log('%cExample: applyHiddenDiscount(99)', 'color: green;');
console.log('%cExample: setFreeOrder()', 'color: green;');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});