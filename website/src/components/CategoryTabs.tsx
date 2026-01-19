import { categories, type Category } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-center gap-2 overflow-x-auto py-4 md:gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 md:px-6 md:py-3 md:text-base",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-cafe"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category.label}
              {activeCategory === category.id && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </nav>
      </div>
      {/* Subtle border */}
      <div className="h-px bg-border" />
    </div>
  );
};

export default CategoryTabs;
