import { getProducts } from "../actions/product-actions"
import ProductCard from "@/components/product-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const category = searchParams.category || "all"
  const search = searchParams.q || ""

  const products = await getProducts(category !== "all" ? category : undefined, search)

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "electronics", name: "Electronics" },
    { id: "collectibles", name: "Collectibles" },
    { id: "fashion", name: "Fashion" },
    { id: "home", name: "Home & Garden" },
    { id: "art", name: "Art" },
    { id: "other", name: "Other" },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Auctions</h1>

      <Tabs defaultValue={category} className="mb-8">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              asChild
            >
              <a href={`/?category=${cat.id}${search ? `&q=${search}` : ""}`}>{cat.name}</a>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {search && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            Search results for: <span className="font-medium text-foreground">{search}</span>
          </p>
        </div>
      )}

      <Suspense fallback={<ProductGridSkeleton />}>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
            <p className="text-muted-foreground">
              {search
                ? `No results found for "${search}". Try a different search term.`
                : category !== "all"
                  ? `No auctions found in the "${category}" category.`
                  : "There are no active auctions at the moment."}
            </p>
          </div>
        )}
      </Suspense>
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
