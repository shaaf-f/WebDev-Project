-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 02, 2025 at 11:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ufos_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `vendor_id` varchar(50) DEFAULT NULL,
  `vendor_name` varchar(100) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `pickup_time` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `customer_name`, `vendor_id`, `vendor_name`, `total`, `status`, `pickup_time`, `created_at`) VALUES
(1, 1, NULL, 'v_cafe2go', 'Cafe-2-Go', 500, 'pending', '11:30', '2025-12-02 15:09:18'),
(2, 1, NULL, 'v_tapal', 'Tapal Cafeteria', 1030, 'completed', '15:15', '2025-12-02 15:12:20'),
(3, 1, NULL, 'v_cafe2go', 'Cafe-2-Go', 400, 'pending', '11:00', '2025-12-02 18:02:23'),
(4, 1, NULL, 'v_tapal', 'Tapal Cafeteria', 850, 'pending', '11:45', '2025-12-02 18:27:15'),
(5, 1, 'Ali Student', 'v_sync', 'Sync', 500, 'completed', '01:00 (Testing)', '2025-12-02 21:58:00'),
(6, 8, 'Shaaf Farooque', 'v_sync', 'Sync', 1050, 'completed', '01:00 (Testing)', '2025-12-02 22:03:39');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `product_name`, `quantity`, `price`) VALUES
(1, 5, 's2', 'Caramel Latte', 1, 500.00),
(2, 6, 'sync3', 'New York Cheesecake Frappe', 1, 550.00),
(3, 6, 's2', 'Caramel Latte', 1, 500.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` varchar(10) NOT NULL,
  `vendor_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `vendor_id`, `name`, `price`, `category`, `enabled`, `created_at`) VALUES
('c1', 'v_cafe2go', 'Chicken Nuggets & Fries', 400.00, 'Continental', 1, '2025-12-02 21:44:31'),
('c2', 'v_cafe2go', 'Club Sandwich', 500.00, 'Sandwiches', 1, '2025-12-02 21:44:31'),
('c3', 'v_cafe2go', 'Brownie', 250.00, 'Dessert', 1, '2025-12-02 21:44:31'),
('c4', 'v_cafe2go', 'Cola Next', 100.00, 'Drinks', 1, '2025-12-02 21:44:31'),
('g1', 'v_grito', 'Vanilla Shake', 400.00, 'Drinks', 1, '2025-12-02 21:44:31'),
('g2', 'v_grito', 'Hot Shots', 350.00, 'Food', 1, '2025-12-02 21:44:31'),
('r1', 'v_rahim', 'Large Masala Fries', 130.00, 'Fries', 1, '2025-12-02 21:44:31'),
('r2', 'v_rahim', 'Medium Ketchup Fries', 70.00, 'Fries', 1, '2025-12-02 21:44:31'),
('s1', 'v_sync', 'Latte', 550.00, 'Iced Coffee', 1, '2025-12-02 21:44:31'),
('s2', 'v_sync', 'Caramel Latte', 500.00, 'Hot Coffee', 1, '2025-12-02 21:44:31'),
('sk1', 'v_sky', 'Chai', 120.00, 'Tea', 1, '2025-12-02 21:44:31'),
('sk2', 'v_sky', 'Aloo Paratha', 300.00, 'Breakfast', 1, '2025-12-02 21:44:31'),
('sync3', 'v_sync', 'New York Cheesecake Frappe', 550.00, 'Frappe', 1, '2025-12-02 21:55:37'),
('t1', 'v_tapal', 'Mutton Biryani', 350.00, 'Main', 1, '2025-12-02 21:44:31'),
('t2', 'v_tapal', 'Chicken Karahi', 250.00, 'Main', 1, '2025-12-02 21:44:31'),
('t3', 'v_tapal', 'Naan', 30.00, 'Bread', 1, '2025-12-02 21:44:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `name`) VALUES
(1, 'student@hu.edu.pk', '123', 'student', 'Ali Student'),
(2, 'vendor@hu.edu.pk', '123', 'vendor', 'Tapal Manager'),
(3, 'cafe2go@hu.edu.pk', '123', 'vendor', 'Cafe-2-Go Manager'),
(4, 'sync@hu.edu.pk', '123', 'vendor', 'Sync Manager'),
(5, 'grito@hu.edu.pk', '123', 'vendor', 'Grito Manager'),
(6, 'sky@hu.edu.pk', '123', 'vendor', 'Sky Dhaaba Manager'),
(7, 'rahim@hu.edu.pk', '123', 'vendor', 'Rahim Bhai Manager'),
(8, 'sf@hu.edu.pk', '123', 'student', 'Shaaf Farooque');

-- --------------------------------------------------------

--
-- Table structure for table `user_carts`
--

CREATE TABLE `user_carts` (
  `cart_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_carts`
--

INSERT INTO `user_carts` (`cart_id`, `user_id`, `created_at`) VALUES
(1, 1, '2025-12-02 19:39:41'),
(2, 8, '2025-12-02 22:03:26');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_carts`
--
ALTER TABLE `user_carts`
  ADD PRIMARY KEY (`cart_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_carts`
--
ALTER TABLE `user_carts`
  MODIFY `cart_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `user_carts` (`cart_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_carts`
--
ALTER TABLE `user_carts`
  ADD CONSTRAINT `user_carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
