import './globals.css'
export const metadata = {
  title: 'Face Tracking App',
  description: 'Track faces and record videos with face markers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}