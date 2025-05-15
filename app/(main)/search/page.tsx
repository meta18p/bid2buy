import { getProducts } from "@/app/actions/product-actions"
import ProductCard from "@/components/product-card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const search = searchParams.q || ""
  const category = searchParams.category || "all"

  const products = await getProducts(category !== "all" ? category : undefined, search)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-6">
        {search ? `Showing results for "${search}"` : "Showing all products"}
        {category !== "all" ? ` in category "${category}"` : ""}
      </p>

      <Suspense fallback={<ProductGridSkeleton />}>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search or browse our categories</p>
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
