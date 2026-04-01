// Home page specific JavaScript

let allProducts = [];

// Load products on page load
async function loadProducts() {
    allProducts = await fetchProducts();
    displayProducts(allProducts);
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">No products found.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => generateProductCard(product)).join('');
}

// Filter and sort products
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = allProducts;
    
    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Sort products
    switch (sortFilter) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    displayProducts(filtered);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});