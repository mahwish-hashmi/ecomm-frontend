import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

/* ── Fixed discount per product ID — never changes on re-render ── */
const getDiscount = (id) => {
  const discounts = [10, 12, 15, 18, 20, 22, 25, 28, 30];
  return discounts[id % discounts.length];
};

/* ── All project categories — case-insensitive lookup ── */
const categoryImages = {
  laptop:      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80",
  headphone:   "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
  mobile:      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80",
  electronics: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&q=80",
  toys:        "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&q=80",
  fashion:     "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&q=80",
  cars:        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=80",
  smarttv:     "https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=200&q=80",
  speaker:     "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80",
  tablets:     "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80",
  airpods:     "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&q=80",
  smartwatches:"https://images.unsplash.com/photo-1523475496153-3e8b0a73d8f9?w=200&q=80",
  default:     "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80",
};

/* Case-insensitive image lookup */
const getCategoryImage = (cat) =>
  categoryImages[cat?.toLowerCase()] || categoryImages.default;

/* Only the 6 categories used in this project */
const FIXED_CATEGORIES = [
  { name: "Laptop",      img: categoryImages.laptop },
  { name: "Headphone",   img: categoryImages.headphone },
  { name: "Mobile",      img: categoryImages.mobile },
  { name: "Electronics", img: categoryImages.electronics },
  { name: "Toys",        img: categoryImages.toys },
  { name: "Fashion",     img: categoryImages.fashion },
];

/* ── 4 elegant editorial banner slides ── */
const heroSlides = [
  {
    tag: "NEW COLLECTION",
    store: "QuickStore.",
    title: "Everything You\nLove, Delivered.",
    sub: "Laptops · Mobiles · Fashion · Electronics & More",
    btn: "Shop Now",
    bg: "#f5f0e8",
    textColor: "#2c1a0e",
    accentColor: "#c17f3e",
    btnBg: "#2c1a0e",
    btnColor: "#fff",
    leftImg:  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=340&q=85",
    rightImg: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=340&q=85",
  },
  {
    tag: "BEAUTY & LIFESTYLE",
    store: "QuickStore",
    title: "Studio\nCollection.",
    sub: "Curated products for the modern lifestyle",
    btn: "Explore Now",
    bg: "#f0efee",
    textColor: "#1a1a1a",
    accentColor: "#888",
    btnBg: "#1a1a1a",
    btnColor: "#fff",
    leftImg:  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=340&q=85",
    rightImg: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=340&q=85",
  },
  {
    tag: "UP TO 55% OFF",
    store: "Fashion Sale!",
    title: "Our Special\nDiscount.",
    sub: "Hand-picked deals just for you — limited time only",
    btn: "Shop Now",
    bg: "#f2e4dc",
    textColor: "#3b1f14",
    accentColor: "#b5541a",
    btnBg: "#3b1f14",
    btnColor: "#fff",
    leftImg:  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=340&q=85",
    rightImg: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=340&q=85",
  },
  {
    tag: "TRENDING NOW",
    store: "QuickStore",
    title: "Premium Picks\nFor You.",
    sub: "Discover the finest electronics and fashion",
    btn: "View All",
    bg: "#eee9e2",
    textColor: "#1c1c1c",
    accentColor: "#9b7b50",
    btnBg: "#9b7b50",
    btnColor: "#fff",
    leftImg:  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=340&q=85",
    rightImg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=340&q=85",
  },
];

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [activeTab, setActiveTab] = useState("New Products");
  const [slide, setSlide] = useState(0);
  const [toast, setToast] = useState(null); // { name: string }

  const showToast = (name) => {
    setToast(name);
    setTimeout(() => setToast(null), 2500);
  };

  /* auto-advance slider */
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isDataFetched) { refreshData(); setIsDataFetched(true); }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    if (data && data.length > 0) {
      const fetchImages = async () => {
        const updated = await Promise.all(data.map(async (product) => {
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
        setProducts(updated);
      };
      fetchImages();
    }
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  /* All unique categories from actual products */
  const categories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const hero = heroSlides[slide];

  if (isError) return (
    <div className="qs-error">
      <img src={unplugged} alt="Error" style={{ width: 80, opacity: 0.5 }} />
      <h3>Can't connect to server</h3>
      <p>Make sure the backend is running on port 8080</p>
    </div>
  );

  return (
    <div className="qs-page">

      {/* ══ TOAST NOTIFICATION ══ */}
      {toast && (
        <div className="qs-toast">
          <span className="qs-toast-icon">✓</span>
          <span><strong>{toast}</strong> added to cart!</span>
        </div>
      )}
      <section className="qs-banner-editorial" style={{ background: hero.bg }}>
        {/* Left image */}
        <div className="qs-banner-left-img">
          <img key={`left-${slide}`} src={hero.leftImg} alt="" className="qs-banner-side-img" />
        </div>

        {/* Center content */}
        <div className="qs-banner-center">
          <span className="qs-banner-tag" style={{ color: hero.accentColor }}>{hero.tag}</span>
          <div className="qs-banner-divider-line" style={{ background: hero.accentColor }} />
          <h2 className="qs-banner-store" style={{ color: hero.textColor }}>{hero.store}</h2>
          <h1 className="qs-banner-title-editorial" style={{ color: hero.textColor }}>
            {hero.title.split("\n").map((line, i) => <span key={i}>{line}{i < hero.title.split("\n").length - 1 && <br />}</span>)}
          </h1>
          <p className="qs-banner-sub-editorial" style={{ color: hero.accentColor }}>{hero.sub}</p>
          <button className="qs-banner-shop-btn"
            style={{ background: hero.btnBg, color: hero.btnColor }}
            onClick={() => refreshData()}>
            {hero.btn}
          </button>
        </div>

        {/* Right image */}
        <div className="qs-banner-right-img">
          <img key={`right-${slide}`} src={hero.rightImg} alt="" className="qs-banner-side-img" />
        </div>

        {/* Dots */}
        <div className="qs-banner-dots-editorial">
          {heroSlides.map((_, i) => (
            <button key={i}
              className={`qs-banner-dot ${i === slide ? "qs-banner-dot-active" : ""}`}
              onClick={() => setSlide(i)}
              style={i === slide ? { background: hero.accentColor, width: 22 } : {}} />
          ))}
        </div>
      </section>


      {/* ══ TOP CATEGORIES ══ */}
      <section className="qs-section">
        <h2 className="qs-section-title">Our Top Categories</h2>
        <div className="qs-categories-grid">
          {/* All card */}
          <div className="qs-cat-card">
            <div className="qs-cat-img-wrap">
              <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80" alt="All" className="qs-cat-img" />
            </div>
            <span className="qs-cat-name">All</span>
            <span className="qs-cat-count">{products.length} items</span>
          </div>
          {/* Always show all reference categories with their images */}
          {FIXED_CATEGORIES.map(({ name, img }) => {
            const count = products.filter(p => p.category?.toLowerCase() === name.toLowerCase()).length;
            return (
              <div key={name} className="qs-cat-card">
                <div className="qs-cat-img-wrap">
                  <img src={img} alt={name} className="qs-cat-img" />
                </div>
                <span className="qs-cat-name">{name}</span>
                <span className="qs-cat-count">{count} items</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ TRENDING PRODUCTS ══ */}
      <section className="qs-section">
        {/* Header row: title + tabs TOGETHER on left, not spread across full width */}
        <div className="qs-trending-header">
          <h2 className="qs-section-title-inline">
            {selectedCategory || "Our Trending Products"}
          </h2>
          <div className="qs-tabs">
            {["New Products", "Best Selling", "Featured Products"].map(tab => (
              <button key={tab}
                className={`qs-tab ${activeTab === tab ? "qs-tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="qs-empty">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80"
              alt="Empty" className="qs-empty-img" />
            <h3>No Products Available</h3>
            <p>Check back soon for new arrivals</p>
          </div>
        ) : (
          <div className="qs-products-grid">
            {filteredProducts.map(product => {
              const { id, brand, name, price, productAvailable, imageUrl, category } = product;
              const displayImg = imageUrl || getCategoryImage(category);
              /* Fixed discount — based on product id, never random on render */
              const discount = getDiscount(id);
              /* Fixed old price — deterministic, not Math.random */
              const oldPrice = Math.round(Number(price) / (1 - discount / 100));

              return (
                <div key={id} className={`qs-product-card ${!productAvailable ? "qs-product-unavailable" : ""}`}>
                  {!productAvailable
                    ? <span className="qs-sold-out">Out of Stock</span>
                    : <span className="qs-discount-badge">-{discount}%</span>
                  }
                  <Link to={`/product/${id}`} className="qs-product-link">
                    <div className="qs-product-img-wrap">
                      <img src={displayImg} alt={name} className="qs-product-img" />
                      <div className="qs-product-actions">
                        <button className="qs-action-btn"
                          onClick={(e) => { e.preventDefault(); addToCart(product); showToast(name); }}
                          disabled={!productAvailable} title="Add to Cart">🛒</button>
                        <button className="qs-action-btn" title="Wishlist">♡</button>
                        <button className="qs-action-btn" title="Compare">⇄</button>
                      </div>
                    </div>
                    <div className="qs-product-info">
                      <span className="qs-product-cat">{category || brand}</span>
                      <h3 className="qs-product-name">{name}</h3>
                      <div className="qs-product-stars">★★★★☆</div>
                      <div className="qs-product-price-row">
                        {/* price is stored as raw number from backend — display as-is */}
                        <span className="qs-product-price">₹{Number(price).toLocaleString("en-IN")}</span>
                        <span className="qs-product-old-price">₹{oldPrice.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    className={`qs-add-cart-btn ${!productAvailable ? "qs-add-cart-disabled" : ""}`}
                    onClick={() => { addToCart(product); showToast(name); }}
                    disabled={!productAvailable}>
                    {productAvailable ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;