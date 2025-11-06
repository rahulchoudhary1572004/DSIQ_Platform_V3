// components/DAM/dam.data.tsx - FIXED with all exports
import { Product, DigitalAsset, Collection } from "../../types/dam.types";

// Products Array
export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    sku: "WHP-001",
    category: "Electronics",
    status: "Active",
    assetCount: 12,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Smart Watch Series X",
    sku: "SWX-002",
    category: "Wearables",
    status: "Active",
    assetCount: 8,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Bluetooth Speaker Mini",
    sku: "BSM-003",
    category: "Audio",
    status: "Draft",
    assetCount: 5,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 4,
    name: "Gaming Keyboard RGB",
    sku: "GKR-004",
    category: "Gaming",
    status: "Active",
    assetCount: 15,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 5,
    name: "Wireless Mouse Pro",
    sku: "WMP-005",
    category: "Accessories",
    status: "Active",
    assetCount: 7,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
];

// Digital Assets
export const digitalAssets: Record<number, DigitalAsset[]> = {
  1: [
    {
      id: 101,
      name: "headphones-product-demo.mp4",
      type: "video",
      size: "15.2 MB",
      sizeInBytes: 15955025,
      duration: "0:45",
      format: "MP4",
      uploadDate: "2024-01-14",
      uploadedBy: "Jane Smith",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    },
    {
      id: 102,
      name: "headphones-hero-image.jpg",
      type: "image",
      size: "2.4 MB",
      sizeInBytes: 2516582,
      dimensions: "1920x1080",
      format: "JPEG",
      uploadDate: "2024-01-15",
      uploadedBy: "John Doe",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop",
    },
    {
      id: 103,
      name: "headphones-specifications.pdf",
      type: "document",
      size: "1.1 MB",
      sizeInBytes: 1153434,
      pages: 4,
      format: "PDF",
      uploadDate: "2024-01-13",
      uploadedBy: "Mike Johnson",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: null,
    },
    {
      id: 104,
      name: "headphones-lifestyle-1.jpg",
      type: "image",
      size: "3.1 MB",
      sizeInBytes: 3250872,
      dimensions: "2048x1536",
      format: "JPEG",
      uploadDate: "2024-01-12",
      uploadedBy: "Sarah Wilson",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop",
    },
    {
      id: 105,
      name: "headphones-unboxing.jpg",
      type: "image",
      size: "2.8 MB",
      sizeInBytes: 2936012,
      dimensions: "1800x1200",
      format: "JPEG",
      uploadDate: "2024-01-11",
      uploadedBy: "Tom Brown",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=300&fit=crop",
    },
    {
      id: 106,
      name: "headphones-360-view.zip",
      type: "archive",
      size: "45.6 MB",
      sizeInBytes: 47823028,
      files: 36,
      format: "ZIP",
      uploadDate: "2024-01-10",
      uploadedBy: "Alex Davis",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: null,
    },
  ],
  2: [
    {
      id: 201,
      name: "smartwatch-hero.jpg",
      type: "image",
      size: "2.1 MB",
      sizeInBytes: 2202009,
      dimensions: "1920x1080",
      format: "JPEG",
      uploadDate: "2024-01-20",
      uploadedBy: "Lisa Chen",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    },
    {
      id: 202,
      name: "smartwatch-features.mp4",
      type: "video",
      size: "22.5 MB",
      sizeInBytes: 23592959,
      duration: "1:30",
      format: "MP4",
      uploadDate: "2024-01-19",
      uploadedBy: "David Kim",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=300&fit=crop",
    },
  ],
  3: [
    {
      id: 301,
      name: "speaker-product.jpg",
      type: "image",
      size: "1.9 MB",
      sizeInBytes: 1990656,
      dimensions: "1920x1080",
      format: "JPEG",
      uploadDate: "2024-01-25",
      uploadedBy: "Emma Wilson",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1589003077984-894e133814c9?w=400&h=300&fit=crop",
    },
    {
      id: 302,
      name: "speaker-demo.mp4",
      type: "video",
      size: "18.3 MB",
      sizeInBytes: 19189227,
      duration: "1:15",
      format: "MP4",
      uploadDate: "2024-01-24",
      uploadedBy: "Chris Lee",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    },
    {
      id: 303,
      name: "speaker-specs.pdf",
      type: "document",
      size: "0.8 MB",
      sizeInBytes: 838860,
      pages: 2,
      format: "PDF",
      uploadDate: "2024-01-23",
      uploadedBy: "Rachel Green",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: null,
    },
    {
      id: 304,
      name: "speaker-sound-test.mp4",
      type: "video",
      size: "25.7 MB",
      sizeInBytes: 26957824,
      duration: "2:45",
      format: "MP4",
      uploadDate: "2024-01-22",
      uploadedBy: "Mark Brown",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
    },
    {
      id: 305,
      name: "speaker-packaging.jpg",
      type: "image",
      size: "2.3 MB",
      sizeInBytes: 2411724,
      dimensions: "1800x1200",
      format: "JPEG",
      uploadDate: "2024-01-21",
      uploadedBy: "Nina Patel",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=300&fit=crop",
    },
  ],
  4: [
    {
      id: 401,
      name: "keyboard-hero.jpg",
      type: "image",
      size: "3.4 MB",
      sizeInBytes: 3565158,
      dimensions: "2560x1440",
      format: "JPEG",
      uploadDate: "2024-01-28",
      uploadedBy: "Kevin Wu",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1587829191301-41f1b0bcc057?w=400&h=300&fit=crop",
    },
    {
      id: 402,
      name: "keyboard-features.mp4",
      type: "video",
      size: "31.2 MB",
      sizeInBytes: 32726425,
      duration: "2:30",
      format: "MP4",
      uploadDate: "2024-01-27",
      uploadedBy: "Sophie Turner",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1587829191351-b8528f96c2a3?w=400&h=300&fit=crop",
    },
  ],
  5: [
    {
      id: 501,
      name: "mouse-product.jpg",
      type: "image",
      size: "1.7 MB",
      sizeInBytes: 1782579,
      dimensions: "1920x1080",
      format: "JPEG",
      uploadDate: "2024-02-01",
      uploadedBy: "Oliver Hayes",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
    },
    {
      id: 502,
      name: "mouse-demo.mp4",
      type: "video",
      size: "16.8 MB",
      sizeInBytes: 17612389,
      duration: "1:00",
      format: "MP4",
      uploadDate: "2024-01-31",
      uploadedBy: "Julia Mitchell",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
    },
  ],
};


// Product Categories (if needed)
interface ProductCategory {
  id: number;
  name: string;
  products: Product[];
}

export const productCategories: ProductCategory[] = [
  {
    id: 1,
    name: "Electronics",
    products: products.filter((p) => p.category === "Electronics"),
  },
  {
    id: 2,
    name: "Wearables",
    products: products.filter((p) => p.category === "Wearables"),
  },
  {
    id: 3,
    name: "Audio",
    products: products.filter((p) => p.category === "Audio"),
  },
  {
    id: 4,
    name: "Gaming",
    products: products.filter((p) => p.category === "Gaming"),
  },
  {
    id: 5,
    name: "Accessories",
    products: products.filter((p) => p.category === "Accessories"),
  },
];
