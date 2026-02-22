import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";

const categoryImages = {
  laptop:      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80",
  headphone:   "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
  mobile:      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
  electronics: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&q=80",
  toys:        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&q=80",
  fashion:     "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&q=80",
  default:     "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80",
};

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useContext(AppContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  useEffect(() => {
    const fetchImages = async () => {
      const updated = await Promise.all(wishlist.map(async (product) => {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/product/${product.id}/image`,
            { responseType: "blob" }
          );
          return { ...product, imageUrl: URL.createObjectURL(res.data) };
        } catch {
          return { ...product, imageUrl: null };
        }
      }));
      setWishlistItems(updated);
    };
    if (wishlist.length > 0) fetchImages();
    else setWishlistItems([]);
  }, [wishlist]);

  return (
    <div className="qs-wishlist-page">
      {toast && (
        <div className="qs-toast">
          <span className="qs-toast-icon">✓</span>
          <span>{toast}</span>
        </div>
      )}

      <div className="qs-wishlist-container">
        <div className="qs-wishlist-header">
          <h1 className="qs-cart-title">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <span className="qs-cart-badge">{wishlistItems.length} item{wishlistItems.length > 1 ? "s" : ""}</span>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="qs-cart-empty">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=280&q=80"
              alt="Empty wishlist"
              className="qs-cart-empty-img"
            />
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to find them easily later</p>
            <a href="/" className="qs-btn-primary">Start Shopping</a>
          </div>
        ) : (
          <div className="qs-wishlist-grid">
            {wishlistItems.map(item => {
              const displayImg = item.imageUrl
                || categoryImages[item.category?.toLowerCase()]
                || categoryImages.default;
              return (
                <div key={item.id} className="qs-wishlist-card">
                  {/* Remove from wishlist */}
                  <button
                    className="qs-wishlist-remove"
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from wishlist"
                  >✕</button>

                  <Link to={`/product/${item.id}`} className="qs-product-link">
                    <div className="qs-wishlist-img-wrap">
                      <img src={displayImg} alt={item.name} className="qs-wishlist-img" />
                    </div>
                    <div className="qs-wishlist-info">
                      <span className="qs-product-cat">{item.category || item.brand}</span>
                      <h3 className="qs-wishlist-name">{item.name}</h3>
                      <div className="qs-product-stars">★★★★☆</div>
                      <p className="qs-wishlist-price">₹{Number(item.price).toLocaleString("en-IN")}</p>
                    </div>
                  </Link>

                  <button
                    className={`qs-add-cart-btn ${!item.productAvailable ? "qs-add-cart-disabled" : ""}`}
                    disabled={!item.productAvailable}
                    onClick={() => {
                      addToCart(item);
                      showToast(`${item.name} added to cart!`);
                    }}
                  >
                    {item.productAvailable ? "Move to Cart" : "Out of Stock"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;