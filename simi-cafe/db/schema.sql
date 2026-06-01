CREATE DATABASE simi_cafe;
USE simi_cafe;

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',

    referral_code VARCHAR(20) UNIQUE,
    referred_by INT NULL,

    total_visits INT DEFAULT 0,
    successful_payments INT DEFAULT 0,

    charm_count INT DEFAULT 0,
    charms_redeemed INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (referred_by) REFERENCES users(id)
);

-- =====================================================
-- OTP VERIFICATIONS
-- =====================================================
CREATE TABLE otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    otp_code VARCHAR(6) NOT NULL,
    type ENUM('email','phone') NOT NULL,

    expires_at DATETIME NOT NULL,
    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- VISITS
-- =====================================================
CREATE TABLE visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_by_staff BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- CHARMS
-- =====================================================
CREATE TABLE charms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,

    charm_type ENUM(
        'Totoro Charm',
        'Calcifer Charm',
        'Kodama Charm',
        'Susuwatari Charm'
    ) NOT NULL,

    earned_after_payment_count INT NOT NULL,

    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at DATETIME NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- MENU CATEGORIES
-- =====================================================
CREATE TABLE menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO menu_categories (name) VALUES
('Hot Drinks'),
('Cold Drinks'),
('Food'),
('Desserts'),
('Specials');

-- =====================================================
-- MENU ITEMS
-- =====================================================
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,
    description TEXT,

    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,

    is_veg BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    is_seasonal BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- =====================================================
-- RESERVATIONS
-- =====================================================
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,

    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,

    guests INT NOT NULL,

    status ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    total_amount DECIMAL(10,2),

    status ENUM(
        'pending',
        'paid',
        'preparing',
        'ready',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',

    payment_mode ENUM('cash') DEFAULT 'cash',

    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_confirmed_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- ORDER ITEMS
-- =====================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- =====================================================
-- ADMINS
-- =====================================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,

    role ENUM(
        'staff',
        'manager',
        'owner'
    ) DEFAULT 'staff',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADMIN AUTH TOKENS
-- =====================================================
CREATE TABLE admin_auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    type ENUM('password_reset', 'email_verification') NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- =====================================================
-- LOGIN ATTEMPTS
-- =====================================================
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempts INT DEFAULT 1,
    last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
    blocked_until DATETIME NULL
);

-- =====================================================
-- SAMPLE ADMIN
-- =====================================================
INSERT INTO admins (
    name,
    email,
    password_hash,
    is_verified,
    role
)
VALUES (
    'Admin',
    'admin@simicafe.com',
    'hashed_password_here',
    TRUE,
    'owner'
);

-- =====================================================
-- SAMPLE MENU ITEMS
-- =====================================================
INSERT INTO menu_items
(category_id, name, description, price, is_veg, is_available)
VALUES
(1, 'Totoro Matcha Latte', 'Ceremonial matcha with oat milk', 220.00, TRUE, TRUE),

(1, 'Calcifer Hot Chocolate', 'Dark chocolate with cinnamon heat', 250.00, TRUE, TRUE),

(2, 'Sky Spirit Lemonade', 'Sparkling blue citrus cooler', 180.00, TRUE, TRUE),

(3, 'Howl''s Fire Sandwich', 'Spicy grilled cottage cheese sandwich', 280.00, TRUE, TRUE),

(4, 'Kodama Cheesecake', 'Soft vanilla cheesecake', 240.00, TRUE, TRUE);
