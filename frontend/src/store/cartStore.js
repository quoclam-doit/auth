import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

export const useCartStore = create(
    persist(
        (set, get) => ({
            // State
            items: [], // [{productId, productName, price, quantity, image, maxInventory}]
            isLoading: false,
            error: null,

            // Add item to cart
            addToCart: async (product, quantity = 1) => {
                set({ isLoading: true, error: null });

                try {
                    // Check inventory trước khi thêm vào cart
                    const response = await fetch(`${API_URL}/inventory/check`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            productId: product._id,
                            quantity: quantity
                        })
                    });

                    const inventoryCheck = await response.json();

                    if (!inventoryCheck.available) {
                        throw new Error(inventoryCheck.message);
                    }

                    const currentItems = get().items;
                    const existingItemIndex = currentItems.findIndex(item => item.productId === product._id);

                    if (existingItemIndex >= 0) {
                        // Update existing item
                        const existingItem = currentItems[existingItemIndex];
                        const newQuantity = existingItem.quantity + quantity;

                        // Check if new quantity exceeds inventory
                        if (newQuantity > product.inventory) {
                            throw new Error(`Không thể thêm. Chỉ còn ${product.inventory} sản phẩm trong kho`);
                        }

                        const updatedItems = [...currentItems];
                        updatedItems[existingItemIndex] = {
                            ...existingItem,
                            quantity: newQuantity
                        };

                        set({ items: updatedItems, isLoading: false });
                    } else {
                        // Add new item
                        const newItem = {
                            productId: product._id,
                            productName: product.productName,
                            price: product.price,
                            quantity: quantity,
                            image: product.image,
                            maxInventory: product.inventory,
                            status: product.status
                        };

                        set({
                            items: [...currentItems, newItem],
                            isLoading: false
                        });
                    }

                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Update item quantity
            updateQuantity: async (productId, newQuantity) => {
                if (newQuantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    // Check inventory
                    const response = await fetch(`${API_URL}/inventory/check`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            productId: productId,
                            quantity: newQuantity
                        })
                    });

                    const inventoryCheck = await response.json();

                    if (!inventoryCheck.available) {
                        throw new Error(inventoryCheck.message);
                    }

                    const updatedItems = get().items.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: newQuantity }
                            : item
                    );

                    set({ items: updatedItems, isLoading: false });

                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Remove item from cart
            removeFromCart: (productId) => {
                const updatedItems = get().items.filter(item => item.productId !== productId);
                set({ items: updatedItems });
            },

            // Clear cart
            clearCart: () => {
                set({ items: [] });
            },

            // Get cart totals
            getCartTotal: () => {
                const items = get().items;
                return items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            // Get total items count
            getTotalItems: () => {
                const items = get().items;
                return items.reduce((total, item) => total + item.quantity, 0);
            },

            // Process checkout (reduce inventory)
            processCheckout: async () => {
                set({ isLoading: true, error: null });

                try {
                    const items = get().items;

                    if (items.length === 0) {
                        throw new Error('Cart is empty');
                    }

                    // Prepare order items
                    const orderItems = items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }));

                    const response = await fetch(`${API_URL}/inventory/process-order`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ items: orderItems })
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || 'Failed to process order');
                    }

                    // Clear cart after successful checkout
                    set({ items: [], isLoading: false });

                    return result;

                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            }
        }),
        {
            name: 'cart-storage', // Storage key
            partialize: (state) => ({ items: state.items }), // Only persist items
        }
    )
);