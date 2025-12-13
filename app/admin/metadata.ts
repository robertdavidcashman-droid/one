import type { Metadata } from 'next';

/**
 * Metadata for admin pages - prevents indexing
 */
export const adminMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

