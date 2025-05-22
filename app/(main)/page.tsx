"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProducts } from "../actions/product-actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import FilterSidebar from "@/components/filter-sidebar"
import ProductGrid from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Filter, SlidersHorizontal, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const category = searchParams.get("category") || "all"
  const search = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "newest"
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const timeFilter = searchParams.get("timeFilter") || "all"

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "electronics", name: "Electronics" },
    { id: "collectibles", name: "Collectibles" },
    { id: "fashion", name: "Fashion" },
    { id: "home", name: "Home & Garden" },
    { id: "art", name: "Art" },
    { id: "other", name: "Other" },
  ]

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "ending-soon", label: "Ending Soon" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "most-bids", label: "Most Bids" },
  ]

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const fetchedProducts = await getProducts(
        category !== "all" ? category : undefined,
        search,
        sort,
        minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice ? Number.parseFloat(maxPrice) : undefined,
        timeFilter !== "all" ? timeFilter : undefined,
      )
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load auctions. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()

    // Set up polling for real-time updates
    const interval = setInterval(fetchProducts, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [category, search, sort, minPrice, maxPrice, timeFilter])

  const updateFilters = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value)
      } else {
        urlParams.delete(key)
      }
    })

    router.push(`/?${urlParams.toString()}`)
  }

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value })
  }

  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value })
  }

  const clearFilters = () => {
    router.push("/")
  }

  const hasActiveFilters =
    category !== "all" || !!search || sort !== "newest" || !!minPrice || !!maxPrice || timeFilter !== "all"

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Browse Auctions</h1>
          {search && (
            <p className="text-muted-foreground">
              Search results for: <span className="font-medium text-foreground">{search}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isMobile ? (
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <FilterSidebar
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  timeFilter={timeFilter}
                  onFilterChange={updateFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {
                    Object.entries({ category, search, minPrice, maxPrice, timeFilter }).filter(
                      ([key, value]) =>
                        (key === "category" && value !== "all") ||
                        (key === "timeFilter" && value !== "all") ||
                        (key !== "category" && key !== "timeFilter" && value),
                    ).length
                  }
                </span>
              )}
            </Button>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop sidebar */}
        {!isMobile && filtersOpen && (
          <div className="w-full md:w-64 lg:w-72 shrink-0">
            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              timeFilter={timeFilter}
              onFilterChange={updateFilters}
            />
          </div>
        )}

        <div className="flex-1">
          <Tabs defaultValue={category} className="mb-8">
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? <ProductGridSkeleton /> : <ProductGrid products={products} />}
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
