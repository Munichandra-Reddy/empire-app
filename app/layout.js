import './globals.css';

export const metadata = {
  title: 'Empire — Sign up',
  description: 'Empire Platform Authentication Portal',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
