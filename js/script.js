// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartCountElement = document.getElementById('cart-count');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = themeToggleBtn.querySelector('i');
const themeText = themeToggleBtn.querySelector('span');
const notification = document.getElementById('notification');

// Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    initializeTheme();
    
    // Enable transitions after page has loaded
    setTimeout(() => {
        document.body.classList.add('transition-enabled');
    }, 100);
});

// Load products to the page
function loadProducts() {
    if (!productGrid) return; // Skip if not on the products page
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">GHS ${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <div class="quantity">
                        <input type="number" min="1" value="1" id="quantity-${product.id}">
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });

    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add to cart function
function addToCart(event) {
    const button = event.target;
    const productId = parseInt(button.getAttribute('data-id'));
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    // Find the product
    const product = products.find(p => p.id === productId);
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Update quantity if already in cart
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification();
    
    // Add animation to button
    button.classList.add('add-to-cart-animation');
    setTimeout(() => {
        button.classList.remove('add-to-cart-animation');
    }, 500);
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// Show notification
function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Theme toggle
function initializeTheme() {
    // Check if user has a saved preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply the theme
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    }
    
    // Add event listener to theme toggle button
    themeToggleBtn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    
    // Update icon and text
    if (isDarkMode) {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
}

// Cart page functions
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (!cartItemsContainer) return; // Skip if not on cart page
    
    if (cart.length === 0) {
        cartEmptyMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }
    
    cartEmptyMessage.style.display = 'none';
    cartSummary.style.display = 'block';
    cartItemsContainer.innerHTML = '';
    
    let subtotal = 0;
    
    // Load each cart item
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">GHS ${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="decrease-quantity" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity" data-id="${item.id}">+</button>
                </div>
                <div>Total: GHS ${itemTotal.toFixed(2)}</div>
                <button class="cart-item-remove" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity buttons and remove buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', removeCartItem);
    });
    
    // Update summary
    updateCartSummary(subtotal);
    
    // Checkout button event listener
    checkoutBtn.addEventListener('click', () => {
        checkoutForm.style.display = 'block';
        populateWigOptions();
    });
}

function decreaseQuantity(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCartItems();
    }
}

function increaseQuantity(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCartItems();
    }
}

function removeCartItem(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCartItems();
    }
}

function updateCartSummary(subtotal) {
    const subtotalElement = document.getElementById('summary-subtotal');
    const totalElement = document.getElementById('summary-total');
    
    if (!subtotalElement || !totalElement) return;
    
    subtotalElement.textContent = `GHS ${subtotal.toFixed(2)}`;
    totalElement.textContent = `GHS ${subtotal.toFixed(2)}`;
}

function populateWigOptions() {
    const wigUnitSelect = document.getElementById('wig-unit');
    const priceInput = document.getElementById('price');
    
    if (!wigUnitSelect || !priceInput) return;
    
    // Clear existing options
    wigUnitSelect.innerHTML = '';
    
    // Add cart items as options
    cart.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = `${item.name} (Qty: ${item.quantity})`;
        option.setAttribute('data-price', item.price * item.quantity);
        wigUnitSelect.appendChild(option);
    });
    
    // Set initial price
    if (cart.length > 0) {
        const firstItemPrice = cart[0].price * cart[0].quantity;
        priceInput.value = `GHS ${firstItemPrice.toFixed(2)}`;
    }
    
    // Update price when selection changes
    wigUnitSelect.addEventListener('change', () => {
        const selectedOption = wigUnitSelect.options[wigUnitSelect.selectedIndex];
        const price = selectedOption.getAttribute('data-price');
        priceInput.value = `GHS ${parseFloat(price).toFixed(2)}`;
    });
}

// Initialize cart page if on cart page
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', loadCartItems);
}

// Handle form submission
const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Submit the form using FormSubmit
        const formData = new FormData(orderForm);
        
        // Add cart items to form data
        const cartItemsText = cart.map(item => 
            `${item.name} (Qty: ${item.quantity}) - GHS ${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        formData.append('cart_items', cartItemsText);
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');
        
        // Get the form action URL
        const actionUrl = orderForm.getAttribute('action');
        
        // Send the form data using fetch
        fetch(actionUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Redirect to thank you page
            window.location.href = 'thank-you.html';
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your order. Please try again.');
        });
    });
}