import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import axios from "axios";
import CheckoutPopup from "./CheckoutPopup";

const categoryImages = {
  Laptop:      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80",
  Headphone:   "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
  Mobile:      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80",
  Electronics: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&q=80",
  Toys:        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&q=80",
  Fashion:     "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&q=80",
  default:     "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&q=80",
};

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartImage, setCartImage] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        const validIds = res.data.map(p => p.id);
        const validCart = cart.filter(item => validIds.includes(item.id));
        const withImages = await Promise.all(validCart.map(async item => {
          try {
            const imgRes = await axios.get(
              `http://localhost:8080/api/product/${item.id}/image`,
              { responseType: "blob" }
            );
            const file = new File([imgRes.data], item.imageName || "img", { type: imgRes.data.type });
            setCartImage(file);
            return { ...item, imageUrl: URL.createObjectURL(imgRes.data) };
          } catch {
            /* fallback to category image */
            return {
              ...item,
              imageUrl: categoryImages[item.category] || categoryImages.default,
            };
          }
        }));
        setCartItems(withImages);
      } catch (err) { console.error(err); }
    };
    if (cart.length) fetchImages();
    else setCartItems([]);
  }, [cart]);

  useEffect(() => {
    setTotalPrice(cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0));
  }, [cartItems]);

  const increase = (id) => setCartItems(cartItems.map(item =>
    item.id === id
      ? (item.quantity < item.stockQuantity ? { ...item, quantity: item.quantity + 1 } : item)
      : item
  ));
  const decrease = (id) => setCartItems(cartItems.map(item =>
    item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
  ));
  const remove = (id) => {
    removeFromCart(id);
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const { imageUrl, imageName, imageData, imageType, quantity, ...rest } = item;
        const formData = new FormData();
        formData.append("imageFile", cartImage);
        formData.append("product", new Blob(
          [JSON.stringify({ ...rest, stockQuantity: item.stockQuantity - item.quantity })],
          { type: "application/json" }
        ));
        await axios.put(`http://localhost:8080/api/product/${item.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      clearCart(); setCartItems([]); setShowModal(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="qs-cart-page">
      <div className="qs-cart-container">
        <div className="qs-cart-header">
          <h1 className="qs-cart-title">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <span className="qs-cart-badge">
              {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="qs-cart-empty">
            {/* Real empty cart image */}
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=280&q=80"
              alt="Empty cart"
              className="qs-cart-empty-img"
            />
            <h3>Your cart is empty</h3>
            <p>Start shopping to add items to your cart</p>
            <a href="/" className="qs-btn-primary">Continue Shopping</a>
          </div>
        ) : (
          <div className="qs-cart-layout">
            <div className="qs-cart-items">
              <div className="qs-cart-table-head">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
              </div>

              {cartItems.map(item => (
                <div key={item.id} className="qs-cart-row">
                  <div className="qs-cart-product">
                    <div className="qs-cart-img-wrap">
                      <img
                        src={item.imageUrl || categoryImages[item.category] || categoryImages.default}
                        alt={item.name}
                        className="qs-cart-img"
                      />
                    </div>
                    <div>
                      <p className="qs-cart-brand">{item.brand}</p>
                      <p className="qs-cart-name">{item.name}</p>
                    </div>
                  </div>
                  <span className="qs-cart-unit-price">₹{Number(item.price).toLocaleString("en-IN")}</span>
                  <div className="qs-qty-control">
                    <button className="qs-qty-btn" onClick={() => decrease(item.id)}>−</button>
                    <span className="qs-qty-val">{item.quantity}</span>
                    <button className="qs-qty-btn" onClick={() => increase(item.id)}>+</button>
                  </div>
                  <span className="qs-cart-subtotal">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  <button className="qs-cart-remove" onClick={() => remove(item.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="qs-cart-summary">
              <h3 className="qs-summary-title">Order Summary</h3>
              <div className="qs-summary-row"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              <div className="qs-summary-row"><span>Shipping</span><span className="qs-free">Free</span></div>
              <div className="qs-summary-row"><span>Tax (18% GST)</span><span>₹{(totalPrice * 0.18).toFixed(2)}</span></div>
              <div className="qs-summary-divider"></div>
              <div className="qs-summary-total">
                <span>Total</span>
                <span>₹{(totalPrice * 1.18).toFixed(2)}</span>
              </div>
              <button className="qs-checkout-btn" onClick={() => setShowModal(true)}>
                Proceed to Checkout →
              </button>
              <a href="/" className="qs-continue-link">← Continue Shopping</a>
            </div>
          </div>
        )}
      </div>

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;