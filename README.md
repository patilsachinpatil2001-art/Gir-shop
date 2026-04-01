# GIR Shop - E-Commerce Website with Intentional Security Vulnerabilities

## ⚠️ IMPORTANT DISCLAIMER

**This project is for EDUCATIONAL PURPOSES ONLY!**

This e-commerce website contains intentional security vulnerabilities designed for:
- Security testing and penetration testing practice
- Learning about common web application vulnerabilities
- Understanding secure coding practices by seeing what NOT to do
- Security training and awareness

**DO NOT use this code in production environments or real e-commerce applications!**

---

## 🛍️ Project Overview

**GIR Shop** is a fully functional e-commerce website similar to Flipkart and Amazon, featuring:
- 23+ products across multiple categories (Electronics, Clothes, Toys, Gift Items)
- Complete shopping experience with cart and checkout
- User authentication system
- Product browsing and search functionality
- Responsive design for all devices

---

## 🌐 Live Website URLs

### Main Pages
- **Home Page**: `index.html`
- **Login/Signup**: `login.html`
- **All Products**: `categories.html`
- **Shopping Cart**: `cart.html`
- **Checkout**: `checkout.html`
- **Order Success**: `order-success.html`

### Category Pages
- **Electronics**: `categories.html?category=Electronics`
- **Clothes**: `categories.html?category=Clothes`
- **Toys**: `categories.html?category=Toys`
- **Gift Items**: `categories.html?category=Gift Items`

### Search Functionality
- **Search**: `categories.html?search=<search_term>`

---

## 📊 Data Models & Storage

### Database Tables

#### 1. **products** Table
Stores all product information with the following fields:
- `id` (text): Unique product identifier
- `name` (text): Product name
- `category` (text): Product category
- `price` (number): Current selling price
- `originalPrice` (number): Original price before discount
- `discount` (number): Discount percentage
- `image` (text): Product image URL
- `description` (text): Product description
- `rating` (number): Product rating (0-5)
- `stock` (number): Available stock quantity

**Total Products**: 23 items across 4 categories

#### 2. **users** Table
Stores user account information:
- `id` (text): Unique user identifier
- `email` (text): User email address
- `name` (text): Full name
- `password` (text): Password (**VULNERABILITY: Stored in plaintext**)
- `phone` (text): Phone number
- `address` (text): Delivery address
- `lastOTP` (text): Last generated OTP (**VULNERABILITY: Stored insecurely**)

#### 3. **orders** Table
Stores order information:
- `id` (text): Unique order identifier
- `userId` (text): Reference to user
- `items` (text): JSON string of order items
- `totalAmount` (number): Total order amount
- `status` (text): Order status
- `paymentMethod` (text): Payment method used
- `shippingAddress` (text): Shipping address

### Storage Services Used
- **RESTful Table API**: Server-side data storage for products, users, and orders
- **localStorage**: Client-side storage for cart and user sessions (**VULNERABILITY**)

---

## 🔓 Intentional Security Vulnerabilities

### 1. **Parameter Tampering**

#### Location: Checkout Page (`checkout.html`)
**Description**: Order total and items are stored in hidden form fields that can be modified before submission.

**How to Exploit**:
```javascript
// Open browser console on checkout page
tamperOrderAmount(10);           // Set order total to $10
applyHiddenDiscount(99);         // Apply 99% discount
setFreeOrder();                  // Make order completely free
```

**Impact**: Users can pay any amount they want for their orders.

---

### 2. **Cart Tampering**

#### Location: Shopping Cart (`cart.html`)
**Description**: All cart data is stored client-side in localStorage with no server validation.

**How to Exploit**:
```javascript
// Open browser console on cart page
editCartPrice('prod1', 1);       // Change product price to $1
tamperedCart();                   // Apply 90% discount to all items
setNegativePrice('prod2', -100);  // Set negative price (they pay you!)
setUnlimitedQuantity('prod3', 999); // Set quantity to 999
```

**Impact**: Users can manipulate prices, quantities, and even set negative prices.

---

### 3. **No Rate Limiting**

#### Location: Login Page (`login.html`)
**Description**: No limits on login attempts, OTP requests, or signup submissions.

**How to Exploit**:
- Attempt unlimited login tries (brute force attacks possible)
- Request unlimited OTP codes
- Submit signup forms repeatedly

**Impact**: 
- Enables brute force password attacks
- OTP flooding/spam
- Account creation spam

---

### 4. **OTP Bypass Vulnerabilities**

#### Location: Signup Process (`login.html`)
**Description**: Multiple OTP security issues:

**Vulnerabilities**:
1. **OTP Displayed on Screen**: Generated OTP is shown directly on the page
2. **Bypass Code**: Magic code "123456" always works as valid OTP
3. **Client-Side Validation**: OTP verification happens only in browser
4. **Weak Generation**: Predictable 6-digit random OTP
5. **No Expiration**: OTP never expires
6. **Stored in Database**: Last OTP saved in user record

**How to Exploit**:
- Simply read the OTP displayed on screen
- Or enter "123456" to bypass any OTP check
- Inspect localStorage to see generated OTP

**Impact**: Complete bypass of two-factor authentication.

---

### 5. **Client-Side Authentication**

#### Location: Login System (`js/login.js`)
**Description**: All authentication logic runs in the browser.

**Vulnerabilities**:
- User session stored in localStorage (no secure tokens)
- Password comparison happens client-side
- No server-side session validation
- Plaintext passwords in database

**How to Exploit**:
```javascript
// Manually create session
localStorage.setItem('girshop_user', JSON.stringify({
    id: 'user123',
    name: 'Fake User',
    email: 'fake@example.com'
}));
```

**Impact**: Users can fake authentication and impersonate any user.

---

### 6. **Insecure Data Storage**

#### Vulnerabilities:
- **Passwords**: Stored in plaintext (no hashing)
- **Cart Data**: Stored in localStorage (easily manipulated)
- **User Sessions**: No secure session tokens
- **OTP Storage**: Last OTP saved in database

---

### 7. **No Server-Side Validation**

**Description**: All validation happens client-side only.

**Examples**:
- Cart prices and quantities not validated on server
- Order totals accepted as submitted from browser
- No verification of stock availability
- Payment details not validated

---

## 🎯 Completed Features

### ✅ Implemented Functionality

1. **Home Page**
   - Hero banner with promotional messages
   - Category showcase (4 categories)
   - Featured products grid with filtering and sorting
   - Responsive design

2. **Product Catalog**
   - 23+ products across 4 categories
   - Product details (name, price, discount, rating, stock)
   - Product images from Unsplash
   - Real-time search functionality
   - Category filtering
   - Sort by price, rating, discount

3. **User Authentication**
   - Login system
   - Signup with OTP verification
   - User profile storage
   - Session management (insecure)

4. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Remove items
   - Price calculation
   - Cart badge with item count

5. **Checkout Process**
   - Shipping information form
   - Payment method selection (Card, COD, UPI)
   - Order summary
   - Order placement
   - Order confirmation page

6. **Responsive Design**
   - Mobile-friendly layout
   - Tablet optimization
   - Desktop layout
   - Touch-friendly controls

---

## 🚧 Features Not Yet Implemented

1. **Order Tracking**
   - View order history
   - Track delivery status
   - Order details page

2. **Product Reviews**
   - User reviews and ratings
   - Review submission
   - Review moderation

3. **Wishlist**
   - Save products for later
   - Wishlist management
   - Move items to cart

4. **Product Filters**
   - Price range filter
   - Brand filter
   - Rating filter
   - Advanced search

5. **User Profile**
   - Edit profile information
   - Change password
   - Saved addresses
   - Payment methods

6. **Admin Panel**
   - Product management
   - Order management
   - User management
   - Analytics dashboard

---

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables
- **JavaScript (ES6+)**: Client-side functionality
- **Font Awesome**: Icons
- **Responsive Design**: Mobile-first approach

### Backend/Storage
- **RESTful Table API**: Data persistence
- **localStorage**: Client-side storage (insecure)

### External Resources
- **Unsplash**: Product images
- **cdnjs**: Font Awesome icons

---

## 📁 Project Structure

```
gir-shop/
├── index.html              # Home page
├── login.html              # Login/Signup page
├── categories.html         # Product catalog
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── order-success.html      # Order confirmation
├── css/
│   └── style.css          # Main stylesheet
└── js/
    ├── common.js          # Shared utilities
    ├── home.js            # Home page logic
    ├── login.js           # Authentication logic
    ├── categories.js      # Product catalog logic
    ├── cart.js            # Cart functionality
    └── checkout.js        # Checkout process
```

---

## 🚀 Recommended Next Steps

### 1. **Security Improvements** (For Learning)
   - Implement server-side validation for all user inputs
   - Add proper authentication with secure tokens (JWT)
   - Hash passwords using bcrypt or similar
   - Implement rate limiting on API endpoints
   - Add CSRF protection
   - Validate OTP on server-side with expiration
   - Implement secure session management

### 2. **Feature Enhancements**
   - Add product details page
   - Implement order history
   - Add user profile management
   - Create admin dashboard
   - Implement product reviews
   - Add wishlist functionality

### 3. **User Experience**
   - Add loading states
   - Implement better error handling
   - Add form validation feedback
   - Create breadcrumb navigation
   - Add product quick view

### 4. **Performance Optimization**
   - Implement lazy loading for images
   - Add pagination for products
   - Optimize API calls
   - Add caching strategy
   - Minimize and bundle JavaScript

---

## 🎓 Learning Resources

### Understanding the Vulnerabilities

1. **OWASP Top 10**: Study web application security risks
2. **Parameter Tampering**: Learn about input validation
3. **Cart Tampering**: Understand client-side vs server-side validation
4. **Authentication Security**: Study secure authentication patterns
5. **Rate Limiting**: Learn about API security

### Fixing the Vulnerabilities

- **Never trust client-side data**: Always validate on server
- **Hash passwords**: Use bcrypt, scrypt, or Argon2
- **Implement proper sessions**: Use secure, httpOnly cookies
- **Validate all inputs**: Server-side validation is mandatory
- **Use HTTPS**: Encrypt data in transit
- **Implement rate limiting**: Protect against brute force
- **Add CSRF tokens**: Protect against cross-site attacks

---

## 🛠️ How to Test Vulnerabilities

### Browser Console Testing

1. Open any page on the site
2. Press F12 or Right-click → Inspect
3. Go to Console tab
4. Try the exploit functions provided in hints

### Tools for Learning

- **Browser DevTools**: Inspect network requests, modify data
- **Burp Suite**: Intercept and modify HTTP requests
- **OWASP ZAP**: Automated security testing
- **Postman**: Test API endpoints directly

---

## 📞 Support & Contact

- **Email**: support@girshop.com
- **Phone**: 1-800-GIR-SHOP
- **Address**: 123 Shopping St, Mall City

---

## 📝 License

This project is created for educational purposes only. Use at your own risk.

---

## 🙏 Acknowledgments

- Product images from Unsplash
- Icons from Font Awesome
- Inspired by popular e-commerce platforms (Flipkart, Amazon)

---

**Remember**: These vulnerabilities are intentional for learning. Never implement such patterns in real applications! Always follow security best practices and keep your users' data safe. 🔒
