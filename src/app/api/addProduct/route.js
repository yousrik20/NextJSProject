import { connectMongoDB } from "app/DBconfig/mongoDB";
import ProductModal from "app/DBconfig/models/product";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary explicitly inside the route
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Helper function to handle Buffer stream upload via Promise
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const productImg = formData.get("productImg");
    const title = formData.get("title");
    const price = formData.get("price");
    const description = formData.get("description");

    if (!productImg || typeof productImg === "string") {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    // 1. Convert uploaded file to Buffer
    const bytes = await productImg.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Upload to Cloudinary using Promise
    const uploadedImg = await uploadToCloudinary(buffer);

    // 3. Connect DB & Store Product
    await connectMongoDB();
    await ProductModal.create({
      productImg: uploadedImg.secure_url,
      title,
      price: Number(price),
      description,
      imgPublicId: uploadedImg.public_id,
    });

    // 4. Clear Cache for home page
    revalidatePath("/");

    return NextResponse.json(
      { message: "Product added successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD_PRODUCT_SERVER_ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to upload image or save product" },
      { status: 500 }
    );
  }
}
