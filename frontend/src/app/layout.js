import Providers from '@/components/Providers'
import '@/styles/globals.css'

export const metadata = {
  title: 'TaskFlow — Task Management',
  description: 'A simple and powerful task management application.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
