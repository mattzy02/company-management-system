import * as React from 'react';
import ThemeRegistry from './ThemeRegistry';

export const metadata = {
  title: 'Next.js App Router + Material UI — App Router',
  description: 'Next.js App Router + Material UI — App Router',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}