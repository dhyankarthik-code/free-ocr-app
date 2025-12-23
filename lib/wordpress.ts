
export interface BlogPost {
    id: number;
    date: string;
    slug: string;
    link: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    _embedded?: {
        'wp:featuredmedia'?: Array<{
            source_url: string;
            alt_text: string;
        }>;
        'author'?: Array<{
            name: string;
            avatar_urls: Record<string, string>;
        }>;
    };
}

const WP_API_URL = 'https://blog.ocr-extraction.com/wp-json/wp/v2';

export async function getPosts(): Promise<BlogPost[]> {
    const res = await fetch(`${WP_API_URL}/posts?_embed&per_page=100`, {
        next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }

    return res.json();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const res = await fetch(`${WP_API_URL}/posts?_embed&slug=${slug}`, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch post');
    }

    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
}
