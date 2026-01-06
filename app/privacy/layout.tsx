import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Target Discriminator",
  description: "Privacy Policy for Target Discriminator - Learn how we collect, use, and protect your data.",
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

