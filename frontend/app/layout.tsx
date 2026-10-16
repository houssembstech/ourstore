// Root layout — the [locale] layout handles html/body/lang/dir
// This pattern is required for next-intl App Router i18n
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
