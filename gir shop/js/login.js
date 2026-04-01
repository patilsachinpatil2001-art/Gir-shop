// Login page JavaScript with intentional vulnerabilities

let currentSignupData = null;
let generatedOTP = null;

// Switch between login and signup tabs
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

// VULNERABILITY: No rate limiting on login attempts
let loginAttempts = 0;
async function handleLogin(event) {
    event.preventDefault();
    
    loginAttempts++;
    console.log(`Login attempt #${loginAttempts} - NO RATE LIMITING!`);
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // Fetch all users (VULNERABILITY: Exposing all user data)
        const response = await fetch('tables/users?limit=100');
        const result = await response.json();
        const users = result.data || [];
        
        // VULNERABILITY: Client-side authentication
        // Password stored in plaintext in database
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Save user session (VULNERABILITY: No secure token, just localStorage)
            saveUserSession({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            });
            
            showAlert('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showAlert('Invalid email or password. Try again!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('An error occurred. Please try again.', 'error');
    }
}

// VULNERABILITY: No rate limiting on signup/OTP requests
let signupAttempts = 0;
async function handleSignup(event) {
    event.preventDefault();
    
    signupAttempts++;
    console.log(`Signup attempt #${signupAttempts} - NO RATE LIMITING!`);
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const address = document.getElementById('signupAddress').value;
    
    // Check if user already exists
    try {
        const response = await fetch(`tables/users?search=${email}&limit=10`);
        const result = await response.json();
        const existingUser = result.data.find(u => u.email === email);
        
        if (existingUser) {
            showAlert('Email already registered. Please login.', 'error');
            return;
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
    
    // Store signup data temporarily
    currentSignupData = {
        name,
        email,
        phone,
        password, // VULNERABILITY: Password stored in plaintext
        address
    };
    
    // Generate and send OTP (VULNERABILITY: OTP generation is predictable)
    sendOTP(phone);
}

// VULNERABILITY: OTP generation and display
function sendOTP(phone) {
    // Generate 6-digit OTP (VULNERABILITY: Predictable, weak generation)
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // VULNERABILITY: Display OTP on screen (OTP leak)
    document.getElementById('otpPhone').textContent = phone;
    document.getElementById('displayedOTP').textContent = generatedOTP;
    
    // Show OTP section
    document.getElementById('otpSection').classList.add('active');
    
    console.log(`OTP Generated: ${generatedOTP} - DISPLAYED ON SCREEN!`);
    showAlert('OTP sent! (Check the screen, it\'s displayed!)', 'info');
}

// VULNERABILITY: No rate limiting on OTP resend
let resendCount = 0;
function resendOTP() {
    resendCount++;
    console.log(`OTP Resend #${resendCount} - NO RATE LIMITING!`);
    
    if (currentSignupData) {
        sendOTP(currentSignupData.phone);
        showAlert('OTP resent successfully!', 'success');
    }
}

// VULNERABILITY: Client-side OTP verification with bypass
async function verifyOTP() {
    const enteredOTP = document.getElementById('otpInput').value;
    
    // VULNERABILITY: OTP bypass - "123456" always works
    if (enteredOTP === '123456') {
        console.log('OTP BYPASSED with magic code 123456!');
        showAlert('OTP bypassed! (You used the magic code)', 'success');
        await completeSignup();
        return;
    }
    
    // VULNERABILITY: Client-side OTP validation only
    if (enteredOTP === generatedOTP) {
        showAlert('OTP verified successfully!', 'success');
        await completeSignup();
    } else {
        showAlert('Invalid OTP. Try again or use "123456" to bypass!', 'error');
    }
}

// Complete signup process
async function completeSignup() {
    if (!currentSignupData) {
        showAlert('Signup data not found. Please try again.', 'error');
        return;
    }
    
    try {
        // Create new user (VULNERABILITY: Password stored in plaintext)
        const response = await fetch('tables/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: currentSignupData.name,
                email: currentSignupData.email,
                phone: currentSignupData.phone,
                password: currentSignupData.password, // PLAINTEXT PASSWORD
                address: currentSignupData.address,
                lastOTP: generatedOTP // VULNERABILITY: Storing OTP in database
            })
        });
        
        const newUser = await response.json();
        
        // Auto-login after signup
        saveUserSession({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address
        });
        
        showAlert('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        showAlert('An error occurred during signup. Please try again.', 'error');
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user) {
        if (confirm('You are already logged in. Go to home page?')) {
            window.location.href = 'index.html';
        }
    }
});