export default function Loading() {
  return (
    <main className="container loading" aria-label="در حال بارگذاری" aria-busy="true">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-hero" />
      <div className="product-grid">
        {[1, 2, 3, 4].map((id) => (
          <div className="skeleton skeleton-product" key={id} />
        ))}
      </div>
    </main>
  );
}
