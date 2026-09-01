import Link from "next/link"

export default function NotFound() {
  return (
    <section className="p-4 max-w-md mx-auto text-center my-4 border border-primary rounded-md">
      <h1>404 - Page Not Found</h1>
      <Link href="/" className="btn btn-outline mt-4">go to home</Link>
    </section>
  )
}