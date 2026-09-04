import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Agent Skills Manager",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
