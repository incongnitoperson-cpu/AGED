import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AGED',
  description: 'Make a take. See how it ages.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
