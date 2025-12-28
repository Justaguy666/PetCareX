import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Filter, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { apiGet } from "@/api/api";

interface Product {
  id: number;
  product_name: string;
  product_type: string;
  price: number;
}

export default function ProductStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sorting state
  const [sortBy, setSortBy] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const categories = ["all", "Thức ăn", "Phụ kiện"];

  // Fetch products from backend with pagination, search, filter and sort
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
          search: searchTerm,
          category: selectedCategory,
          sortBy: sortBy,
          sortOrder: sortOrder
        });

        const response = await apiGet(`/products?${queryParams.toString()}`);
        setProducts(response?.data || []);
        if (response?.meta) {
          setTotalPages(response.meta.totalPages);
          setTotalCount(response.meta.totalCount);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const getCategoryLabel = (category: string) => {
    return category;
  };

  const categoryEmoji: Record<string, string> = {
    "Thức ăn": "🍖",
    "Phụ kiện": "🛍️",
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Products</h1>
            <p className="text-lg text-muted-foreground">
              Browse our selection of quality pet products
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2 w-full"
              />
            </div>

            {/* Category Filter & Sort */}
            <div className="flex items-center gap-4 flex-wrap justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-primary/5 transition"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {showFilters && (
                  <div className="flex gap-2 flex-wrap items-center">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="capitalize"
                      >
                        {category === "all"
                          ? "All Products"
                          : `${categoryEmoji[category] || ""} ${getCategoryLabel(category)}`}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sắp xếp theo:</span>
                <select
                  className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-sm"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-");
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                >
                  <option value="created_at-DESC">Mới nhất</option>
                  <option value="price-ASC">Giá: Thấp đến Cao</option>
                  <option value="price-DESC">Giá: Cao đến Thấp</option>
                  <option value="product_name-ASC">Tên: A-Z</option>
                  <option value="product_name-DESC">Tên: Z-A</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              Showing {products.length} of {totalCount} product{totalCount !== 1 ? "s" : ""}
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-4 h-[400px] animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Combined Pagination & Jump to Page */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center">
                  <div className="inline-flex items-center p-1.5 bg-muted/30 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm gap-2">
                    {/* Navigation Buttons Row */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-sm"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>

                      <div className="flex items-center px-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 rounded-xl transition-all duration-200 ${currentPage === pageNum
                                  ? "shadow-md shadow-primary/20 scale-105"
                                  : "hover:bg-background hover:shadow-sm"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return <span key={pageNum} className="px-2 text-muted-foreground/40 font-medium">•••</span>;
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-sm"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Vertical Separator */}
                    <div className="w-px h-8 bg-border/60 mx-1" />

                    {/* Integrated Jump to Page */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.target as any).pageInput;
                        const page = parseInt(input.value);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                        } else {
                          input.value = currentPage;
                        }
                      }}
                      className="flex items-center gap-2 pl-1 pr-2"
                    >
                      <div className="relative group">
                        <Input
                          name="pageInput"
                          type="number"
                          min={1}
                          max={totalPages}
                          defaultValue={currentPage}
                          className="w-14 h-10 text-center bg-background border-border/40 rounded-xl focus-visible:ring-primary/20 pr-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all hover:border-primary/30"
                          onBlur={(e) => {
                            const page = parseInt(e.target.value);
                            if (isNaN(page) || page < 1 || page > totalPages) {
                              e.target.value = String(currentPage);
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground/40 whitespace-nowrap">/ {totalPages}</span>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="p-12 text-center border border-border">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `We couldn't find any products matching "${searchTerm}"`
                  : "No products available in this category"}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
