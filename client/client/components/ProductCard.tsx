import { PetItem } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { requireLogin } from "@/lib/authUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Product {
  id: number;
  product_name: string;
  product_type: string;
  price: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // For now, assume products are in stock since we don't have a stock field in DB yet
  const isOutOfStock = false;

  const handleAddToCart = () => {
    // Require login before adding to cart
    if (!requireLogin(user, window.location.pathname)) {
      return;
    }

    addItem({
      id: String(product.id),
      name: product.product_name,
      price: product.price,
      category: product.product_type,
    }, quantity);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Thức ăn":
        return "bg-orange-100 text-orange-700";
      case "Phụ kiện":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card className="p-4 border border-border hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Product Image Placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg mb-4 flex items-center justify-center text-4xl">
        {product.product_type === "Thức ăn" ? "🍖" : "🛍️"}
      </div>

      {/* Product Category */}
      <div className="mb-2">
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(product.product_type)}`}>
          {product.product_type}
        </span>
      </div>

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-foreground mb-4 line-clamp-2">
        {product.product_name}
      </h3>

      <div className="flex-grow"></div>

      {/* Price */}
      <p className="text-2xl font-bold text-primary mb-4">
        {formatPrice(product.price)}
      </p>

      {/* Quantity and Add to Cart */}
      <div className="flex gap-2">
        <div className="flex items-center border border-input rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity === 1}
            className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            −
          </button>
          <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            +
          </button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAddToCart}
                className={`flex-1 ${isAdded ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAdded ? "Added!" : "Add"}
              </Button>
            </TooltipTrigger>
            {!user && (
              <TooltipContent>
                <p>Please log in to add items to cart</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}

