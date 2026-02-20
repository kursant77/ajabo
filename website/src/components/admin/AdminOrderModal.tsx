
import { useState, useEffect, useMemo } from "react";
import { X, ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Check, CreditCard, Banknote, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSupabaseCategories, type Category } from "@/hooks/useSupabaseCategories";
import { useSupabaseProducts, type Product } from "@/hooks/useSupabaseProducts";
import { useSupabaseOrders } from "@/hooks/useSupabaseOrders";
import { useSupabaseTables } from "@/hooks/useSupabaseTables";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

interface AdminOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminOrderModal = ({ isOpen, onClose }: AdminOrderModalProps) => {
  const { categories, loading: categoriesLoading } = useSupabaseCategories();
  const { products, loading: productsLoading } = useSupabaseProducts();
  const { addOrder } = useSupabaseOrders();
  const { tables, loading: tablesLoading } = useSupabaseTables();

  const [view, setView] = useState<"categories" | "products" | "checkout">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Checkout states
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setView("categories");
      setSelectedCategory(null);
      setCart([]);
      setSelectedProduct(null);
      setProductQuantity(1);
      setSelectedTable(null);
      setPaymentMethod("cash");
    }
  }, [isOpen]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p) => {
      const category = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      if (!category) return false;
      return p.category === category.slug || p.category === category.name.toLowerCase();
    });
  }, [products, selectedCategory, categories]);

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setView("products");
  };

  const handleBack = () => {
    if (view === "checkout") {
      setView("categories"); // Or categories if you want
    } else if (view === "products") {
      setView("categories");
      setSelectedCategory(null);
      setSelectedProduct(null);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    setProductQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const existingItem = cart.find((item) => item.productId === selectedProduct.id);

    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === selectedProduct.id
            ? {
              ...item,
              quantity: item.quantity + productQuantity,
              totalPrice: (item.quantity + productQuantity) * item.price,
            }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `${selectedProduct.id}-${Date.now()}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        quantity: productQuantity,
        totalPrice: selectedProduct.price * productQuantity,
        image: selectedProduct.image,
      };
      setCart((prev) => [...prev, newItem]);
    }

    toast.success(`${selectedProduct.name} savatga qo'shildi`);
    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    toast.success("Mahsulot savatdan olib tashlandi");
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const handleGoToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Savat bo'sh");
      return;
    }
    setView("checkout");
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;
    if (!selectedTable) {
      toast.error("Iltimos, stolni tanlang");
      return;
    }

    setIsCreating(true);

    try {
      const orderPromises = cart.map((item) =>
        addOrder({
          productName: item.productName,
          quantity: item.quantity,
          customerName: "Admin buyurtmasi",
          phoneNumber: "",
          address: `Stol: ${selectedTable}`,
          status: "pending",
          createdAt: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
          rawCreatedAt: new Date(),
          totalPrice: item.totalPrice,
          telegramUserId: null,
          orderType: "takeaway",
          paymentMethod: paymentMethod === "card" ? "click" : "cash",
          // The hook now supports tableName via any cast, let's pass it
          tableName: selectedTable,
        } as any)
      );

      await Promise.all(orderPromises);

      toast.success("Buyurtma muvaffaqiyatli yaratildi!");
      onClose();
    } catch (error) {
      console.error("Error creating orders:", error);
      toast.error("Buyurtma yaratishda xatolik yuz berdi");
    } finally {
      setIsCreating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 flex flex-col bg-background overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold">
              <ShoppingCart className="h-6 w-6 text-primary" />
              {view === "checkout" ? "Buyurtmani yakunlash" : "Buyurtma kiritish"}
            </div>
            {view === "checkout" && (
              <Button variant="ghost" size="sm" onClick={() => setView("categories")} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Orqaga
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Cart Summary (35%) */}
          <div className="w-[35%] border-r bg-muted/10 flex flex-col">
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="font-bold flex items-center justify-between">
                Savat
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                  {cart.length} ta
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <ShoppingCart className="h-16 w-16 mb-4" />
                  <p className="font-medium text-lg">Savat bo'sh</p>
                  <p className="text-sm">Mahsulot tanlang</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-background rounded-2xl border border-border/50 p-3 flex gap-4 hover:shadow-lg transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <ShoppingCart className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.productName}</h4>
                      <p className="text-xs text-primary font-bold mt-1">
                        {formatPrice(item.price)} so'm
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                          onClick={() => handleUpdateCartQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                          onClick={() => handleUpdateCartQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <p className="text-sm font-bold text-foreground">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && view !== "checkout" && (
              <div className="p-6 border-t bg-background space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Umumiy:</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(totalPrice)} so'm</span>
                </div>
                <Button className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg font-bold" onClick={handleGoToCheckout}>
                  Davom etish
                  <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                </Button>
              </div>
            )}
          </div>

          {/* Right Side - Selection Flow (65%) */}
          <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
            {view === "checkout" ? (
              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                {/* Tables Selection */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold">Stolni tanlang</h3>
                  </div>

                  {tablesLoading ? (
                    <p className="text-center py-12 text-muted-foreground italic">Stollar yuklanmoqda...</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tables.map(table => (
                        <button
                          key={table.id}
                          disabled={table.status === 'busy'}
                          onClick={() => setSelectedTable(table.name)}
                          className={cn(
                            "relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden",
                            selectedTable === table.name
                              ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                              : "border-border hover:border-primary/40 bg-card",
                            table.status === 'busy' && "opacity-40 cursor-not-allowed grayscale"
                          )}
                        >
                          <h4 className="font-bold text-lg mb-1">{table.name}</h4>
                          <p className="text-xs text-muted-foreground">{table.capacity} kishilik</p>

                          {selectedTable === table.name && (
                            <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-in fade-in zoom-in">
                              <Check className="h-3 w-3" />
                            </div>
                          )}

                          {table.status === 'busy' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Band</span>
                            </div>
                          )}
                        </button>
                      ))}
                      {tables.length === 0 && (
                        <p className="col-span-full py-8 text-center text-muted-foreground">Mavjud stollar topilmadi</p>
                      )}
                    </div>
                  )}
                </section>

                {/* Payment Method */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold">To'lov turini tanlang</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={cn(
                        "flex items-center gap-4 p-6 rounded-3xl border-2 transition-all group relative overflow-hidden",
                        paymentMethod === "cash"
                          ? "border-emerald-500 bg-emerald-50/10 ring-4 ring-emerald-500/10"
                          : "border-border hover:border-emerald-200"
                      )}
                    >
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                        paymentMethod === "cash" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Banknote className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">Naqd pul</p>
                        <p className="text-sm text-muted-foreground">Qo'lda to'lov</p>
                      </div>
                      {paymentMethod === "cash" && (
                        <Check className="absolute top-4 right-4 h-6 w-6 text-emerald-500" />
                      )}
                    </button>

                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={cn(
                        "flex items-center gap-4 p-6 rounded-3xl border-2 transition-all group relative overflow-hidden",
                        paymentMethod === "card"
                          ? "border-sky-500 bg-sky-50/10 ring-4 ring-sky-500/10"
                          : "border-border hover:border-sky-200"
                      )}
                    >
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                        paymentMethod === "card" ? "bg-sky-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">Karta orqali</p>
                        <p className="text-sm text-muted-foreground">Terminal / Online</p>
                      </div>
                      {paymentMethod === "card" && (
                        <Check className="absolute top-4 right-4 h-6 w-6 text-sky-500" />
                      )}
                    </button>
                  </div>
                </section>

                <div className="pt-8 border-t space-y-4">
                  <div className="flex items-center justify-between text-2xl font-black">
                    <span>Jami to'lov:</span>
                    <span className="text-primary">{formatPrice(totalPrice)} so'm</span>
                  </div>
                  <Button
                    className="w-full h-16 rounded-3xl shadow-2xl text-xl font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleCreateOrder}
                    disabled={isCreating || !selectedTable}
                  >
                    {isCreating ? "Yaratilmoqda..." : "Buyurtmani tasdiqlash"}
                    <Check className="ml-3 h-6 w-6" />
                  </Button>
                </div>
              </div>
            ) : (
              // Navigation Header for Products View
              <div className="flex-1 flex flex-col h-full">
                {view === "products" && (
                  <div className="p-4 border-b flex items-center gap-4 bg-muted/20">
                    <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h3 className="font-black text-lg">
                      {categories.find(
                        (c) => c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory
                      )?.name || "Mahsulotlar"}
                    </h3>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                  {view === "categories" ? (
                    <div>
                      {categoriesLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                          <p className="text-muted-foreground font-medium">Kategoriyalar yuklanmoqda...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {categories.map((category) => {
                            const categoryValue = category.slug || category.name.toLowerCase();
                            const productCount = products.filter(
                              (p) => p.category === category.slug || p.category === category.name.toLowerCase()
                            ).length;
                            return (
                              <button
                                key={category.id}
                                onClick={() => handleCategorySelect(categoryValue)}
                                className="group relative p-8 rounded-[2.5rem] border-2 border-border/50 bg-card hover:border-primary hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden"
                              >
                                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                <h3 className="font-black text-xl mb-2 group-hover:text-primary transition-colors">
                                  {category.name}
                                </h3>
                                <p className="text-sm font-bold text-muted-foreground bg-muted inline-block px-3 py-1 rounded-full">
                                  {productCount} mahsulot
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            "p-5 rounded-[2rem] border-2 transition-all cursor-pointer group hover:shadow-xl",
                            selectedProduct?.id === product.id
                              ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                              : "border-border hover:border-primary/40 bg-card"
                          )}
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="flex gap-5">
                            <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden shrink-0 shadow-inner">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                  <Utensils className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-lg truncate group-hover:text-primary transition-colors">{product.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1 italic">
                                {product.description || "Mazali ta'riflar..."}
                              </p>
                              <p className="text-xl font-black text-primary mt-3">
                                {formatPrice(product.price)} so'm
                              </p>
                            </div>
                          </div>

                          {selectedProduct?.id === product.id && (
                            <div className="mt-5 pt-5 border-t border-primary/10 flex items-center gap-4 animate-in slide-in-from-top-1 px-1">
                              <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-2xl">
                                <button
                                  className="h-9 w-9 rounded-xl bg-background flex items-center justify-center hover:bg-primary hover:text-white shadow-sm transition-all active:scale-90"
                                  onClick={(e) => { e.stopPropagation(); handleQuantityChange(-1); }}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-lg font-black w-8 text-center">{productQuantity}</span>
                                <button
                                  className="h-9 w-9 rounded-xl bg-background flex items-center justify-center hover:bg-primary hover:text-white shadow-sm transition-all active:scale-90"
                                  onClick={(e) => { e.stopPropagation(); handleQuantityChange(1); }}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <Button
                                className="flex-1 h-12 rounded-2xl font-black shadow-lg shadow-primary/20"
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                              >
                                <Plus className="h-5 w-5 mr-2" />
                                Savatga
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOrderModal;
