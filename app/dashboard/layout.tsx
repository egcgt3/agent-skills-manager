import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Agent Skills Manager",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
