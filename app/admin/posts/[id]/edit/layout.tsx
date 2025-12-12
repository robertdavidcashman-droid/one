import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Edit Post | Admin | Criminal Defence Kent",
  description: "Edit blog post",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

