import UserModal from "app/DBconfig/models/user";
import { connectMongoDB } from "app/DBconfig/mongoDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import ProductModal from "app/DBconfig/models/product";
import { uploadStream } from "helper/uploadImgCloudinary";
import { revalidatePath } from "next/cache"; // 1. Import revalidatePath

export async function POST(request) {
  try {
    // 1- Receive data from Front-end
    const objFromFrontEnd = await request.formData();
    const productImg = objFromFrontEnd.get("productImg");

    if (!productImg) {
      return NextResponse.json(
        { message: "Product image is required" },
        { status: 400 }
      );
    }

    // 2- Convert img into buffer & upload img to cloudinary
    const bytes = await productImg.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadedImg = await uploadStream(buffer);

    // Use secure_url (https) for Cloudinary
    const imgURL = uploadedImg.secure_url || uploadedImg.url;
    const publicId = uploadedImg.public_id;

    // 3- Connect to DB
    await connectMongoDB();

    // 4- Store obj to DB
    await ProductModal.create({
      productImg: imgURL,
      title: objFromFrontEnd.get("title"),
      price: objFromFrontEnd.get("price"),
      description: objFromFrontEnd.get("description"),
      imgPublicId: publicId,
    });

    // 5- Revalidate home page cache so new product shows up immediately
    revalidatePath("/");

    return NextResponse.json({ message: "product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { message: "Failed to add product" },
      { status: 500 }
    );
  }
}
