"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const ProductForm = () => {
  const router = useRouter(); // Initialize router

  const [img, setImg] = useState(null);
  const [title, setTitle] = useState(null);
  const [price, setPrice] = useState(null);
  const [description, setDescription] = useState(null);

  const [isLoading, setisLoading] = useState(false);
  const [error, seterror] = useState(null);

  const handleSubmit = async (eo) => {
    eo.preventDefault();
    setisLoading(true);
    seterror(null);

    if (!img || !title || !price || !description) {
      seterror("All inputs including image must be filled");
      setisLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("productImg", img);
    formData.set("title", title);
    formData.set("price", price);
    formData.set("description", description);

    try {
      // 🟢 Fix 1: Added leading slash to API route path
      const resAddProduct = await fetch("/api/addProduct", {
        method: "POST",
        body: formData,
      });

      const data = await resAddProduct.json();

      if (resAddProduct.ok) {
        eo.target.reset();
        toast.success(data.message || "Product added successfully!");
        
        // 🟢 Fix 2: Redirect and refresh server data
        router.push("/");
        router.refresh();
      } else {
        setisLoading(false);
        seterror(data.message || "Failed to add Product, Please try again");
      }
    } catch (err) {
      console.error(err);
      seterror("An unexpected error occurred. Please try again.");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
      <div className="mb-4">
        <label htmlFor="username" className="form-label">
          Product Image :
        </label>
        <input
          onChange={(eo) => {
            setImg(eo.target.files[0]);
          }}
          required
          type="file"
          className="form-control"
          id="username"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="exampleInputEmail1" className="form-label">
          Product Title:
        </label>
        <input
          required
          onChange={(eo) => {
            setTitle(eo.target.value);
          }}
          type="text"
          className="form-control"
          id="exampleInputEmail1"
          placeholder="T-shirt"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="exampleInputPassword1" className="form-label">
          Product Price:
        </label>
        <input
          step={0.01}
          placeholder="$99.99"
          required
          onChange={(eo) => {
            setPrice(eo.target.value);
          }}
          type="number"
          className="form-control"
          id="exampleInputPassword1"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="exampleInputDescription" className="form-label">
          Product Description:
        </label>
        <textarea
          placeholder="Product Description....."
          required
          onChange={(eo) => {
            setDescription(eo.target.value);
          }}
          rows={3}
          className="form-control"
          id="exampleInputDescription"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? (
          <div
            style={{ width: "1.5rem", height: "1.5rem" }}
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Add Product"
        )}
      </button>

      {error && (
        <p style={{ color: "#ff7790", fontSize: "1.1rem", marginTop: "1rem" }}>
          {error}
        </p>
      )}
    </form>
  );
};

export default ProductForm;
