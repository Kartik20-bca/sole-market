import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/products`
  : (import.meta.env.PROD ? "/api/products" : "http://localhost:5001/api/products");

function AddProduct({ onProductAdded }) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    category: "",
    imageUrl: "",
    description: "",
    size: "",
    stock: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const sizes = form.size
      .split(",")
      .map((size) => size.trim())
      .filter((size) => size !== "");

    axios
      .post(API_URL, {
        name: form.name,
        brand: form.brand,
        price: Number(form.price),
        category: form.category,
        imageUrl: form.imageUrl,
        description: form.description,
        size: sizes,
        stock: Number(form.stock) || 0,
      })
      .then((res) => {
        onProductAdded(res.data);

        setForm({
          name: "",
          brand: "",
          price: "",
          category: "",
          imageUrl: "",
          description: "",
          size: "",
          stock: "",
        });
      })
      .catch((err) => {
        console.log("Error adding product:", err);
      });
  };

  return (
    <form className="add-product-form" onSubmit={handleSubmit}>
      <h2>Add Product</h2>

      <input
        name="name"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        name="brand"
        placeholder="Brand"
        value={form.brand}
        onChange={handleChange}
        required
      />

      <input
        name="price"
        placeholder="Price"
        type="number"
        value={form.price}
        onChange={handleChange}
        required
      />

      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
      />

      <input
        name="size"
        placeholder="Sizes e.g. 7, 8, 9, 10, 11"
        value={form.size}
        onChange={handleChange}
      />

      <input
        name="stock"
        placeholder="Stock"
        type="number"
        value={form.stock}
        onChange={handleChange}
      />

      <input
        name="imageUrl"
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={handleChange}
      />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <button type="submit">Add Product</button>
    </form>
  );
}

export default AddProduct;