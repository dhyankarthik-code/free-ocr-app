import BlogNavbar from "@/components/blog-navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"

// Revalidate every hour
export const revalidate = 3600

interface BlogPost {
    ID: number
    title: string
    content: string
    excerpt: string
    date: string
    author: {
        name: string
    }
    slug: string
}

// Fetch single post
async function getPost(slug: string): Promise<BlogPost | null> {
    try {
        const siteId = process.env.WORDPRESS_SITE_ID || '234686689'
        const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/slug:${slug}`, {
            next: { revalidate: 3600 }
        })
        const data = await res.json()
        if (data.error) return null
        return data
    } catch (error) {
        return null
    }
}

// Generate Dynamic Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        return {
            title: "Post Not Found - Infy Galaxy"
        }
    }

    // Strip HTML from excerpt for description
    const description = post.excerpt.replace(/<[^>]*>?/gm, '').slice(0, 160)

    return {
        title: `${post.title} - Infy Galaxy`,
        description: description,
        openGraph: {
            title: post.title,
            description: description,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author.name]
        }
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-16">
            <BlogNavbar />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <Link href="/blog" className="text-gray-500 hover:text-red-500 text-sm mb-8 inline-block">
                    ← Back to Blog
                </Link>

                <article className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                    <header className="mb-8 border-b border-gray-100 pb-8">
                        <div className="text-sm text-gray-500 mb-2">
                            {new Date(post.date).toLocaleDateString()} • {post.author.name}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-0" dangerouslySetInnerHTML={{ __html: post.title }} />
                    </header>

                    <div
                        className="prose prose-lg max-w-none text-gray-700 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </main>

            <Footer />
        </div>
    )
}
