import "./globals.css";

export const metadata = {
  title: "WM Enterprise DevSecOps Portal",
  description: "Centralized Governance, Onboarding & Compliance Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
