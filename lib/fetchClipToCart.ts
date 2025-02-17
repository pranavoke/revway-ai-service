export async function fetchProduct(brandId: string, sku: string): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const endpoint = `${baseUrl}/api/product_cliptocart/${brandId}/${sku}`;
  const res = await fetch(endpoint, { method: "GET" });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }

  return res.json();
}
