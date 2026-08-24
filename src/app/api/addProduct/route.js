import { connectMongoDB } from "app/DBconfig/mongoDB";
import ProductModal from "app/DBconfig/models/product";
import { uploadStream } from "helper/uploadImgCloudinary";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const objFromFrontEnd = await request.formData();
    const productImg = objFromFrontEnd.get("productImg");
    const title = objFromFrontEnd.get("title");
    const price = objFromFrontEnd.get("price");
    const description = objFromFrontEnd.get("description");

    if (!productImg || typeof productImg === "string") {
      return NextResponse.json(
        { message: "Valid image file is required" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await productImg.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadedImg = await uploadStream(buffer);
    const imgURL = uploadedImg.secure_url || uploadedImg.url;
    const publicId = uploadedImg.public_id;

    // Connect & Save
    await connectMongoDB();
    await ProductModal.create({
      productImg: imgURL,
      title,
      price: Number(price),
      description,
      imgPublicId: publicId,
    });

    revalidatePath("/");

    return NextResponse.json(
      { message: "Product added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("SERVER ADD PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to add product" },
      { status: 500 }
    );
  }
}
