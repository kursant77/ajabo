export type Category = string;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: Category;
}

export const categories: { id: Category; label: string }[] = [
  { id: "kofe", label: "Kofe" },
  { id: "choy", label: "Choy" },
  { id: "shirinliklar", label: "Shirinliklar" },
  { id: "ovqatlar", label: "Ovqatlar" },
];

// Deprecated: used for types mostly now
// export const menuItems... // removed to ensure dynamic sources
