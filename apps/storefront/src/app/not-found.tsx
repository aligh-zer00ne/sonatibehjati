import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="container empty-state">
      <h1>صفحه پیدا نشد</h1>
      <p>این مسیر هنوز در دسترس نیست.</p>
      <Link className="button button-primary" href="/">
        بازگشت به خانه
      </Link>
    </main>
  );
}
