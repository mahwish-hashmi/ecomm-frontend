import axios from "../axios";
import { useState, useEffect, createContext } from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  wishlist: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  addToWishlist: (product) => {},
  removeFromWishlist: (productId) => {},
  isInWishlist: (productId) => false,
  refreshData: () => {},
  clearCart: () => {},
});

export const AppProvider = ({ children }) => {
  const [data, setData]       = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart]       = useState(JSON.parse(localStorage.getItem("cart"))     || []);
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem("wishlist")) || []);

  /* ── Cart ── */
  const addToCart = (product) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    const updatedCart = existingIndex !== -1
      ? cart.map((item, i) => i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  /* ── Wishlist ── */
  const addToWishlist = (product) => {
    if (wishlist.find((item) => item.id === product.id)) return; // already in
    const updated = [...wishlist, product];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const isInWishlist = (productId) => wishlist.some((item) => item.id === productId);

  /* toggle: add if not in, remove if already in */
  const toggleWishlist = (product) => {
    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  /* ── Data ── */
  const refreshData = async () => {
    try {
      const response = await axios.get("/products");
      setData(response.data);
    } catch (error) {
      setIsError(error.message);
    }
  };

  useEffect(() => { refreshData(); }, []);
  useEffect(() => { localStorage.setItem("cart",     JSON.stringify(cart));     }, [cart]);
  useEffect(() => { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  return (
    <AppContext.Provider value={{
      data, isError, cart, wishlist,
      addToCart, removeFromCart, clearCart,
      addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;