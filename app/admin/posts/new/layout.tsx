import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "New Post | Admin | Criminal Defence Kent",
  description: "Create a new blog post",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



