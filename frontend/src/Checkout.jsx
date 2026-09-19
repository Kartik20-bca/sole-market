import { useState } from "react";

function Checkout({ cart, cartTotal, onBack, onOrderPlaced }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "Cash on Delivery",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setOrderPlaced(true);

    if (onOrderPlaced) {
      onOrderPlaced();
    }
  };

  if (orderPlaced) {
    return (
      <section className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✓</div>

          <h1>Order Confirmed 🎉</h1>

          <p>
            Your kicks are officially on their way.
          </p>

          <p className="success-small">
            Thanks for shopping with Sole Market.
          </p>

          <button
            className="back-shopping-button"
            onClick={onBack}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Cart
          </button>

          <h1>Checkout 🛍️</h1>

          <p>
            Almost there. Let's get those kicks to you.
          </p>
        </div>

        <div className="checkout-layout">

          {/* Customer Details */}
          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >
            <h2>Delivery Details</h2>

            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />
            </label>

            <label>
              Delivery Address
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House no., street, area..."
                rows="4"
                required
              />
            </label>

            <div className="checkout-row">

              <label>
                City
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </label>

              <label>
                PIN Code
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  required
                />
              </label>

            </div>

            <h2 className="payment-heading">
              Payment Method
            </h2>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="Cash on Delivery"
                checked={
                  formData.payment === "Cash on Delivery"
                }
                onChange={handleChange}
              />

              <span>
                💵 Cash on Delivery
              </span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={formData.payment === "UPI"}
                onChange={handleChange}
              />

              <span>
                📱 UPI
              </span>
            </label>

            <button
              type="submit"
              className="place-order-button"
            >
              Place Order • ₹{cartTotal}
            </button>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Your Kicks</h2>

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
                    <div className="checkout-no-image">
                      👟
                    </div>
                  )}

                  <div className="checkout-item-info">
                    <strong>{item.name}</strong>

                    <span>
                      {item.brand}
                    </span>

                    <span>
                      Size: {item.selectedSize}
                    </span>

                    <span>
                      Qty: {item.quantity}
                    </span>
                  </div>

                  <strong>
                    ₹{Number(item.price) * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>Total</span>

              <strong>
                ₹{cartTotal}
              </strong>
            </div>

            <p className="secure-message">
              🔒 Your order details are securely handled.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Checkout;