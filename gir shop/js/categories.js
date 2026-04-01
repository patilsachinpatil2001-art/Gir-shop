// Categories page JavaScript

let allProducts = [];
let urlParams = new URLSearchParams(window.location.search);

// Load products based on URL parameters
async function loadProducts() {
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (category) {
        pageTitle.textContent = category;
        document.getElementById('categoryFilter').value = category;
    } else if (search) {
        pageTitle.textContent = `Search Results for "${search}"`;
    } else {
        pageTitle.textContent = 'All Products';
    }
    
    // Fetch products
    allProducts = await fetchProducts();
    
    // Filter by category
    if (category) {
        allProducts = allProducts.filter(p => p.category === category);
    }
    
    // Filter by search
    if (search) {
        const searchLower = search.toLowerCase();
        allProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
        );
        
        // Update search input
        document.getElementById('searchInput').value = search;
    }
    
    displayProducts(allProducts);
    updateResultsInfo();
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; grid-column: 1/-1;">
                <i class="fas fa-shopping-basket" style="font-size: 4rem; color: #bdc3c7; margin-bottom: 20px;"></i>
                <h3>No products found</h3>
                <p style="color: #7f8c8d; margin-bottom: 20px;">Try different filters or search terms</p>
                <a href="index.html" class="continue-shopping-btn">Back to Home</a>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => generateProductCard(product)).join('');
}

// Update results information
function updateResultsInfo() {
    const info = document.getElementById('resultsInfo');
    const count = allProducts.length;
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    let text = `Showing ${count} product${count !== 1 ? 's' : ''}`;
    
    if (category) {
        text += ` in ${category}`;
    } else if (search) {
        text += ` for "${search}"`;
    }
    
    info.textContent = text;
}

// Filter and sort products
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    // Update URL without reload
    urlParams = new URLSearchParams(window.location.search);
    if (categoryFilter) {
        urlParams.set('category', categoryFilter);
    } else {
        urlParams.delete('category');
    }
    
    const newUrl = categoryFilter ? 
        `categories.html?category=${categoryFilter}` : 
        'categories.html';
    window.history.pushState({}, '', newUrl);
    
    // Reload products
    loadProducts().then(() => {
        // Apply sorting
        let filtered = [...allProducts];
        
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
            case 'discount':
                filtered.sort((a, b) => b.discount - a.discount);
                break;
        }
        
        displayProducts(filtered);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});