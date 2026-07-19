export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  ownerId: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  rating: number;
  location: string;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory: number;
  images: string[];
  featured: boolean;
}

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Heritage Crafts', slug: 'heritage-crafts' },
  { id: 'c2', name: 'Local Textiles', slug: 'local-textiles' },
  { id: 'c3', name: 'Pottery & Ceramics', slug: 'pottery-ceramics' },
  { id: 'c4', name: 'Foundation Merch', slug: 'foundation-merch' }
];

export const mockStores: Store[] = [
  {
    id: 's1',
    name: 'Mitss Store',
    slug: 'mitss-store',
    description: 'Authentic handcrafted goods and heritage items directly from master artisans in Rajasthan.',
    logo: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1605814588851-2470fcf14a1d?w=1600&h=400&fit=crop',
    ownerId: 'u1',
    status: 'ACTIVE',
    rating: 4.8,
    location: 'Jodhpur, Rajasthan'
  },
  {
    id: 's2',
    name: 'Rathi Saree',
    slug: 'rathi-saree',
    description: 'Generations of traditional textile weaving, specializing in Leheriya and Bandhani sarees.',
    logo: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1583391733959-b158b20e1818?w=1600&h=400&fit=crop',
    ownerId: 'u2',
    status: 'ACTIVE',
    rating: 4.9,
    location: 'Jaipur, Rajasthan'
  },
  {
    id: 's3',
    name: 'Blue Pottery Jaipur',
    slug: 'blue-pottery-jaipur',
    description: 'Reviving the ancient art of blue pottery with sustainable practices and classic motifs.',
    logo: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1578500494198-246f612b3b6d?w=1600&h=400&fit=crop',
    ownerId: 'u3',
    status: 'ACTIVE',
    rating: 4.7,
    location: 'Jaipur, Rajasthan'
  },
  {
    id: 's4',
    name: 'Foundation Merchandise',
    slug: 'foundation-merchandise',
    description: 'Official apparel and goods supporting the Stepwell Renovation Foundation initiatives.',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=400&fit=crop',
    ownerId: 'u4',
    status: 'ACTIVE',
    rating: 5.0,
    location: 'Global'
  }
];

export const mockProducts: Product[] = [
  // Mitss Store
  {
    id: 'p1', storeId: 's1', categoryId: 'c1',
    name: 'Carved Wooden Elephant', slug: 'carved-wooden-elephant',
    description: 'A beautifully intricate hand-carved wooden elephant featuring traditional Rajasthani motifs. Crafted from sustainably sourced Kadam wood.',
    price: 3400, inventory: 15,
    images: ['https://images.unsplash.com/photo-1582560469796-0c91dc93c727?w=800&q=80', 'https://images.unsplash.com/photo-1605814588851-2470fcf14a1d?w=800&q=80'],
    featured: true
  },
  {
    id: 'p2', storeId: 's1', categoryId: 'c1',
    name: 'Camel Bone Inlay Box', slug: 'camel-bone-inlay-box',
    description: 'An exquisite jewelry box featuring detailed camel bone inlay work in floral patterns on a dark wooden base.',
    price: 8500, inventory: 5,
    images: ['https://images.unsplash.com/photo-1582560469796-0c91dc93c727?w=800&q=80'],
    featured: false
  },
  {
    id: 'p3', storeId: 's1', categoryId: 'c1',
    name: 'Hand-painted Miniature Artwork', slug: 'miniature-artwork',
    description: 'A traditional miniature painting depicting historical royal courts, painted using natural stone colors on vintage paper.',
    price: 12000, inventory: 2,
    images: ['https://images.unsplash.com/photo-1582560469796-0c91dc93c727?w=800&q=80'],
    featured: true
  },

  // Rathi Saree
  {
    id: 'p4', storeId: 's2', categoryId: 'c2',
    name: 'Royal Blue Bandhani Saree', slug: 'royal-blue-bandhani',
    description: 'Authentic tie-dye Bandhani saree in deep royal blue with intricate white dot patterns and gold zari border.',
    price: 6500, inventory: 20,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d61dc0?w=800&q=80'],
    featured: true
  },
  {
    id: 'p5', storeId: 's2', categoryId: 'c2',
    name: 'Leheriya Chiffon Dupatta', slug: 'leheriya-dupatta',
    description: 'Lightweight pure chiffon dupatta featuring the traditional wave-like Leheriya dye pattern in vibrant pink and orange.',
    price: 1800, inventory: 40,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'],
    featured: false
  },
  {
    id: 'p6', storeId: 's2', categoryId: 'c2',
    name: 'Hand-block Print Kurta Set', slug: 'block-print-kurta',
    description: 'Comfortable cotton kurta set featuring traditional Sanganeri hand-block printing techniques in indigo dyes.',
    price: 3200, inventory: 15,
    images: ['https://images.unsplash.com/photo-1583391733959-b158b20e1818?w=800&q=80'],
    featured: false
  },

  // Blue Pottery
  {
    id: 'p7', storeId: 's3', categoryId: 'c3',
    name: 'Classic Blue Pottery Vase', slug: 'blue-pottery-vase',
    description: 'A stunning 12-inch vase adorned with traditional floral motifs. Made from quartz stone powder, powdered glass, and Multani Mitti.',
    price: 4500, inventory: 12,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'],
    featured: true
  },
  {
    id: 'p8', storeId: 's3', categoryId: 'c3',
    name: 'Decorative Wall Plate', slug: 'decorative-wall-plate',
    description: 'Hand-painted 10-inch decorative wall plate featuring vibrant blue and yellow geometric and floral patterns.',
    price: 2100, inventory: 30,
    images: ['https://images.unsplash.com/photo-1578500494198-246f612b3b6d?w=800&q=80'],
    featured: true
  },
  {
    id: 'p9', storeId: 's3', categoryId: 'c3',
    name: 'Ceramic Coaster Set', slug: 'ceramic-coaster-set',
    description: 'Set of 6 blue pottery coasters with cork backing to protect your surfaces while adding a touch of heritage.',
    price: 1200, inventory: 50,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'],
    featured: false
  },

  // Foundation Merch
  {
    id: 'p10', storeId: 's4', categoryId: 'c4',
    name: 'Conservation Supporter Tee', slug: 'supporter-tee',
    description: 'Premium organic cotton t-shirt featuring the Stepwell Renovation Foundation logo. 100% of profits go directly to our active sites.',
    price: 1500, inventory: 100,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    featured: true
  },
  {
    id: 'p11', storeId: 's4', categoryId: 'c4',
    name: 'Heritage Canvas Tote', slug: 'heritage-tote',
    description: 'Heavy-duty canvas tote bag printed with architectural blueprints of famous Jodhpur stepwells. Perfect for everyday use.',
    price: 800, inventory: 200,
    images: ['https://images.unsplash.com/photo-1597404294360-feeeda04612e?w=800&q=80'],
    featured: true
  },
  {
    id: 'p12', storeId: 's4', categoryId: 'c4',
    name: 'Stepwell Coffee Table Book', slug: 'coffee-table-book',
    description: 'A beautiful 200-page hardcover book documenting the history, decline, and revival of Rajasthans water architecture with stunning photography.',
    price: 5500, inventory: 25,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80'],
    featured: false
  }
];
