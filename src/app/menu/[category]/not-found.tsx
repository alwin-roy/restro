import Link from "next/link";

export default function CategoryNotFound() {
  return <main id="menu-main" tabIndex={-1} className="categories-container py-20 text-center"><p className="text-xs font-bold tracking-widest text-primary">RESTRO DEMO MENU</p><h1 className="categories-heading mt-4">Category not found</h1><p className="mt-5 text-[#666]">This category isn’t part of our sample menu.</p><Link href="/menu" className="yellow-button mt-8 min-h-12 rounded-full px-7 text-sm">Browse all categories</Link></main>;
}
