import React, { useState, useContext } from "react";
import axios from "axios";
import AppContext from "../Context/Context";

const Navbar = ({ onSelectCategory }) => {
  const { cart, wishlist } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const cartCount    = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/products/search?keyword=${value}`);
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch { }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const categories = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

  return (
    <header className="qs-header">
      <div className="qs-header-inner">

        {/* Logo */}
        <a href="/" className="qs-logo">
          <span className="qs-logo-quick">Quick</span>
          <span className="qs-logo-badge">Store</span>
        </a>

        {/* Nav */}
        <nav className="qs-nav">
          <a href="/" className="qs-nav-link" onClick={() => onSelectCategory("")}>Home</a>
          <div className="qs-nav-dropdown">
            <span className="qs-nav-link">Our Store ▾</span>
            <div className="qs-dropdown-menu">
              <button className="qs-dropdown-item" onClick={() => onSelectCategory("")}>All Products</button>
              {categories.map(cat => (
                <button key={cat} className="qs-dropdown-item" onClick={() => onSelectCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <a href="/add_product" className="qs-nav-link">Add Product</a>
        </nav>

        {/* Right: Search + My Account + Wishlist + Cart */}
        <div className="qs-header-right">

          {/* Search */}
          <div className="qs-search-wrap">
            <div className="qs-search-box">
              <input
                type="text"
                placeholder="Search products..."
                className="qs-search-input"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                onFocus={() => input.length >= 1 && setShowSearchResults(true)}
              />
              <button className="qs-search-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>
            {showSearchResults && (
              <div className="qs-search-dropdown">
                {searchResults.length > 0
                  ? searchResults.map(result => (
                      <a key={result.id} href={`/product/${result.id}`} className="qs-search-result">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        {result.name}
                      </a>
                    ))
                  : noResults
                    ? <div className="qs-no-results">No products found</div>
                    : null}
              </div>
            )}
          </div>

          {/* My Account */}
          <a href="#" className="qs-header-action">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Account</span>
          </a>

          {/* Wishlist */}
          <a href="/wishlist" className="qs-header-action qs-wishlist-action">
            <div className="qs-cart-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && <span className="qs-cart-count qs-wish-count">{wishlistCount}</span>}
            </div>
            <span>Wishlist</span>
          </a>

          {/* Cart */}
          <a href="/cart" className="qs-header-action qs-cart-action">
            <div className="qs-cart-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && <span className="qs-cart-count">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </a>

        </div>
      </div>
    </header>
  );
};

export default Navbar;