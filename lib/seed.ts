import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { mockCategories, mockStores, mockProducts } from "./seed-data";

export async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Seed Categories
    for (const category of mockCategories) {
      await setDoc(doc(db, "categories", category.id), category);
    }
    console.log("Categories seeded!");

    // Seed Stores
    for (const store of mockStores) {
      await setDoc(doc(db, "stores", store.id), store);
    }
    console.log("Stores seeded!");

    // Seed Products
    for (const product of mockProducts) {
      await setDoc(doc(db, "products", product.id), product);
    }
    console.log("Products seeded!");

    return { success: true, message: "Database successfully seeded!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, message: "Failed to seed database.", error };
  }
}
