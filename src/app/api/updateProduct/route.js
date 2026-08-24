import ProductModal from "app/DBconfig/models/product";
import { connectMongoDB } from "app/DBconfig/mongoDB";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache"; // 1. Import revalidatePath

export async function PUT(request) {
  const objFromFrontEnd = await request.json();

  await connectMongoDB();

  await ProductModal.updateOne(
    { _id: objFromFrontEnd.productId },
    {
      title: objFromFrontEnd.title,
      price: objFromFrontEnd.price,
      description: objFromFrontEnd.description,
    }
  );

  // 2. Revalidate home page and product details cache
  revalidatePath("/");
  revalidatePath(`/product-details/${objFromFrontEnd.productId}`);

  return NextResponse.json({ message: "Product updated successfully" });
}
