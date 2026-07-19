import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  increment
} from "firebase/firestore";
import { 
  Store, 
  Product, 
  Category, 
  Donor, 
  Donation, 
  Volunteer, 
  Project, 
  Order,
  UserProfile
} from "./types";

// --- STORES ---

export async function getStores(): Promise<Store[]> {
  const storesCol = collection(db, "stores");
  const storeSnapshot = await getDocs(storesCol);
  return storeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
}

export async function getStoreById(id: string): Promise<Store | null> {
  const storeRef = doc(db, "stores", id);
  const storeSnap = await getDoc(storeRef);
  if (storeSnap.exists()) {
    return { id: storeSnap.id, ...storeSnap.data() } as Store;
  }
  return null;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const storesCol = collection(db, "stores");
  const q = query(storesCol, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Store;
  }
  return null;
}

export async function getStoresByOwner(ownerId: string): Promise<Store[]> {
  const storesCol = collection(db, "stores");
  const q = query(storesCol, where("ownerId", "==", ownerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
}

export async function addStore(storeData: Omit<Store, "id">): Promise<string> {
  const storesCol = collection(db, "stores");
  const docRef = await addDoc(storesCol, storeData);
  return docRef.id;
}

export async function updateStore(id: string, storeData: Partial<Store>): Promise<void> {
  const storeRef = doc(db, "stores", id);
  await updateDoc(storeRef, storeData);
}

export async function deleteStore(id: string): Promise<void> {
  const storeRef = doc(db, "stores", id);
  await deleteDoc(storeRef);
}

// --- PRODUCTS ---

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const productRef = doc(db, "products", id);
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() } as Product;
  }
  return null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const productsCol = collection(db, "products");
  const q = query(productsCol, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const q = query(productsCol, where("storeId", "==", storeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function addProduct(productData: Omit<Product, "id">): Promise<string> {
  const productsCol = collection(db, "products");
  const docRef = await addDoc(productsCol, productData);
  return docRef.id;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const productRef = doc(db, "products", id);
  await updateDoc(productRef, productData);
}

export async function deleteProduct(id: string): Promise<void> {
  const productRef = doc(db, "products", id);
  await deleteDoc(productRef);
}

// --- CATEGORIES ---

export async function getCategories(): Promise<Category[]> {
  const categoriesCol = collection(db, "categories");
  const categorySnapshot = await getDocs(categoriesCol);
  
  if (categorySnapshot.empty) {
    // Seed default categories if none exist
    const defaultCategories = [
      { name: "Handicrafts", slug: "handicrafts" },
      { name: "Textiles", slug: "textiles" },
      { name: "Toys", slug: "toys" },
      { name: "Jewelry", slug: "jewelry" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Art", slug: "art" },
      { name: "Apparel", slug: "apparel" },
    ];
    
    const createdCategories: Category[] = [];
    
    for (const cat of defaultCategories) {
      const docRef = await addDoc(categoriesCol, cat);
      createdCategories.push({ id: docRef.id, ...cat } as Category);
    }
    
    return createdCategories;
  }
  
  return categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

// --- DONATIONS ---

export async function addDonation(donationData: Omit<Donation, "id">, donorData: Omit<Donor, "id" | "createdAt" | "updatedAt" | "totalDonated">): Promise<string> {
  // Check if donor exists by email
  const donorsCol = collection(db, "donors");
  const q = query(donorsCol, where("email", "==", donorData.email));
  const querySnapshot = await getDocs(q);
  
  let donorId = "";
  if (!querySnapshot.empty) {
    donorId = querySnapshot.docs[0].id;
    // Update existing donor total
    const donorDoc = querySnapshot.docs[0].data() as Donor;
    await updateDoc(doc(db, "donors", donorId), {
      totalDonated: donorDoc.totalDonated + donationData.amount,
      updatedAt: new Date().toISOString()
    });
  } else {
    // Create new donor
    const newDonorRef = await addDoc(donorsCol, {
      ...donorData,
      totalDonated: donationData.amount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    donorId = newDonorRef.id;
  }

  // Create donation
  const donationsCol = collection(db, "donations");
  const donationRef = await addDoc(donationsCol, {
    ...donationData,
    donorId,
    createdAt: new Date().toISOString()
  });

  return donationRef.id;
}

export async function getDonations(): Promise<Donation[]> {
  const donationsCol = collection(db, "donations");
  const snapshot = await getDocs(donationsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
}

export async function getDonors(): Promise<Donor[]> {
  const donorsCol = collection(db, "donors");
  const snapshot = await getDocs(donorsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
}

// --- VOLUNTEERS ---

export async function addVolunteer(volunteerData: Omit<Volunteer, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const volunteersCol = collection(db, "volunteers");
  const docRef = await addDoc(volunteersCol, {
    ...volunteerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function getVolunteers(): Promise<Volunteer[]> {
  const volunteersCol = collection(db, "volunteers");
  const snapshot = await getDocs(volunteersCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
}

export async function updateVolunteerStatus(id: string, status: Volunteer['status']): Promise<void> {
  const ref = doc(db, "volunteers", id);
  await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
}

// --- PROJECTS ---

export async function getProjects(): Promise<Project[]> {
  const projectsCol = collection(db, "projects");
  const snapshot = await getDocs(projectsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projectsCol = collection(db, "projects");
  const q = query(projectsCol, where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
}

export async function addProject(projectData: Omit<Project, "id">): Promise<string> {
  const projectsCol = collection(db, "projects");
  const docRef = await addDoc(projectsCol, projectData);
  return docRef.id;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<void> {
  const projectRef = doc(db, "projects", id);
  await updateDoc(projectRef, projectData);
}

export async function deleteProject(id: string): Promise<void> {
  const projectRef = doc(db, "projects", id);
  await deleteDoc(projectRef);
}

// --- ORDERS ---

export async function addOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<string> {
  const ordersCol = collection(db, "orders");
  const docRef = await addDoc(ordersCol, {
    ...orderData,
    createdAt: new Date().toISOString()
  });

  // Decrease inventory for each product in the order
  for (const item of orderData.items) {
    if (item.productId) {
      try {
        const productRef = doc(db, "products", item.productId);
        await updateDoc(productRef, {
          inventory: increment(-item.quantity)
        });
      } catch (err) {
        console.error(`Failed to update inventory for product ${item.productId}`, err);
      }
    }
  }

  return docRef.id;
}

export async function getOrders(): Promise<Order[]> {
  const ordersCol = collection(db, "orders");
  const snapshot = await getDocs(ordersCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, { status });
}

// --- USERS ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile;
  }
  return null;
}

export async function createUserProfile(userId: string, profileData: Omit<UserProfile, "id" | "createdAt">): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    ...profileData,
    createdAt: new Date().toISOString()
  });
}
