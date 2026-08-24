import Footer from "components/footer/footer";
import Header from "components/header/header";
import "./product-details.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { notFound } from "next/navigation";
import Image from "next/image.js";
import AdminBtn from "./adminBtn";

// 1. Import your DB connector & Model directly
import connectDB from "DBconfig/models/mongoDB"; // Verify this exact path from your project structure
import Product from "DBconfig/models/product";

async function getProductData(id) {
  try {
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return null;
    }

    // Convert MongoDB _id Object to string to prevent serialization issues
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const objData = await getProductData(params.id);
  if (!objData) return { title: "Product Not Found" };

  return {
    title: objData.title,
    description: objData.description,
  };
}

const Page = async ({ params }) => {
  const objData = await getProductData(params.id);

  if (!objData) {
    notFound();
  }

  return (
    <div
      className="product-details"
      style={{
        height: "100vh",
        display: "grid",
        alignItems: "center",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <Header />

      <div>
        <main style={{ textAlign: "center" }} className="flex">
          <Image
            width={266}
            height={270}
            quality={100}
            alt={objData.title || "Product Image"}
            src={objData.productImg}
          />
          <div className="product-details">
            <div style={{ justifyContent: "space-between" }} className="flex">
              <h2>{objData.title}</h2>
              <p className="price">${objData.price}</p>
            </div>
            <p className="description">{objData.description}</p>
            <button className="flex add-to-cart">
              <FontAwesomeIcon style={{ width: "1.1rem" }} icon={faCartPlus} />
              Add To Cart
            </button>
          </div>
        </main>
        <AdminBtn productId={params.id} imgPublicId={objData.imgPublicId} />
      </div>
      <Footer />
    </div>
  );
};

export default Page;
