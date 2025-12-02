import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Assuming you have a way to get the current user's ID
    const userId = 1; // Replace with actual user ID from authentication

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get(`/api/cart/${userId}`);
                setCartItems(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch cart items.');
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [userId]);

    const handleRemoveFromCart = async (productId) => {
        try {
            await axios.delete(`/api/cart/${userId}/${productId}`);
            setCartItems(cartItems.filter(item => item.product_id !== productId));
        } catch (err) {
            setError('Failed to remove item from cart.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="cart-container">
            <h2>Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cartItems.map(item => (
                        <li key={item.product_id} className="cart-item">
                            <span>{item.name} - ${item.price} x {item.quantity}</span>
                            <button onClick={() => handleRemoveFromCart(item.product_id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Cart;
