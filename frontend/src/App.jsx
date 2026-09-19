import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/products`
  : (import.meta.env.PROD ? "/api/products" : "http://localhost:5001/api/products");

// =========================================================
// NATIVE WEB AUDIO API SYNTHESIZER (0 Assets, 0kb, Zero Latency)
// =========================================================
let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playSfx = (type, isEnabled = true) => {
  if (!isEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "click") {
      // Tactile micro-click for pills and buttons
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "cart") {
      // Futuristic upward dual-oscillator sweep ("Drop into bag")
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(360, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.16);

      osc2.frequency.setValueAtTime(540, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.04);
      osc1.stop(now + 0.18);
      osc2.stop(now + 0.24);
    } else if (type === "heart") {
      // Warm melodious pulse for wishlist
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "vault") {
      // Cyber security hum & laser sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "success") {
      // Order placed triumphant harmonic chord progression
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.32);
      });
    }
  } catch {
    // Graceful fallback for strict browser audio policies
  }
};

// =========================================================
// MULTI-ANGLE SNEAKER PERSPECTIVES GALLERY HELPER
// Generates 4 distinct, high-res inspection angles for each sneaker
// =========================================================
const getProductGallery = (product) => {
  if (!product) return [];

  // If custom images array exists on product
  if (Array.isArray(product.images) && product.images.length > 1) {
    return product.images.map((url, i) => ({
      url,
      label: `PERSPECTIVE 0${i + 1}`,
      tag: `Angle 0${i + 1}`,
    }));
  }

  const brand = (product.brand || "").toLowerCase();
  const mainImg = product.imageUrl || "";

  // Curated high-res perspective angle sets by brand/silhouette
  const anglePresets = {
    nike: [
      { url: mainImg, label: "LATERAL PROFILE", tag: "Main Studio View" },
      { url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80", label: "ON-FOOT STREET FIT", tag: "Street Perspective" },
      { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80", label: "MACRO LACE & TONGUE", tag: "Materials & QC" },
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", label: "TRACTION OUTSOLE", tag: "Grip & Air Unit" },
    ],
    adidas: [
      { url: mainImg, label: "LATERAL PROFILE", tag: "Main Studio View" },
      { url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=900&q=80", label: "ON-FOOT STREET FIT", tag: "Street Perspective" },
      { url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=900&q=80", label: "PRIMEKNIT & MIDSOLE", tag: "Materials & QC" },
      { url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80", label: "OUTSOLE TRACTION", tag: "Boost Outsole" },
    ],
    "new balance": [
      { url: mainImg, label: "LATERAL PROFILE", tag: "Main Studio View" },
      { url: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80", label: "ON-FOOT STREET FIT", tag: "Street Perspective" },
      { url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=900&q=80", label: "SUEDE CRAFTSMANSHIP", tag: "Materials & QC" },
      { url: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=900&q=80", label: "ENCAP TRACTION", tag: "Sole & Support" },
    ],
    converse: [
      { url: mainImg, label: "LATERAL PROFILE", tag: "Main Studio View" },
      { url: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=900&q=80", label: "ON-FOOT STREET FIT", tag: "Street Perspective" },
      { url: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=900&q=80", label: "CANVAS & ALL-STAR LOGO", tag: "Materials & QC" },
      { url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80", label: "DIAMOND TREAD SOLE", tag: "Vulcanized Grip" },
    ],
  };

  return (
    anglePresets[brand] || [
      { url: mainImg, label: "LATERAL PROFILE", tag: "Main Studio View" },
      { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80", label: "ON-FOOT STREET FIT", tag: "Street Perspective" },
      { url: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=900&q=80", label: "UPPER DETAIL & CUSHION", tag: "Materials & QC" },
      { url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80", label: "RUBBER TRACTION", tag: "Sole & Grip" },
    ]
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);

  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    price: "",
  });

  const [search, setSearch] = useState("");

  const [selections, setSelections] = useState({});

  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
    payment: "CARD",
  });

  // =========================
  // PAYMENT GATEWAY ADVANCED STATE
  // =========================
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    saveCard: true,
  });

  const [upiVpa, setUpiVpa] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Coupon / Promo Code State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponFeedback, setCouponFeedback] = useState({ message: "", isError: false });

  // =========================
  // AUDIO EFFECTS (SFX) STATE
  // =========================
  const [sfxEnabled, setSfxEnabled] = useState(
    () => localStorage.getItem("sm_sfx") !== "false"
  );

  const toggleSfx = () => {
    setSfxEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("sm_sfx", String(next));
      if (next) playSfx("click", true);
      return next;
    });
  };

  // =========================
  // DYNAMIC E-COMMERCE & FILTER STATE
  // =========================
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [sortBy, setSortBy] = useState("featured");
  const [isWishlistOnly, setIsWishlistOnly] = useState(false);

  // Advanced Filtering
  const [selectedSize, setSelectedSize] = useState("ALL");
  const [selectedPriceTier, setSelectedPriceTier] = useState("ALL");
  const [maxPriceFilter, setMaxPriceFilter] = useState(50000);

  // Quick Look Multi-Angle Gallery
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const openQuickView = (product) => {
    setActiveGalleryIdx(0);
    setQuickViewProduct(product);
    playSfx("click", sfxEnabled);
  };

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [liveActivityIndex, setLiveActivityIndex] = useState(0);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sm_wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState({ text: "", visible: false, icon: "👟" });

  const showToast = (text, icon = "👟") => {
    setToast({ text, visible: true, icon });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("sm_wishlist", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      playSfx("heart", sfxEnabled);
      showToast(exists ? "Removed from Wishlist" : "Saved to your Wishlist! ❤️", exists ? "💔" : "❤️");
      return updated;
    });
  };

  // Live social proof community activity feed
  const liveActivities = [
    { name: "Aarav", city: "Mumbai", shoe: "Air Jordan 1 High OG 'Chicago'", action: "just copped" },
    { name: "Dev", city: "Delhi", shoe: "Yeezy Boost 350", action: "bagged" },
    { name: "Rohan", city: "Bengaluru", shoe: "Nike Dunk Low Panda", action: "secured" },
    { name: "Priya", city: "Pune", shoe: "New Balance 550 Vintage White", action: "unboxed" },
    { name: "Kabir", city: "Hyderabad", shoe: "Air Jordan 4 University Blue", action: "bagged" },
    { name: "Ananya", city: "Kolkata", shoe: "Adidas Samba OG", action: "copped" },
    { name: "Zaid", city: "Chennai", shoe: "Asics Gel-Kayano 14", action: "secured" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivityIndex((prev) => (prev + 1) % liveActivities.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [liveActivities.length]);

  // Auto-rotate Hero Featured Drop
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(products.length, 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  // =========================
  // ADMIN / DEVELOPER MODE
  // Change ADMIN_PASSWORD to your own secret password
  // =========================

  const ADMIN_PASSWORD = "2005";

  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem("sm_admin") === "true"
  );
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);

    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      if (!isAdmin) setAdminModalOpen(true);
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0;
      }, 2000);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("sm_admin", "true");
      setIsAdmin(true);
      setAdminModalOpen(false);
      setAdminPwInput("");
      setAdminError("");
      playSfx("vault", sfxEnabled);
      showToast("Developer Admin Mode Activated! ⚡", "🛡️");
    } else {
      playSfx("click", sfxEnabled);
      setAdminError("Invalid security key. Access denied.");
      setAdminPwInput("");
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("sm_admin");
    setIsAdmin(false);
    showToast("Exited Developer Mode", "👋");
  };

  const closeAdminModal = () => {
    setAdminModalOpen(false);
    setAdminPwInput("");
    setAdminError("");
    setShowPassword(false);
  };

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  // Aggressive scroll to top whenever checkout or order-success opens
  useEffect(() => {
    if (isCheckoutOpen || isOrderSuccess) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const frame = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });

      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 40);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [isCheckoutOpen, isOrderSuccess]);

  // =========================
  // GET PRODUCT SELECTION
  // =========================

  const getSelection = (product) => {
    const current = selections[product._id];

    const sizes =
      Array.isArray(product.size) && product.size.length > 0
        ? product.size
        : ["Standard"];

    return {
      size: current?.size || sizes[0],
      quantity: current?.quantity || 1,
    };
  };

  // =========================
  // SIZE CHANGE
  // =========================

  const handleSizeChange = (productId, size) => {
    playSfx("click", sfxEnabled);
    setSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        size,
        quantity: prev[productId]?.quantity || 1,
      },
    }));
  };

  // =========================
  // QUANTITY CHANGE
  // =========================

  const handleQuantityChange = (product, change) => {
    playSfx("click", sfxEnabled);
    const current = getSelection(product);

    let newQuantity = current.quantity + change;

    if (newQuantity < 1) {
      newQuantity = 1;
    }

    if (product.stock > 0 && newQuantity > product.stock) {
      newQuantity = product.stock;
    }

    setSelections((prev) => ({
      ...prev,
      [product._id]: {
        ...prev[product._id],
        size: current.size,
        quantity: newQuantity,
      },
    }));
  };

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product, customSize = null, customQty = null) => {
    const current = getSelection(product);
    const sizeToUse = customSize || current.size;
    const qtyToUse = customQty || current.quantity;

    const existingIndex = cart.findIndex(
      (item) =>
        item._id === product._id &&
        item.selectedSize === sizeToUse
    );

    if (existingIndex !== -1) {
      setCart((prevCart) =>
        prevCart.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + qtyToUse,
              }
            : item
        )
      );
    } else {
      setCart((prevCart) => [
        ...prevCart,
        {
          ...product,
          selectedSize: sizeToUse,
          quantity: qtyToUse,
        },
      ]);
    }

    playSfx("cart", sfxEnabled);
    showToast(`Added ${product.name} (Size ${sizeToUse}) to cart!`, "🛒");
    setIsCartOpen(true);
  };

  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = (index) => {
    playSfx("click", sfxEnabled);
    setCart((prevCart) =>
      prevCart.filter((_, i) => i !== index)
    );
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const startEdit = (product) => {
    setEditingId(product._id);

    setEditForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveEdit = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        name: editForm.name,
        brand: editForm.brand,
        price: Number(editForm.price),
      });

      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === id ? response.data : p))
      );

      setEditingId(null);
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Unable to update product.");
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== id)
      );
      setCart((prevCart) => prevCart.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Unable to delete product.");
    }
  };

  // =========================
  // BRANDS & DYNAMIC ADVANCED FILTERING & SORTING
  // =========================

  const maxInventoryPrice = useMemo(() => {
    if (products.length === 0) return 50000;
    const max = Math.max(...products.map((p) => Number(p.price) || 0));
    return Math.max(50000, Math.ceil(max / 5000) * 5000);
  }, [products]);

  const availableSizes = useMemo(() => {
    const sSet = new Set();
    products.forEach((p) => {
      if (Array.isArray(p.size)) {
        p.size.forEach((s) => {
          const val = String(s).trim();
          if (val) sSet.add(val);
        });
      }
    });
    return [
      "ALL",
      ...Array.from(sSet).sort((a, b) => {
        const na = parseFloat(a);
        const nb = parseFloat(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      }),
    ];
  }, [products]);

  const allBrands = [
    "ALL",
    ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean))),
  ];

  const filteredProducts = products
    .filter((product) => {
      // 1. Text search
      const searchText = search.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(searchText) ||
        product.brand?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText);

      // 2. Brand pill filter
      const matchesBrand =
        selectedBrand === "ALL" ||
        product.brand?.toLowerCase() === selectedBrand.toLowerCase();

      // 3. Size filter (check available sizes)
      const matchesSize =
        selectedSize === "ALL" ||
        (Array.isArray(product.size) &&
          product.size.some(
            (s) => String(s).trim() === String(selectedSize).trim()
          ));

      // 4. Price tier filter
      const priceNum = Number(product.price) || 0;
      let matchesPriceTier = true;
      if (selectedPriceTier === "under-10k") {
        matchesPriceTier = priceNum < 10000;
      } else if (selectedPriceTier === "10k-20k") {
        matchesPriceTier = priceNum >= 10000 && priceNum <= 20000;
      } else if (selectedPriceTier === "20k-plus") {
        matchesPriceTier = priceNum > 20000;
      }

      // 5. Max price slider
      const matchesMaxPrice = priceNum <= maxPriceFilter;

      // 6. Wishlist filter
      const matchesWishlist = !isWishlistOnly || wishlist.includes(product._id);

      return (
        matchesSearch &&
        matchesBrand &&
        matchesSize &&
        matchesPriceTier &&
        matchesMaxPrice &&
        matchesWishlist
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0; // "featured" preserves drop manifest order
    });

  const hasActiveFilters =
    selectedBrand !== "ALL" ||
    selectedSize !== "ALL" ||
    selectedPriceTier !== "ALL" ||
    maxPriceFilter < maxInventoryPrice ||
    isWishlistOnly ||
    search.trim().length > 0;

  const resetAllFilters = () => {
    setSelectedBrand("ALL");
    setSelectedSize("ALL");
    setSelectedPriceTier("ALL");
    setMaxPriceFilter(maxInventoryPrice);
    setIsWishlistOnly(false);
    setSearch("");
    playSfx("click", sfxEnabled);
    showToast("Filters Reset to All Drops", "🔄");
  };

  // =========================
  // CART TOTAL
  // =========================

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // =========================
  // CHECKOUT
  // =========================

  const openCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const goBackToCart = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(true);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleOrderChange = (e) => {
    setOrderForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Card Network Auto-Detection
  const getCardNetwork = (num = "") => {
    const clean = num.replace(/\s+/g, "");
    if (/^4/.test(clean)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
    if (/^3[47]/.test(clean)) return "amex";
    if (/^(60|65|81|82)/.test(clean)) return "rupay";
    return "generic";
  };

  // Card Inputs Formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardData((prev) => ({ ...prev, number: formatted }));
  };

  const handleCardExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      let mm = parseInt(raw.slice(0, 2), 10);
      if (mm > 12) mm = 12;
      if (mm === 0) mm = "01";
      const mmStr = String(mm).padStart(2, "0");
      raw = mmStr + (raw.length > 2 ? "/" + raw.slice(2) : "");
    }
    setCardData((prev) => ({ ...prev, expiry: raw }));
  };

  const handleCardCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardData((prev) => ({ ...prev, cvv: raw }));
  };

  const handleCardNameChange = (e) => {
    setCardData((prev) => ({ ...prev, name: e.target.value.toUpperCase() }));
  };

  // Embossed number renderer for realistic physical card
  const formatCardNumberForDisplay = (num = "") => {
    const clean = num.replace(/\s+/g, "");
    const placeholder = "••••••••••••••••";
    const combined = (clean + placeholder.slice(clean.length)).slice(0, 16);
    return (
      combined.slice(0, 4) +
      "  " +
      combined.slice(4, 8) +
      "  " +
      combined.slice(8, 12) +
      "  " +
      combined.slice(12, 16)
    );
  };

  // Coupon Engine
  const handleApplyCoupon = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === "SOLE10") {
      const discount = Math.round(cartTotal * 0.1);
      setAppliedCoupon({ code: "SOLE10", discount, label: "10% Streetwear Grail Perk" });
      setCouponFeedback({ message: `Coupon 'SOLE10' applied! Saved ₹${discount.toLocaleString("en-IN")}`, isError: false });
      playSfx("success", sfxEnabled);
    } else if (clean === "GRAIL500") {
      const discount = Math.min(500, cartTotal);
      setAppliedCoupon({ code: "GRAIL500", discount, label: "₹500 Flat Vault Discount" });
      setCouponFeedback({ message: `Coupon 'GRAIL500' applied! Saved ₹500`, isError: false });
      playSfx("success", sfxEnabled);
    } else if (clean === "FIRSTDROP") {
      const discount = Math.min(1000, cartTotal);
      setAppliedCoupon({ code: "FIRSTDROP", discount, label: "₹1,000 First Drop Welcome Pass" });
      setCouponFeedback({ message: `Coupon 'FIRSTDROP' applied! Saved ₹1,000`, isError: false });
      playSfx("success", sfxEnabled);
    } else {
      setCouponFeedback({ message: "Invalid code. Try SOLE10, GRAIL500, or FIRSTDROP", isError: true });
      playSfx("click", sfxEnabled);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponFeedback({ message: "Coupon removed", isError: false });
    playSfx("click", sfxEnabled);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPayableTotal = Math.max(0, cartTotal - discountAmount);

  const placeOrder = (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (isProcessingOrder) return;

    if (
      !orderForm.name ||
      !orderForm.phone ||
      !orderForm.address ||
      !orderForm.city ||
      !orderForm.pin
    ) {
      alert("Please fill in all delivery destination details.");
      return;
    }

    const cleanCard = (cardData.number || "").replace(/\s+/g, "");
    if (orderForm.payment === "CARD" && cleanCard.length > 0 && cleanCard.length < 15) {
      alert("Please enter a valid 15 or 16-digit card number.");
      return;
    }

    const orderId = `SM-${Date.now().toString().slice(-8)}`;

    const confirmedOrder = {
      orderId,
      name: orderForm.name,
      phone: orderForm.phone,
      address: orderForm.address,
      city: orderForm.city,
      pin: orderForm.pin,
      payment: orderForm.payment,
      cardDetails:
        orderForm.payment === "CARD"
          ? {
              network: getCardNetwork(cardData.number),
              last4: cleanCard.slice(-4) || "4242",
              name: cardData.name || orderForm.name.toUpperCase(),
            }
          : null,
      upiDetails:
        orderForm.payment === "UPI"
          ? {
              vpa: upiVpa || "verified@okhdfcbank",
            }
          : null,
      bankDetails:
        orderForm.payment === "NETBANKING"
          ? {
              bank: selectedBank,
            }
          : null,
      items: [...cart],
      subtotal: cartTotal,
      discount: discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      total: finalPayableTotal,
    };

    // Trigger cool cinematic vault dispatch sequence
    setIsProcessingOrder(true);
    setProcessingStage(1);
    playSfx("vault", sfxEnabled);

    setTimeout(() => {
      setProcessingStage(2);
      playSfx("click", sfxEnabled);
    }, 450);

    setTimeout(() => {
      setProcessingStage(3);
      playSfx("click", sfxEnabled);
    }, 900);

    setTimeout(() => {
      setProcessingStage(4);
      playSfx("click", sfxEnabled);
    }, 1350);

    setTimeout(() => {
      setProcessingStage(5);
      playSfx("success", sfxEnabled);
    }, 1750);

    setTimeout(() => {
      setLastOrder(confirmedOrder);
      setCart([]);
      setIsProcessingOrder(false);
      setIsCheckoutOpen(false);
      setIsOrderSuccess(true);

      setOrderForm({
        name: "",
        phone: "",
        address: "",
        city: "",
        pin: "",
        payment: "CARD",
      });
      setCardData({
        number: "",
        name: "",
        expiry: "",
        cvv: "",
        saveCard: true,
      });
      setUpiVpa("");
      setAppliedCoupon(null);
      setCouponCode("");
    }, 2400);
  };

  // =========================
  // ORDER SUCCESS PAGE
  // =========================

 // =========================
// ORDER SUCCESS PAGE
// =========================

if (isOrderSuccess && lastOrder) {
  return (
    <div
      className="order-success-page"
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "40px 20px 60px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        {/* Success Hero */}

        <div
          style={{
            background: "#111",
            color: "#fff",
            borderRadius: "24px",
            padding: "50px 25px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(255,91,53,0.12)",
              top: "-100px",
              left: "-80px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              background: "rgba(255,91,53,0.10)",
              bottom: "-150px",
              right: "-80px",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Success Circle */}

            <div
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                background: "#ff5b35",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 25px",
                boxShadow: "0 12px 35px rgba(255,91,53,0.35)",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: "900",
                }}
              >
                ✓
              </span>
            </div>

            <p
              style={{
                color: "#ff5b35",
                fontWeight: "800",
                letterSpacing: "2px",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              ORDER CONFIRMED
            </p>

            <h1
              style={{
                fontSize: "42px",
                margin: "0 0 12px",
                fontWeight: "900",
              }}
            >
              Your kicks are on the way! 👟
            </h1>

            <p
              style={{
                color: "#ccc",
                fontSize: "17px",
                margin: "0 auto",
                maxWidth: "600px",
                lineHeight: "1.6",
              }}
            >
              Thanks for shopping with Sole Market,{" "}
              <strong style={{ color: "#fff" }}>
                {lastOrder.name}
              </strong>
              . Your order has been successfully placed.
            </p>
          </div>
        </div>

        {/* Order ID */}

        <div className="order-id-card">
          <div>
            <span className="order-id-label">ORDER ID</span>
            <strong className="order-id-value">{lastOrder.orderId}</strong>
          </div>

          <div className="order-payment-badge">
            {lastOrder.payment === "CARD" && (
              <span>✓ Paid with Card •••• {lastOrder.cardDetails?.last4 || "4242"} ({lastOrder.cardDetails?.network?.toUpperCase() || "VISA"})</span>
            )}
            {lastOrder.payment === "UPI" && (
              <span>✓ Paid via Instant UPI ({lastOrder.upiDetails?.vpa || "UPI Cleared"})</span>
            )}
            {lastOrder.payment === "NETBANKING" && (
              <span>✓ Net Banking Authorized ({lastOrder.bankDetails?.bank || "HDFC Bank"})</span>
            )}
            {lastOrder.payment === "COD" && (
              <span>✓ Cash on Delivery (Pay at Doorstep)</span>
            )}
          </div>
        </div>

        {/* Main Content */}

        <div className="order-success-grid">
          {/* Products */}

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 5px 25px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                }}
              >
                Your Order
              </h2>

              <span
                style={{
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                {lastOrder.items.length} item
                {lastOrder.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            {lastOrder.items.map((item, index) => (
              <div
                key={`${item._id}-${item.selectedSize}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "18px 0",
                  borderBottom:
                    index !== lastOrder.items.length - 1
                      ? "1px solid #eee"
                      : "none",
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: "95px",
                      height: "95px",
                      objectFit: "cover",
                      borderRadius: "16px",
                      background: "#f5f5f5",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "95px",
                      height: "95px",
                      borderRadius: "16px",
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "38px",
                    }}
                  >
                    👟
                  </div>
                )}

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px",
                      fontSize: "17px",
                    }}
                  >
                    {item.name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    {item.brand}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#f4f4f4",
                        padding: "5px 9px",
                        borderRadius: "7px",
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      Size {item.selectedSize}
                    </span>

                    <span
                      style={{
                        background: "#f4f4f4",
                        padding: "5px 9px",
                        borderRadius: "7px",
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      Qty {item.quantity}
                    </span>
                  </div>
                </div>

                <strong
                  style={{
                    fontSize: "17px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ₹
                  {(
                    Number(item.price) * item.quantity
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}

            {/* Total */}

            <div
              style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "2px solid #111",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                }}
              >
                Total Amount
              </span>

              <strong
                style={{
                  fontSize: "26px",
                  color: "#ff5b35",
                }}
              >
                ₹{Number(lastOrder.total).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Delivery */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 5px 25px rgba(0,0,0,0.06)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 20px",
                  fontSize: "22px",
                }}
              >
                Delivery Details
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "17px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#888",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    NAME
                  </span>

                  <strong>{lastOrder.name}</strong>
                </div>

                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#888",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    PHONE
                  </span>

                  <strong>{lastOrder.phone}</strong>
                </div>

                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#888",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    ADDRESS
                  </span>

                  <strong>{lastOrder.address}</strong>
                </div>

                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#888",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    CITY & PIN
                  </span>

                  <strong>
                    {lastOrder.city} - {lastOrder.pin}
                  </strong>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}

            <div
              style={{
                background: "#111",
                color: "#fff",
                borderRadius: "20px",
                padding: "25px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "12px",
                }}
              >
                🚚
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "19px",
                }}
              >
                Estimated Delivery
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#ccc",
                  lineHeight: "1.5",
                  fontSize: "14px",
                }}
              >
                Your order is being prepared and will
                reach you soon.
              </p>

              <div
                style={{
                  marginTop: "18px",
                  background: "#ff5b35",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  textAlign: "center",
                  fontWeight: "800",
                }}
              >
                Order Confirmed ✓
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}

        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => {
              setIsOrderSuccess(false);
              setLastOrder(null);
            }}
            style={{
              border: "none",
              background: "#ff5b35",
              color: "#fff",
              padding: "16px 38px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow:
                "0 8px 25px rgba(255,91,53,0.25)",
            }}
          >
            Continue Shopping →
          </button>

          <p
            style={{
              marginTop: "18px",
              color: "#888",
              fontSize: "14px",
            }}
          >
            Thank you for choosing{" "}
            <strong style={{ color: "#111" }}>
              SOLE MARKET
            </strong>{" "}
            🧡
          </p>
        </div>
      </div>
    </div>
  );
}
    // =========================
  // CHECKOUT PAGE
  // =========================

  if (isCheckoutOpen) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">

          <button
            className="back-cart-button"
            onClick={goBackToCart}
          >
            ← Back to Cart
          </button>

          <div className="checkout-heading">
            <div className="checkout-brand-tag">SOLE MARKET // SECURE GATEWAY</div>
            <h1>Vault Checkout 🛍️</h1>
            <p>Finalize your drop. Your kicks are reserved and ready for dispatch.</p>
          </div>

          {/* Interactive Step HUD */}
          <div className="checkout-steps">
            <div className="checkout-step active">
              <div className="checkout-step-num">01</div>
              <div className="checkout-step-info">
                <span>STEP 01</span>
                <strong>SHIPPING DOSSIER</strong>
              </div>
            </div>
            <div className="checkout-step-line active" />
            <div className="checkout-step active">
              <div className="checkout-step-num">02</div>
              <div className="checkout-step-info">
                <span>STEP 02</span>
                <strong>PAYMENT PROTOCOL</strong>
              </div>
            </div>
            <div className="checkout-step-line" />
            <div className="checkout-step">
              <div className="checkout-step-num">03</div>
              <div className="checkout-step-info">
                <span>STEP 03</span>
                <strong>VAULT DISPATCH</strong>
              </div>
            </div>
          </div>

          <div className="checkout-layout">

            <form
              className="checkout-form"
              onSubmit={placeOrder}
            >

              <div className="checkout-card">
                <h2>
                  <span className="section-icon">📦</span>
                  <span>Delivery Destination</span>
                </h2>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Kartik Paliwal"
                    value={orderForm.name}
                    onChange={handleOrderChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Contact</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={orderForm.phone}
                    onChange={handleOrderChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Street Address & Landmark</label>
                  <textarea
                    name="address"
                    placeholder="House / Flat No., Apartment / Street, Landmark"
                    value={orderForm.address}
                    onChange={handleOrderChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="checkout-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai / Delhi"
                      value={orderForm.city}
                      onChange={handleOrderChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal PIN Code</label>
                    <input
                      type="text"
                      name="pin"
                      placeholder="e.g. 400001"
                      value={orderForm.pin}
                      onChange={handleOrderChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="checkout-card payment-gateway-card">
                <h2>
                  <span className="section-icon">💳</span>
                  <span>Payment Gateway</span>
                </h2>

                {/* 1-Tap Express Checkout Bar */}
                <div className="express-checkout-card">
                  <div className="express-header">
                    <span>⚡ EXPRESS 1-TAP CHECKOUT</span>
                  </div>
                  <div className="express-buttons-grid">
                    <button
                      type="button"
                      className="btn-express apple-pay"
                      onClick={() => {
                        playSfx("click", sfxEnabled);
                        setOrderForm((prev) => ({ ...prev, payment: "CARD" }));
                        alert("Apple Pay authorized via FaceID. Tap Confirm Order to secure drop.");
                      }}
                    >
                      <span className="apple-logo"></span> Pay
                    </button>
                    <button
                      type="button"
                      className="btn-express gpay"
                      onClick={() => {
                        playSfx("click", sfxEnabled);
                        setOrderForm((prev) => ({ ...prev, payment: "UPI" }));
                        alert("Google Pay wallet selected. Tap Confirm Order to secure drop.");
                      }}
                    >
                      <span style={{ color: "#4285F4" }}>G</span>
                      <span style={{ color: "#EA4335" }}>o</span>
                      <span style={{ color: "#FBBC05" }}>o</span>
                      <span style={{ color: "#4285F4" }}>g</span>
                      <span style={{ color: "#34A853" }}>l</span>
                      <span style={{ color: "#EA4335" }}>e</span> Pay
                    </button>
                    <button
                      type="button"
                      className="btn-express vault-pay"
                      onClick={() => {
                        playSfx("vault", sfxEnabled);
                        setOrderForm((prev) => ({ ...prev, payment: "CARD" }));
                      }}
                    >
                      ⚡ Vault 1-Click
                    </button>
                  </div>
                  <div className="express-divider">
                    <span>OR SELECT PAYMENT METHOD</span>
                  </div>
                </div>

                <div className="payment-options">

                  {/* OPTION 1: CREDIT / DEBIT CARD */}
                  <div
                    className={
                      orderForm.payment === "CARD"
                        ? "payment-option-accordion active"
                        : "payment-option-accordion"
                    }
                  >
                    <label
                      className="payment-option-header"
                      onClick={() => {
                        setOrderForm((prev) => ({ ...prev, payment: "CARD" }));
                        playSfx("click", sfxEnabled);
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="CARD"
                        checked={orderForm.payment === "CARD"}
                        onChange={handleOrderChange}
                      />
                      <span className="payment-icon">💳</span>
                      <div className="payment-details">
                        <div className="payment-header">
                          <strong>Credit / Debit Card</strong>
                          <span className="payment-badge-pill highlight">VISA • MC • RUPAY • AMEX</span>
                        </div>
                        <small>All Indian & international cards with 3D Secure 2.0</small>
                      </div>
                    </label>

                    {orderForm.payment === "CARD" && (
                      <div className="payment-subpanel card-subpanel">
                        {/* REALISTIC PHYSICAL CREDIT CARD PREVIEW */}
                        <div className="realistic-card-preview-container">
                          <div className="realistic-card">
                            <div className="card-gloss-sheen" />
                            <div className="card-mesh-pattern" />

                            {/* Top row */}
                            <div className="card-top-row">
                              <div className="card-bank-brand">
                                <span className="bank-logo-text">SOLE VAULT</span>
                                <span className="bank-tier-tag">TITANIUM GRAIL</span>
                              </div>
                              <div className="card-nfc-wave" title="Contactless Enabled">
                                <svg
                                  viewBox="0 0 24 24"
                                  width="20"
                                  height="20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                >
                                  <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                                  <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                                  <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                                </svg>
                              </div>
                            </div>

                            {/* Chip and Network Logo row */}
                            <div className="card-chip-row">
                              <div className="card-emv-chip">
                                <div className="chip-line v1" />
                                <div className="chip-line v2" />
                                <div className="chip-line h1" />
                                <div className="chip-core" />
                              </div>

                              <div className="card-network-badge">
                                {getCardNetwork(cardData.number) === "visa" && (
                                  <div className="network-logo visa-badge">VISA</div>
                                )}
                                {getCardNetwork(cardData.number) === "mastercard" && (
                                  <div className="network-logo mastercard-badge">
                                    <span className="mc-circle red" />
                                    <span className="mc-circle yellow" />
                                  </div>
                                )}
                                {getCardNetwork(cardData.number) === "amex" && (
                                  <div className="network-logo amex-badge">AMEX</div>
                                )}
                                {getCardNetwork(cardData.number) === "rupay" && (
                                  <div className="network-logo rupay-badge">RuPay ❯</div>
                                )}
                                {getCardNetwork(cardData.number) === "generic" && (
                                  <div className="network-logo generic-badge">VAULT CARD</div>
                                )}
                              </div>
                            </div>

                            {/* Embossed 16-Digit Number */}
                            <div className="card-number-embossed">
                              {formatCardNumberForDisplay(cardData.number)}
                            </div>

                            {/* Bottom row: Cardholder, Expiry, Hologram */}
                            <div className="card-bottom-row">
                              <div className="card-holder-col">
                                <span className="card-micro-label">CARDHOLDER</span>
                                <span className="card-holder-name">
                                  {cardData.name.trim() ||
                                    orderForm.name.toUpperCase().trim() ||
                                    "CARDHOLDER NAME"}
                                </span>
                              </div>

                              <div className="card-expiry-col">
                                <span className="card-micro-label">EXPIRES</span>
                                <span className="card-expiry-value">
                                  {cardData.expiry || "MM/YY"}
                                </span>
                              </div>

                              <div className="card-hologram-seal" title="Authentic Security Hologram">
                                <span className="holo-inner">★</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Real Card Input Fields */}
                        <div className="card-form-grid">
                          <div className="form-group card-number-group">
                            <label>Card Number</label>
                            <div className="card-input-wrap">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="4532 8901 2345 6789"
                                value={cardData.number}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                              />
                              <div className="input-card-network-icon">
                                {getCardNetwork(cardData.number) === "visa" && (
                                  <span className="mini-network visa">VISA</span>
                                )}
                                {getCardNetwork(cardData.number) === "mastercard" && (
                                  <div className="mini-network mc">
                                    <span className="mini-circle red" />
                                    <span className="mini-circle yellow" />
                                  </div>
                                )}
                                {getCardNetwork(cardData.number) === "amex" && (
                                  <span className="mini-network amex">AMEX</span>
                                )}
                                {getCardNetwork(cardData.number) === "rupay" && (
                                  <span className="mini-network rupay">RuPay</span>
                                )}
                                {getCardNetwork(cardData.number) === "generic" && (
                                  <span className="mini-network card-icon">💳</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Cardholder Name</label>
                            <input
                              type="text"
                              placeholder="Name printed on card"
                              value={cardData.name}
                              onChange={handleCardNameChange}
                            />
                          </div>

                          <div className="checkout-row">
                            <div className="form-group">
                              <label>Expiry Date</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="MM / YY"
                                value={cardData.expiry}
                                onChange={handleCardExpiryChange}
                                maxLength={5}
                              />
                            </div>

                            <div className="form-group">
                              <div className="cvv-label-wrap">
                                <label>CVV / CVC</label>
                                <span
                                  className="cvv-hint"
                                  title="3 digits on the signature strip on the back of your card"
                                >
                                  3-digits ℹ️
                                </span>
                              </div>
                              <div className="cvv-input-wrap">
                                <input
                                  type="password"
                                  inputMode="numeric"
                                  placeholder="•••"
                                  value={cardData.cvv}
                                  onChange={handleCardCvvChange}
                                  maxLength={getCardNetwork(cardData.number) === "amex" ? 4 : 3}
                                />
                                <span className="cvv-lock-icon">🔒</span>
                              </div>
                            </div>
                          </div>

                          {/* Save Card Toggle */}
                          <label className="save-card-toggle">
                            <input
                              type="checkbox"
                              checked={cardData.saveCard}
                              onChange={(e) =>
                                setCardData((prev) => ({ ...prev, saveCard: e.target.checked }))
                              }
                            />
                            <div className="save-card-content">
                              <strong>Save card securely for future 1-click drops</strong>
                              <span>Complies with RBI Card-on-File Tokenization standards. CVV is never stored.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION 2: INSTANT UPI / QR PROTOCOL */}
                  <div
                    className={
                      orderForm.payment === "UPI"
                        ? "payment-option-accordion active"
                        : "payment-option-accordion"
                    }
                  >
                    <label
                      className="payment-option-header"
                      onClick={() => {
                        setOrderForm((prev) => ({ ...prev, payment: "UPI" }));
                        playSfx("click", sfxEnabled);
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="UPI"
                        checked={orderForm.payment === "UPI"}
                        onChange={handleOrderChange}
                      />
                      <span className="payment-icon">⚡</span>
                      <div className="payment-details">
                        <div className="payment-header">
                          <strong>Instant UPI / QR Protocol</strong>
                          <span className="payment-badge-pill highlight">FAST DISPATCH 🚀</span>
                        </div>
                        <small>Zero-contact instant clearance via GPay, PhonePe, Paytm, BHIM</small>
                      </div>
                    </label>

                    {orderForm.payment === "UPI" && (
                      <div className="payment-subpanel upi-subpanel">
                        <div className="upi-qr-card">
                          <div className="upi-qr-header">
                            <span>⚡ SCAN & PAY VIA ANY UPI APP</span>
                            <span className="upi-timer-badge">⏱️ 09:45 min</span>
                          </div>

                          <div className="upi-qr-wrapper">
                            <div className="upi-qr-scan-line" />
                            <div className="upi-qr-mock">
                              <div className="qr-corner top-left" />
                              <div className="qr-corner top-right" />
                              <div className="qr-corner bottom-left" />
                              <div className="qr-corner bottom-right" />
                              <div className="qr-center-badge">SM</div>
                            </div>
                          </div>

                          <p className="upi-qr-caption">
                            Point your camera or UPI scanner at the QR code above
                          </p>

                          <div className="upi-apps-row">
                            <span className="upi-app-badge gpay">GPay</span>
                            <span className="upi-app-badge phonepe">PhonePe</span>
                            <span className="upi-app-badge paytm">Paytm</span>
                            <span className="upi-app-badge cred">CRED</span>
                            <span className="upi-app-badge bhim">BHIM</span>
                          </div>
                        </div>

                        <div className="upi-divider-line">
                          <span>OR ENTER UPI ID</span>
                        </div>

                        <div className="form-group upi-id-group">
                          <label>Virtual Payment Address (VPA)</label>
                          <input
                            type="text"
                            placeholder="username@okhdfcbank or 9876543210@paytm"
                            value={upiVpa}
                            onChange={(e) => setUpiVpa(e.target.value)}
                          />
                          <div className="upi-handle-chips">
                            {["@okhdfcbank", "@okaxis", "@paytm", "@ybl", "@ibl"].map((handle) => (
                              <button
                                type="button"
                                key={handle}
                                className="upi-handle-chip"
                                onClick={() => {
                                  const base = upiVpa.includes("@")
                                    ? upiVpa.split("@")[0]
                                    : upiVpa || "user";
                                  setUpiVpa(base + handle);
                                  playSfx("click", sfxEnabled);
                                }}
                              >
                                {handle}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION 3: NET BANKING */}
                  <div
                    className={
                      orderForm.payment === "NETBANKING"
                        ? "payment-option-accordion active"
                        : "payment-option-accordion"
                    }
                  >
                    <label
                      className="payment-option-header"
                      onClick={() => {
                        setOrderForm((prev) => ({ ...prev, payment: "NETBANKING" }));
                        playSfx("click", sfxEnabled);
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="NETBANKING"
                        checked={orderForm.payment === "NETBANKING"}
                        onChange={handleOrderChange}
                      />
                      <span className="payment-icon">🏛️</span>
                      <div className="payment-details">
                        <div className="payment-header">
                          <strong>Net Banking</strong>
                          <span className="payment-badge-pill">50+ BANKS</span>
                        </div>
                        <small>Direct instant authorization from your bank account</small>
                      </div>
                    </label>

                    {orderForm.payment === "NETBANKING" && (
                      <div className="payment-subpanel netbanking-subpanel">
                        <label className="netbanking-sub-label">Popular Indian Banks</label>
                        <div className="netbanking-grid">
                          {[
                            { id: "HDFC", name: "HDFC Bank", icon: "🏛️" },
                            { id: "ICICI", name: "ICICI Bank", icon: "🏦" },
                            { id: "SBI", name: "State Bank of India", icon: "🏛️" },
                            { id: "AXIS", name: "Axis Bank", icon: "🏢" },
                            { id: "KOTAK", name: "Kotak Mahindra", icon: "🏦" },
                            { id: "PNB", name: "Punjab National", icon: "🏛️" },
                          ].map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              className={`bank-card-chip ${
                                selectedBank === bank.id ? "active" : ""
                              }`}
                              onClick={() => {
                                setSelectedBank(bank.id);
                                playSfx("click", sfxEnabled);
                              }}
                            >
                              <span className="bank-chip-icon">{bank.icon}</span>
                              <span className="bank-chip-name">{bank.name}</span>
                            </button>
                          ))}
                        </div>

                        <div className="form-group netbanking-select-group">
                          <label>All Other Banks</label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="netbanking-select"
                          >
                            <option value="HDFC">HDFC Bank</option>
                            <option value="ICICI">ICICI Bank</option>
                            <option value="SBI">State Bank of India</option>
                            <option value="AXIS">Axis Bank</option>
                            <option value="KOTAK">Kotak Mahindra Bank</option>
                            <option value="BOB">Bank of Baroda</option>
                            <option value="CANARA">Canara Bank</option>
                            <option value="INDUSIND">IndusInd Bank</option>
                            <option value="IDFC">IDFC FIRST Bank</option>
                            <option value="YES">Yes Bank</option>
                            <option value="FEDERAL">Federal Bank</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION 4: CASH ON DELIVERY */}
                  <div
                    className={
                      orderForm.payment === "COD"
                        ? "payment-option-accordion active"
                        : "payment-option-accordion"
                    }
                  >
                    <label
                      className="payment-option-header"
                      onClick={() => {
                        setOrderForm((prev) => ({ ...prev, payment: "COD" }));
                        playSfx("click", sfxEnabled);
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={orderForm.payment === "COD"}
                        onChange={handleOrderChange}
                      />
                      <span className="payment-icon">💵</span>
                      <div className="payment-details">
                        <div className="payment-header">
                          <strong>Cash on Delivery (COD)</strong>
                          <span className="payment-badge-pill">DOORSTEP PASS</span>
                        </div>
                        <small>Unbox & inspect kicks before paying via cash or courier’s QR</small>
                      </div>
                    </label>

                    {orderForm.payment === "COD" && (
                      <div className="payment-subpanel cod-subpanel">
                        <div className="cod-info-box">
                          <div className="cod-icon-badge">📦</div>
                          <div className="cod-info-text">
                            <strong>100% Legit Inspection Pass Included</strong>
                            <p>
                              Our delivery courier will hand over the package for unboxing and legitimate check inspection before collection. You can pay via cash or scan courier’s mobile QR.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bank Grade Security & Compliance Badges */}
                <div className="payment-security-trust-bar">
                  <div className="sec-trust-item">
                    <span className="sec-icon">🔒</span>
                    <div>
                      <strong>256-Bit TLS</strong>
                      <small>Bank Encryption</small>
                    </div>
                  </div>
                  <div className="sec-trust-item">
                    <span className="sec-icon">🛡️</span>
                    <div>
                      <strong>PCI-DSS Lv.1</strong>
                      <small>Certified Gateway</small>
                    </div>
                  </div>
                  <div className="sec-trust-item">
                    <span className="sec-icon">🇮🇳</span>
                    <div>
                      <strong>RBI 3DS 2.0</strong>
                      <small>OTP Authenticated</small>
                    </div>
                  </div>
                  <div className="sec-trust-item">
                    <span className="sec-icon">⚡</span>
                    <div>
                      <strong>100% Legit</strong>
                      <small>Buyer Guarantee</small>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="place-order-button"
                disabled={isProcessingOrder}
              >
                <span className="place-order-shine"></span>
                <span>
                  {isProcessingOrder
                    ? "Securing Drop... ⚡"
                    : `Confirm Order • ₹${Number(finalPayableTotal).toLocaleString("en-IN")}`}
                </span>
                <span className="place-order-arrow">
                  {isProcessingOrder ? "⚡" : "→"}
                </span>
              </button>

            </form>

            {/* SNEAKER VAULT AUTHENTICATION PASS & ORDER SUMMARY */}
            <div className="checkout-summary">

              <div className="vault-receipt">
                <div className="vault-receipt-top">
                  <div className="vault-receipt-brand">
                    <span className="vault-receipt-logo">SOLE MARKET</span>
                    <span className="vault-receipt-type">AUTHENTIC DROP PASS</span>
                  </div>
                  <div className="vault-hologram-seal">
                    <span className="vault-seal-star">★</span>
                    <span className="vault-seal-text">VERIFIED 100%</span>
                  </div>
                </div>

                <div className="vault-receipt-divider" />

                {/* Coupon Code Pass */}
                <div className="checkout-coupon-card">
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Promo / Vault Pass Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        className="btn-coupon remove"
                        onClick={handleRemoveCoupon}
                      >
                        ✕ Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-coupon apply"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponFeedback.message && (
                    <div
                      className={`coupon-feedback ${
                        couponFeedback.isError ? "error" : "success"
                      }`}
                    >
                      {couponFeedback.message}
                    </div>
                  )}

                  {!appliedCoupon && (
                    <div className="coupon-hints">
                      <span>Try:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode("SOLE10");
                        }}
                      >
                        SOLE10
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode("GRAIL500");
                        }}
                      >
                        GRAIL500
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode("FIRSTDROP");
                        }}
                      >
                        FIRSTDROP
                      </button>
                    </div>
                  )}
                </div>

                <div className="vault-receipt-items-header">
                  <span>ITEM MANIFEST ({cart.length})</span>
                  <span className="vault-dispatch-badge">DISPATCH: TODAY ⚡</span>
                </div>

                <div className="checkout-items">
                  {cart.map((item, index) => (
                    <div
                      className="checkout-item"
                      key={`${item._id}-${item.selectedSize}-${index}`}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div className="checkout-item-no-image">
                          👟
                        </div>
                      )}

                      <div className="checkout-item-info">
                        <strong>{item.name}</strong>
                        <span className="checkout-item-brand">{item.brand}</span>
                        <div className="checkout-item-specs">
                          <span className="spec-tag">Size: {item.selectedSize}</span>
                          <span className="spec-tag">Qty: {item.quantity}</span>
                        </div>
                      </div>

                      <b className="checkout-item-price">
                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                      </b>
                    </div>
                  ))}
                </div>

                <div className="vault-pricing-breakdown">
                  <div className="pricing-row">
                    <span>Retail Subtotal</span>
                    <span>₹{Number(cartTotal).toLocaleString("en-IN")}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="pricing-row discount-highlight">
                      <span>
                        Vault Discount <strong className="discount-tag">({appliedCoupon.code})</strong>
                      </span>
                      <span className="discount-value">
                        -₹{Number(appliedCoupon.discount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="pricing-row highlight-free">
                    <span>Authentication & QC Inspection</span>
                    <span className="free-badge">FREE (PASS)</span>
                  </div>
                  <div className="pricing-row highlight-free">
                    <span>Insured Express Courier</span>
                    <span className="free-badge">FREE</span>
                  </div>
                  <div className="vault-total-divider" />
                  <div className="checkout-total">
                    <div>
                      <span>Total Amount</span>
                      <small className="tax-inclusive-tag">Taxes & Courier Included</small>
                    </div>
                    <strong>₹{Number(finalPayableTotal).toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                {/* Perforated barcode ticket footer */}
                <div className="vault-receipt-barcode">
                  <div className="barcode-graphic" />
                  <div className="barcode-code">SM-VAULT // {Date.now().toString().slice(-8)} // VERIFIED</div>
                </div>

                <div className="secure-vault-guarantee">
                  <span>🔒 256-Bit SSL Encrypted Sneaker Vault Checkout</span>
                </div>
              </div>

            </div>

          </div>

          {/* Mobile Bottom Floating Sticky Action Bar */}
          <div className="mobile-checkout-bar">
            <div className="mobile-checkout-bar-info">
              <span className="mobile-checkout-bar-label">Total to Pay</span>
              <strong className="mobile-checkout-bar-price">₹{Number(finalPayableTotal).toLocaleString("en-IN")}</strong>
            </div>
            <button
              type="button"
              className="mobile-checkout-bar-btn"
              onClick={placeOrder}
              disabled={isProcessingOrder}
            >
              {isProcessingOrder ? "Securing... ⚡" : "Confirm Order 🛍️"}
            </button>
          </div>

          {/* Cinematic Vault Processing & Celebration Sequence */}
          {isProcessingOrder && (
            <div className="order-processing-overlay">
              <div className="order-processing-card">
                <div className="processing-scanner-line" />
                <div className="processing-glow-ambient" />

                <div className="processing-icon-wrap">
                  <div className="processing-spin-ring" />
                  <div className="processing-spin-ring-inner" />
                  <div className="processing-core-icon">
                    {processingStage < 5 ? "⚡" : "🎉"}
                  </div>
                </div>

                <div className="processing-header">
                  <div className="processing-tag">VAULT PROTOCOL // 2026</div>
                  <h2>
                    {processingStage < 5
                      ? "Securing Your Drop..."
                      : "Drop Confirmed & Verified! 🚀"}
                  </h2>
                  <p>
                    Authenticating grails, encrypting order dossier, and reserving vault inventory.
                  </p>
                </div>

                {/* Step-by-Step Verification Checklist */}
                <div className="processing-steps-list">
                  <div
                    className={`proc-step ${
                      processingStage >= 1 ? "active" : ""
                    } ${processingStage > 1 ? "completed" : ""}`}
                  >
                    <span className="proc-check">
                      {processingStage > 1 ? "✓" : "○"}
                    </span>
                    <span>256-Bit SSL Vault Encryption</span>
                  </div>
                  <div
                    className={`proc-step ${
                      processingStage >= 2 ? "active" : ""
                    } ${processingStage > 2 ? "completed" : ""}`}
                  >
                    <span className="proc-check">
                      {processingStage > 2 ? "✓" : "○"}
                    </span>
                    <span>100% Legit Check & Authenticity Verified</span>
                  </div>
                  <div
                    className={`proc-step ${
                      processingStage >= 3 ? "active" : ""
                    } ${processingStage > 3 ? "completed" : ""}`}
                  >
                    <span className="proc-check">
                      {processingStage > 3 ? "✓" : "○"}
                    </span>
                    <span>Inventory Allocated from Vault</span>
                  </div>
                  <div
                    className={`proc-step ${
                      processingStage >= 4 ? "active" : ""
                    } ${processingStage > 4 ? "completed" : ""}`}
                  >
                    <span className="proc-check">
                      {processingStage > 4 ? "✓" : "○"}
                    </span>
                    <span>Priority Insured Air Dispatch Booked</span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="proc-progress-track">
                  <div
                    className="proc-progress-fill"
                    style={{
                      width: `${Math.min(100, processingStage * 25)}%`,
                    }}
                  />
                </div>

                {/* Confetti Explosion on completion */}
                {processingStage >= 5 && (
                  <div className="confetti-container">
                    {Array.from({ length: 45 }).map((_, i) => (
                      <span
                        key={i}
                        className="confetti-piece"
                        style={{
                          left: `${(i * 2.2) % 100}%`,
                          animationDelay: `${(i % 8) * 0.08}s`,
                          backgroundColor: [
                            "#ff5b35",
                            "#ffd700",
                            "#00e676",
                            "#00f0ff",
                            "#ffffff",
                            "#ff4081",
                            "#7c4dff",
                          ][i % 7],
                          transform: `rotate(${i * 24}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="app">

      {/* Header */}

      <header className="header">

        <div className="logo">
          <span className="logo-main">SOLE</span>
          <span className="logo-market">MARKET</span>
        </div>

        <input
          type="text"
          className="search-box"
          placeholder="Search shoes or brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {isAdmin ? (
          <div className="admin-hud-capsule">
            <div className="admin-hud-status">
              <span className="admin-hud-core-pulse" />
              <span className="admin-hud-title">DEV CORE</span>
              <span className="admin-hud-badge">ONLINE</span>
            </div>
            <button
              type="button"
              className="admin-hud-action"
              onClick={() => {
                document.querySelector(".add-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              + Drop Shoe
            </button>
            <button
              type="button"
              className="admin-hud-exit"
              onClick={handleAdminLogout}
              title="Exit Developer Mode"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="admin-quantum-btn"
            onClick={() => {
              playSfx("vault", sfxEnabled);
              setAdminModalOpen(true);
            }}
            title="Developer Vault Access"
          >
            <span className="admin-btn-beam" />
            <span className="admin-btn-icon">⚡</span>
            <span className="admin-btn-text">DEV VAULT</span>
            <span className="admin-btn-tag">DEV</span>
          </button>
        )}

        {/* SFX Audio Mute/Unmute Switch */}
        <button
          type="button"
          className={`sfx-toggle-btn ${sfxEnabled ? "active" : "muted"}`}
          onClick={toggleSfx}
          title={sfxEnabled ? "Cyber SFX: ON (Click to Mute)" : "Cyber SFX: MUTED (Click to Unmute)"}
        >
          <span className="sfx-icon">{sfxEnabled ? "🔊" : "🔇"}</span>
          <span className="sfx-label">{sfxEnabled ? "SFX" : "MUTE"}</span>
          {sfxEnabled && <span className="sfx-pulse-dot" />}
        </button>

        <button
          type="button"
          className={`wishlist-nav-btn ${isWishlistOnly ? "active" : ""}`}
          onClick={() => {
            playSfx("click", sfxEnabled);
            setIsWishlistOnly(!isWishlistOnly);
            document.querySelector(".products-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          title={isWishlistOnly ? "Showing your Wishlist" : "View Wishlist"}
        >
          <span>❤️</span>
          <span className="wishlist-count">{wishlist.length}</span>
        </button>

        <button
          className="cart"
          onClick={() => {
            playSfx("click", sfxEnabled);
            setIsCartOpen(true);
          }}
        >
          🛒 Cart ({cartCount})
        </button>

      </header>

      {/* Infinite Hype Streetwear Marquee */}
      <div className="hype-marquee">
        <div className="marquee-track">
          <span>⚡ 100% VERIFIED AUTHENTIC GRAILS</span>
          <span className="marquee-dot">•</span>
          <span>🔥 FREE INSURED EXPRESS DISPATCH ACROSS INDIA</span>
          <span className="marquee-dot">•</span>
          <span>👟 18+ RARE COLLECTOR DROPS LIVE</span>
          <span className="marquee-dot">•</span>
          <span>🔒 256-BIT ENCRYPTED VAULT GATEWAY</span>
          <span className="marquee-dot">•</span>
          <span>🚀 NEXT-DAY VAULT DISPATCH</span>
          <span className="marquee-dot">•</span>
          <span>⚡ 100% VERIFIED AUTHENTIC GRAILS</span>
          <span className="marquee-dot">•</span>
          <span>🔥 FREE INSURED EXPRESS DISPATCH ACROSS INDIA</span>
          <span className="marquee-dot">•</span>
          <span>👟 18+ RARE COLLECTOR DROPS LIVE</span>
          <span className="marquee-dot">•</span>
          <span>🔒 256-BIT ENCRYPTED VAULT GATEWAY</span>
          <span className="marquee-dot">•</span>
        </div>
      </div>

      {/* Dynamic Interactive Hero Drop Spotlight */}
      <section className="hero-spotlight">
        <div className="hero-content">
          <div className="hero-tag-pill">
            <span className="hero-tag-dot" />
            <span>AUTHENTIC DROP HUB // 2026</span>
          </div>

          <h1>
            THE VAULT IS OPEN. <br />
            <span className="gradient-text">STEP INTO STYLE.</span>
          </h1>

          <p>
            Curated collector grails and streetwear essentials from Nike, Jordan,
            Adidas, New Balance, Asics & Converse. Inspected, authenticated, and ready to ship.
          </p>

          <div className="hero-cta-row">
            <button
              type="button"
              className="hero-primary-btn"
              onClick={() =>
                document
                  .querySelector(".products-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore All Drops ↓
            </button>

            <button
              type="button"
              className={`hero-secondary-btn ${isWishlistOnly ? "active" : ""}`}
              onClick={() => {
                setIsWishlistOnly(!isWishlistOnly);
                document
                  .querySelector(".products-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {isWishlistOnly ? "Showing All Drops" : `❤️ Wishlist (${wishlist.length})`}
            </button>
          </div>

          <div className="hero-trust-metrics">
            <div className="metric-item">
              <strong>18+</strong>
              <span>Grail Releases</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>100%</strong>
              <span>Legit Check</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <strong>24h</strong>
              <span>Vault Dispatch</span>
            </div>
          </div>
        </div>

        {/* Interactive 3D Featured Sneaker Showcase */}
        {products.length > 0 && (
          <div className="hero-showcase-card">
            <div className="showcase-card-ambient" />
            <div className="showcase-header">
              <span className="showcase-badge">
                🔥 FEATURED GRAIL #{featuredIndex + 1}
              </span>
              <div className="showcase-nav-arrows">
                <button
                  type="button"
                  className="showcase-nav-btn"
                  onClick={() =>
                    setFeaturedIndex((prev) =>
                      prev === 0 ? products.length - 1 : prev - 1
                    )
                  }
                  title="Previous Drop"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="showcase-nav-btn"
                  onClick={() =>
                    setFeaturedIndex((prev) => (prev + 1) % products.length)
                  }
                  title="Next Drop"
                >
                  ›
                </button>
              </div>
            </div>

            {(() => {
              const featured = products[featuredIndex] || products[0];
              if (!featured) return null;
              return (
                <div className="showcase-body" key={featured._id}>
                  <div
                    className="showcase-img-wrap"
                    onClick={() => openQuickView(featured)}
                    title="Tap to Inspect Grail"
                  >
                    <div className="showcase-radial-glow" />
                    <img
                      src={featured.imageUrl}
                      alt={featured.name}
                      className="showcase-img"
                    />
                    <span className="showcase-quick-view-hint">
                      👁️ Tap to Inspect
                    </span>
                  </div>

                  <div className="showcase-details">
                    <div className="showcase-brand-row">
                      <span className="showcase-brand-tag">
                        {featured.brand}
                      </span>
                      <span className="showcase-stock-tag">
                        {featured.stock <= 3
                          ? `⚡ ONLY ${featured.stock} LEFT`
                          : `IN STOCK (${featured.stock})`}
                      </span>
                    </div>

                    <h3 className="showcase-title">{featured.name}</h3>

                    <div className="showcase-footer">
                      <div className="showcase-price-box">
                        <span className="showcase-price-label">
                          Vault Price
                        </span>
                        <span className="showcase-price">
                          ₹{Number(featured.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="showcase-bag-btn"
                        onClick={() => addToCart(featured)}
                      >
                        Bag It 🛒
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Showcase Pagination Dots */}
            <div className="showcase-dots">
              {products.slice(0, Math.min(products.length, 6)).map((_, i) => (
                <span
                  key={i}
                  className={`showcase-dot ${
                    i === featuredIndex ? "active" : ""
                  }`}
                  onClick={() => setFeaturedIndex(i)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Admin: Add Product Form */}
      {isAdmin && (
        <section className="add-section">
          <div className="admin-section-label">🛡️ Admin Panel</div>
          <form
            className="add-product-form"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const sizes = (fd.get("size") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              axios
                .post(API_URL, {
                  name: fd.get("name"),
                  brand: fd.get("brand"),
                  price: Number(fd.get("price")),
                  category: fd.get("category"),
                  imageUrl: fd.get("imageUrl"),
                  description: fd.get("description"),
                  size: sizes,
                  stock: Number(fd.get("stock")) || 0,
                })
                .then((res) => {
                  setProducts((prev) => [...prev, res.data]);
                  e.target.reset();
                  showToast("Product added to catalog! 🎉", "👟");
                })
                .catch(() => alert("Failed to add product."));
            }}
          >
            <h2>Add Product</h2>
            <input name="name" placeholder="Product Name" required />
            <input name="brand" placeholder="Brand" required />
            <input name="price" type="number" placeholder="Price (₹)" required />
            <input name="category" placeholder="Category (e.g. Sneakers)" />
            <input name="size" placeholder="Sizes — comma separated: 7, 8, 9, 10" />
            <input name="stock" type="number" placeholder="Stock quantity" />
            <input name="imageUrl" placeholder="Image URL" />
            <input name="description" placeholder="Short description" />
            <button type="submit">+ Add Product</button>
          </form>
        </section>
      )}

      {/* Products Catalog Toolbar */}
      <section className="products-section">

        <div className="catalog-header-wrap">
          <div className="catalog-title-box">
            <h2>Our Collection</h2>
            <span className="catalog-count-badge">
              {filteredProducts.length} authenticated {filteredProducts.length === 1 ? "kick" : "kicks"}
            </span>
          </div>

          <div className="sort-box">
            <span className="sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Hype / Featured</option>
              <option value="price-desc">Price: High to Low (Grails First)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Brand Filter Pills */}
        <div className="brand-pills-bar">
          {allBrands.map((brand) => (
            <button
              key={brand}
              type="button"
              className={`brand-pill ${selectedBrand === brand ? "active" : ""}`}
              onClick={() => {
                playSfx("click", sfxEnabled);
                setSelectedBrand(brand);
              }}
            >
              {brand === "ALL" ? "⚡ ALL DROPS" : brand}
              <span className="brand-count-chip">
                {brand === "ALL"
                  ? products.length
                  : products.filter((p) => p.brand === brand).length}
              </span>
            </button>
          ))}
        </div>

        {/* Advanced Filters Tray (Size Pills, Budget Tiers & Price Slider) */}
        <div className="filter-controls-tray">
          {/* Size Filter Row */}
          <div className="filter-tray-row size-tray-row">
            <div className="filter-tray-label-group">
              <span className="filter-label-icon">📏</span>
              <span className="filter-label-text">Filter Size:</span>
            </div>
            <div className="filter-size-chips-bar">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`size-filter-chip ${selectedSize === sz ? "active" : ""}`}
                  onClick={() => {
                    playSfx("click", sfxEnabled);
                    setSelectedSize(sz);
                  }}
                >
                  {sz === "ALL" ? "All Sizes" : `UK ${sz}`}
                  {sz !== "ALL" && (
                    <span className="chip-count">
                      {
                        products.filter(
                          (p) =>
                            Array.isArray(p.size) &&
                            p.size.some(
                              (s) => String(s).trim() === String(sz).trim()
                            )
                        ).length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tiers & Interactive Price Slider */}
          <div className="filter-tray-row price-tray-row">
            <div className="price-tiers-subgroup">
              <div className="filter-tray-label-group">
                <span className="filter-label-icon">💰</span>
                <span className="filter-label-text">Budget Tier:</span>
              </div>
              <div className="price-tier-chips">
                {[
                  { id: "ALL", label: "All Prices" },
                  { id: "under-10k", label: "Under ₹10K" },
                  { id: "10k-20k", label: "₹10K – ₹20K" },
                  { id: "20k-plus", label: "₹20K+ Grails" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    className={`price-tier-chip ${
                      selectedPriceTier === tier.id ? "active" : ""
                    }`}
                    onClick={() => {
                      playSfx("click", sfxEnabled);
                      setSelectedPriceTier(tier.id);
                    }}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="price-slider-subgroup">
              <div className="price-slider-header">
                <span className="slider-label">Max Price Limit:</span>
                <strong className="slider-value">
                  ₹{Number(maxPriceFilter).toLocaleString("en-IN")}
                </strong>
              </div>
              <input
                type="range"
                className="price-range-slider"
                min={5000}
                max={maxInventoryPrice}
                step={1000}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Active Filter Chips & Clear All Reset Button */}
          {hasActiveFilters && (
            <div className="active-filters-summary-bar">
              <div className="active-filter-chips-list">
                <span className="active-filters-title">Active:</span>
                {selectedBrand !== "ALL" && (
                  <span
                    className="active-badge"
                    onClick={() => setSelectedBrand("ALL")}
                    title="Click to clear brand filter"
                  >
                    Brand: <strong>{selectedBrand}</strong> ✕
                  </span>
                )}
                {selectedSize !== "ALL" && (
                  <span
                    className="active-badge"
                    onClick={() => setSelectedSize("ALL")}
                    title="Click to clear size filter"
                  >
                    Size: <strong>UK {selectedSize}</strong> ✕
                  </span>
                )}
                {selectedPriceTier !== "ALL" && (
                  <span
                    className="active-badge"
                    onClick={() => setSelectedPriceTier("ALL")}
                    title="Click to clear budget filter"
                  >
                    Budget:{" "}
                    <strong>
                      {selectedPriceTier === "under-10k"
                        ? "< ₹10K"
                        : selectedPriceTier === "10k-20k"
                        ? "₹10K–₹20K"
                        : "> ₹20K"}
                    </strong>{" "}
                    ✕
                  </span>
                )}
                {maxPriceFilter < maxInventoryPrice && (
                  <span
                    className="active-badge"
                    onClick={() => setMaxPriceFilter(maxInventoryPrice)}
                    title="Click to reset price slider"
                  >
                    Max:{" "}
                    <strong>
                      ₹{Number(maxPriceFilter).toLocaleString("en-IN")}
                    </strong>{" "}
                    ✕
                  </span>
                )}
                {isWishlistOnly && (
                  <span
                    className="active-badge"
                    onClick={() => setIsWishlistOnly(false)}
                    title="Click to show all products"
                  >
                    ❤️ <strong>Wishlist</strong> ✕
                  </span>
                )}
                {search.trim().length > 0 && (
                  <span
                    className="active-badge"
                    onClick={() => setSearch("")}
                    title="Click to clear search"
                  >
                    Search: <strong>"{search}"</strong> ✕
                  </span>
                )}
              </div>

              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={resetAllFilters}
              >
                ✕ Reset All Filters
              </button>
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (

          <p className="no-products">
            No kicks found. Try another search.
          </p>

        ) : (

          <div className="product-grid">

            {filteredProducts.map((product) => {

              const currentSelection =
                getSelection(product);

              const productSizes =
                Array.isArray(product.size) &&
                product.size.length > 0
                  ? product.size
                  : ["Standard"];

              return (
                <div
                  className="product-card"
                  key={product._id}
                >

                  {/* Image with overlay badges & holographic sweep */}
                  <div className="product-image-wrap">
                    <div className="card-shine-beam" />

                    {/* Wishlist Heart Toggle */}
                    <button
                      type="button"
                      className={`card-wishlist-btn ${
                        wishlist.includes(product._id) ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product._id);
                      }}
                      title={
                        wishlist.includes(product._id)
                          ? "Remove from wishlist"
                          : "Save to wishlist"
                      }
                    >
                      {wishlist.includes(product._id) ? "❤️" : "🤍"}
                    </button>

                    {product.imageUrl ? (
                      <div className="product-image-container">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="product-image"
                        />
                        <div className="pedestal-shadow" />
                      </div>
                    ) : (
                      <div className="no-image">👟</div>
                    )}

                    {product.category && (
                      <span className="category-badge">
                        {product.category}
                      </span>
                    )}

                    {product.stock > 0 && (
                      <span
                        className={`stock-badge ${
                          product.stock <= 3 ? "urgent" : ""
                        }`}
                      >
                        {product.stock <= 3
                          ? `⚡ Only ${product.stock} Left`
                          : `${product.stock} left`}
                      </span>
                    )}

                    {/* Quick Look hover button */}
                    <button
                      type="button"
                      className="card-quick-look-btn"
                      onClick={() => openQuickView(product)}
                    >
                      👁️ Quick Look
                    </button>

                  </div>

                  {/* Edit Mode */}

                  {editingId === product._id ? (

                    <div className="edit-form">

                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        placeholder="Shoe name"
                      />

                      <input
                        type="text"
                        name="brand"
                        value={editForm.brand}
                        onChange={handleEditChange}
                        placeholder="Brand"
                      />

                      <input
                        type="number"
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                        placeholder="Price"
                      />

                      <div className="edit-buttons">

                        <button
                          onClick={() =>
                            saveEdit(product._id)
                          }
                        >
                          Save
                        </button>

                        <button
                          onClick={() =>
                            setEditingId(null)
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div className="product-info">

                      <div className="product-top">
                        <h3>{product.name}</h3>
                      </div>

                      <p className="brand">{product.brand}</p>

                      {product.description && (
                        <p className="description">
                          {product.description}
                        </p>
                      )}

                      <p className="price">
                        {Number(product.price).toLocaleString("en-IN")}
                      </p>

                      {/* Size */}

                      <div className="size-section">

                        <div className="size-header">
                          <span>Size</span>
                          <strong>{currentSelection.size}</strong>
                        </div>

                        <div className="size-options">

                          {productSizes.map((size) => (

                            <button
                              key={String(size)}
                              type="button"
                              className={
                                String(currentSelection.size) === String(size)
                                  ? "size-button active"
                                  : "size-button"
                              }
                              onClick={() =>
                                handleSizeChange(product._id, size)
                              }
                            >
                              {size}
                            </button>

                          ))}

                        </div>

                      </div>

                      {/* Quantity */}

                      <div className="quantity-section">

                        <span>Quantity</span>

                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(product, -1)
                            }
                          >
                            −
                          </button>

                          <span>{currentSelection.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(product, 1)
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                      {/* Buttons */}

                      <div className={`product-buttons${isAdmin ? " admin-grid" : ""}`}>

                        <button
                          className="btn-add-to-cart"
                          onClick={() => addToCart(product)}
                        >
                          <span className="cart-btn-icon">🛒</span>
                          <span className="cart-btn-label">Add to Cart</span>
                          <span className="cart-btn-arrow">→</span>
                        </button>

                        {isAdmin && (
                          <button
                            className="btn-edit"
                            title="Edit product"
                            onClick={() => startEdit(product)}
                          >
                            ✏️
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            className="btn-delete"
                            title="Delete product"
                            onClick={() => deleteProduct(product._id)}
                          >
                            🗑️
                          </button>
                        )}

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        )}

      </section>
            {/* Cart Drawer */}

      {isCartOpen && (

        <div
          className="cart-overlay"
          onClick={() => setIsCartOpen(false)}
        >

          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="cart-header">

              <h2>Your Cart 🛒</h2>

              <button
                className="close-cart"
                onClick={() =>
                  setIsCartOpen(false)
                }
              >
                ✕
              </button>

            </div>

            {cart.length === 0 ? (

              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>Your cart is empty</h3>

                <p>
                  Time to add some fresh kicks.
                </p>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item, index) => (

                    <div
                      className="cart-item"
                      key={`${item._id}-${item.selectedSize}-${index}`}
                    >

                      {item.imageUrl ? (

                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="cart-item-image"
                        />

                      ) : (

                        <div className="cart-item-image">
                          👟
                        </div>

                      )}

                      <div className="cart-item-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.brand}
                        </span>

                        <span>
                          Size: {item.selectedSize}
                        </span>

                        <span>
                          Qty: {item.quantity}
                        </span>

                        <b>
                          ₹{Number(item.price) * item.quantity}
                        </b>

                      </div>

                      <button
                        className="remove-cart-item"
                        onClick={() =>
                          removeFromCart(index)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  ))}

                </div>

                {/* Free Shipping Dynamic Progress Tracker */}
                <div className="cart-shipping-meter">
                  <div className="cart-shipping-header">
                    <span>
                      {cartTotal >= 5000
                        ? "🎉 FREE EXPRESS INSURED DISPATCH UNLOCKED!"
                        : `Add ₹${(5000 - cartTotal).toLocaleString("en-IN")} for FREE EXPRESS COURIER 🚚`}
                    </span>
                    <span className="cart-shipping-percent">
                      {Math.min(100, Math.round((cartTotal / 5000) * 100))}%
                    </span>
                  </div>
                  <div className="cart-shipping-track">
                    <div
                      className="cart-shipping-fill"
                      style={{
                        width: `${Math.min(100, (cartTotal / 5000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="cart-summary">

                  <div className="cart-total-row">

                    <span>Total</span>

                    <strong>
                      ₹{cartTotal}
                    </strong>

                  </div>

                  <button
                    className="checkout-button"
                    onClick={openCheckout}
                  >
                    Proceed to Checkout
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-copyright">
            © 2026 <strong>Sole Market</strong>. All rights reserved.
          </p>

          <div className="footer-made-by">
            Made with love by <strong>Kartik</strong> <span className="heart-beat">❤️</span>
          </div>
        </div>

        {/* Sole Market at very last in middle */}
        <div className="footer-bottom-brand-center">
          <div className="footer-giant-brand">SOLE MARKET</div>
          <p className="footer-brand-tagline">
            AUTHENTIC SNEAKER VAULT // CURATED GRAILS & STREETWEAR
          </p>
        </div>

        {/* Hidden developer access trigger */}
        <button className="dev-trigger" onClick={() => !isAdmin && setAdminModalOpen(true)}>
          {isAdmin ? "Admin Mode Active" : "·"}
        </button>
      </footer>

      {/* Admin Login Modal — Cyber Vault Terminal */}
      {adminModalOpen && (
        <div className="admin-overlay" onClick={closeAdminModal}>
          <div
            className="admin-modal cyber-vault-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-scanner" />
            <div className="admin-modal-icon-wrap">
              <div className="admin-modal-icon-ring" />
              <div className="admin-modal-icon">🔐</div>
            </div>

            <div className="admin-terminal-tag">SYSTEM SECURITY // LEVEL 01</div>
            <h2>Developer Vault</h2>
            <p>Enter your authorization key to activate Creator Mode & product editing.</p>

            <form onSubmit={handleAdminLogin}>
              <div className="admin-input-group">
                <span className="admin-input-prefix">KEY:</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPwInput}
                  onChange={(e) => setAdminPwInput(e.target.value)}
                  placeholder="Enter security key..."
                  autoFocus
                />
                <button
                  type="button"
                  className="admin-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>

              {adminError && (
                <div className="admin-error">
                  <span>⚠️</span> {adminError}
                </div>
              )}

              <button type="submit" className="admin-login-btn">
                <span className="btn-glow-bar" />
                <span>INITIALIZE ACCESS →</span>
              </button>
            </form>

            <button
              type="button"
              className="admin-cancel-btn"
              onClick={closeAdminModal}
            >
              Abort & Return to Store
            </button>
          </div>
        </div>
      )}

      {/* Quick View Sneaker Inspection Modal with Multi-Angle Gallery */}
      {quickViewProduct && (() => {
        const gallery = getProductGallery(quickViewProduct);
        const activeItem =
          gallery[activeGalleryIdx] ||
          gallery[0] || {
            url: quickViewProduct.imageUrl,
            label: "LATERAL PROFILE",
            tag: "Main Drop View",
          };

        const handlePrevAngle = (e) => {
          e.stopPropagation();
          playSfx("click", sfxEnabled);
          setActiveGalleryIdx((prev) =>
            prev === 0 ? gallery.length - 1 : prev - 1
          );
        };

        const handleNextAngle = (e) => {
          e.stopPropagation();
          playSfx("click", sfxEnabled);
          setActiveGalleryIdx((prev) => (prev + 1) % gallery.length);
        };

        const closeQuickView = () => {
          setQuickViewProduct(null);
          setActiveGalleryIdx(0);
        };

        return (
          <div className="quickview-overlay" onClick={closeQuickView}>
            <div
              className="quickview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="quickview-close-btn"
                onClick={closeQuickView}
              >
                ✕
              </button>

              <div className="quickview-grid">
                <div className="quickview-image-box">
                  <div className="quickview-ambient-glow" />

                  {/* Multi-angle indicator badge */}
                  <div className="quickview-angle-badge">
                    <span className="angle-badge-pulse" />
                    <span>
                      0{activeGalleryIdx + 1}/0{gallery.length} // {activeItem.label}
                    </span>
                  </div>

                  {/* Prev/Next Angle Navigation Arrows */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="quickview-angle-nav-btn prev"
                        onClick={handlePrevAngle}
                        title="Previous Angle"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="quickview-angle-nav-btn next"
                        onClick={handleNextAngle}
                        title="Next Angle"
                      >
                        ›
                      </button>
                    </>
                  )}

                  <img
                    src={activeItem.url}
                    alt={`${quickViewProduct.name} - ${activeItem.label}`}
                    className="quickview-image"
                  />

                  <span className="quickview-brand-watermark">
                    {quickViewProduct.brand}
                  </span>

                  {/* 4-Angle Miniature Thumbnail Strip */}
                  <div className="quickview-gallery-strip">
                    {gallery.map((gItem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`quickview-thumb-chip ${
                          idx === activeGalleryIdx ? "active" : ""
                        }`}
                        onClick={() => {
                          playSfx("click", sfxEnabled);
                          setActiveGalleryIdx(idx);
                        }}
                        title={gItem.label}
                      >
                        <img src={gItem.url} alt={gItem.label} />
                        <span className="thumb-angle-num">0{idx + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="quickview-info-box">
                  <div className="quickview-meta-row">
                    <span className="quickview-brand-pill">
                      {quickViewProduct.brand}
                    </span>
                    <span className="quickview-category-pill">
                      {quickViewProduct.category || "Sneakers"}
                    </span>
                    <span className="quickview-stock-pill">
                      {quickViewProduct.stock > 0
                        ? `⚡ ${quickViewProduct.stock} Pairs Left`
                        : "In Stock"}
                    </span>
                  </div>

                  <h2>{quickViewProduct.name}</h2>

                  <p className="quickview-desc">
                    {quickViewProduct.description ||
                      "100% verified authentic collector drop. Features premium craftsmanship, breathable upper, and signature cushioning."}
                  </p>

                  <div className="quickview-price-tag">
                    <span className="quickview-price-currency">₹</span>
                    <span className="quickview-price-value">
                      {Number(quickViewProduct.price).toLocaleString("en-IN")}
                    </span>
                    <span className="quickview-mrp-tag">Free Insured Courier Included</span>
                  </div>

                  {/* Size Selector in Quickview */}
                  <div className="quickview-size-block">
                    <div className="quickview-size-header">
                      <span>SELECT SIZE (UK/IND)</span>
                      <strong>{getSelection(quickViewProduct).size}</strong>
                    </div>
                    <div className="quickview-sizes">
                      {(Array.isArray(quickViewProduct.size) &&
                      quickViewProduct.size.length > 0
                        ? quickViewProduct.size
                        : ["Standard"]
                      ).map((sz) => (
                        <button
                          key={String(sz)}
                          type="button"
                          className={`size-button ${
                            String(getSelection(quickViewProduct).size) ===
                            String(sz)
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            handleSizeChange(quickViewProduct._id, sz)
                          }
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="quickview-actions">
                    <button
                      type="button"
                      className="quickview-add-cart-btn"
                      onClick={() => {
                        addToCart(quickViewProduct);
                        closeQuickView();
                      }}
                    >
                      🛒 Add to Vault Cart • ₹{Number(quickViewProduct.price).toLocaleString("en-IN")}
                    </button>

                    <button
                      type="button"
                      className={`quickview-wishlist-btn ${
                        wishlist.includes(quickViewProduct._id) ? "active" : ""
                      }`}
                      onClick={() => toggleWishlist(quickViewProduct._id)}
                    >
                      {wishlist.includes(quickViewProduct._id)
                        ? "❤️ In Wishlist"
                        : "🤍 Save to Wishlist"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Dynamic Toast Notification */}
      {toast.visible && (
        <div className="floating-toast">
          <span className="toast-icon">{toast.icon}</span>
          <span className="toast-text">{toast.text}</span>
          <button
            type="button"
            className="toast-cart-btn"
            onClick={() => {
              setIsCartOpen(true);
              setToast((prev) => ({ ...prev, visible: false }));
            }}
          >
            Open Cart →
          </button>
        </div>
      )}

      {/* Live Community Drop Activity Ticker */}
      <div className="live-social-proof-pill">
        <span className="social-proof-beacon" />
        <span className="social-proof-text">
          <strong>{liveActivities[liveActivityIndex].name}</strong> ({liveActivities[liveActivityIndex].city}) {liveActivities[liveActivityIndex].action}{" "}
          <span className="social-proof-shoe">
            {liveActivities[liveActivityIndex].shoe}
          </span>{" "}
          ⚡
        </span>
      </div>

    </div>
  );
}

export default App;