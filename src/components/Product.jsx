import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";

const categoryIcons = {
  Laptop: "💻", Headphone: "🎧", Mobile: "📱",
  Electronics: "⚡", Toys: "🧸", Fashion: "👗", default: "🛍️"
};

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/product/${id}`);
        setProduct(res.data);
        if (res.data.imageName) {
          const imgRes = await axios.get(`http://localhost:8080/api/product/${id}/image`, { responseType: "blob" });
          setImageUrl(URL.createObjectURL(imgRes.data));
        }
      } catch (err) { console.error(err); }
    };
    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`http://localhost:8080/api/product/${id}`);
    removeFromCart(id); refreshData(); navigate("/");
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (!product) return (
    <div className="qs-loading">
      <div className="qs-spinner"></div>
      <p>Loading product...</p>
    </div>
  );

  return (
    <div className="qs-detail-page">
      <div className="qs-breadcrumb">
        <a href="/">Home</a> <span>/</span>
        <span>{product.category}</span> <span>/</span>
        <span className="qs-breadcrumb-active">{product.name}</span>
      </div>

      <div className="qs-detail-grid">
        <div className="qs-detail-img-col">
          <div className="qs-detail-img-box">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="qs-detail-img" />
            ) : (
              <div className="qs-detail-img-placeholder">
                <span style={{ fontSize: 100 }}>
                  {categoryIcons[product.category] || categoryIcons.default}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="qs-detail-info">
          <span className="qs-detail-cat">{product.category}</span>
          <h1 className="qs-detail-name">{product.name}</h1>
          <p className="qs-detail-brand">Brand: <strong>{product.brand}</strong></p>
          <div className="qs-detail-stars">★★★★☆ <span>(24 reviews)</span></div>

          <div className="qs-detail-price-row">
            <span className="qs-detail-price">₹{product.price}</span>
            <span className="qs-detail-old-price">₹{Math.round(Number(product.price) * 1.2)}</span>
            <span className="qs-detail-off">20% OFF</span>
          </div>

          <div className={`qs-detail-stock ${product.productAvailable ? "in-stock" : "out-stock"}`}>
            {product.productAvailable
              ? `✓ In Stock — ${product.stockQuantity} units available`
              : "✗ Out of Stock"}
          </div>

          <div className="qs-detail-desc">
            <h4>Description</h4>
            <p>{product.description}</p>
          </div>

          <div className="qs-detail-meta">
            <span>Listed: {new Date(product.releaseDate).toLocaleDateString()}</span>
          </div>

          <div className="qs-detail-actions">
            <button
              className={`qs-detail-cart-btn ${!product.productAvailable ? "disabled" : ""} ${addedToCart ? "added" : ""}`}
              onClick={handleAddToCart}
              disabled={!product.productAvailable}>
              {addedToCart ? "✓ Added to Cart!" : product.productAvailable ? "🛒 Add to Cart" : "Out of Stock"}
            </button>
            <button className="qs-detail-wish-btn">♡ Wishlist</button>
          </div>

          <div className="qs-detail-admin">
            <button className="qs-edit-btn" onClick={() => navigate(`/product/update/${id}`)}>✏️ Edit</button>
            <button className="qs-delete-btn" onClick={deleteProduct}>🗑️ Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;