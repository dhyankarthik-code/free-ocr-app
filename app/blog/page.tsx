import BlogLayout from "@/components/blog-layout"
import Link from "next/link"
import { Metadata } from "next"

// Revalidate every hour (3600 seconds)
export const revalidate = 3600

export const metadata: Metadata = {
    title: "Blog - Infy Galaxy",
    description: "Latest updates, guides, and news from the Infy Galaxy team.",
}

interface BlogPost {
    ID: number
    title: string
    excerpt: string
    date: string
    slug: string
    author: {
        name: string
    }
}

async function getPosts(): Promise<BlogPost[]> {
    try {
        const res = await fetch('https://public-api.wordpress.com/rest/v1.1/sites/dhyanvrit.wordpress.com/posts')
        const data = await res.json()
        return data.posts || []
    } catch (error) {
        console.error("Failed to fetch posts:", error)
        return []
    }
}

export default async function BlogPage() {
    const posts = await getPosts()

    return (
        <BlogLayout>
            {posts.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                    {posts.map((post) => (
                        <article key={post.ID} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="mb-4 text-sm text-gray-500">
                                {new Date(post.date).toLocaleDateString()} • {post.author.name}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-red-500 transition-colors">
                                <Link href={`/blog/${post.slug}`} dangerouslySetInnerHTML={{ __html: post.title }} />
                            </h2>
                            <div className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                            <Link href={`/blog/${post.slug}`} className="text-red-500 font-semibold hover:text-red-600 inline-flex items-center gap-1">
                                Read Article →
                            </Link>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600">Check back soon for updates!</p>
                </div>
            )}
        </BlogLayout>
    )
}
