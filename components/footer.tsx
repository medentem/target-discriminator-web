import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t mt-auto py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Target Discriminator. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link 
              href="/privacy" 
              className="hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

