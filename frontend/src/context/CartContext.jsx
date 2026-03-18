import { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart(null);
            setCartCount(0);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data);
            setCartCount(res.data.item_count || 0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <CartContext.Provider value={{ cart, cartCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);