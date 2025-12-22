
import Link from 'next/link';
import { getPosts } from '@/lib/wordpress';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from 'lucide-react';

export const metadata = {
    title: 'Blog - OCR Extraction & Tech Insights',
    description: 'Read the latest articles about OCR technology, data extraction, and productivity tools.',
};

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="bg-gray-50 pt-24 pb-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-6">
                        Latest Updates & Insights
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Discover articles about OCR technology, digital transformation, and how to get the most out of your documents.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => {
                        // Extract featured image or use fallback
                        const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
                        const imageUrl = featuredMedia?.source_url || '/placeholder-blog.jpg';

                        // Format date
                        const date = new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        // Get author name (fallback to 'Team')
                        const author = post._embedded?.author?.[0]?.name || 'Team';

                        return (
                            <article
                                key={post.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group"
                            >
                                {/* Image Container */}
                                <Link href={`/blog/${post.slug}`} className="relative h-56 overflow-hidden bg-gray-100">
                                    {featuredMedia ? (
                                        <img
                                            src={imageUrl}
                                            alt={featuredMedia.alt_text || post.title.rendered}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            <span className="text-4xl opacity-20 font-bold">BLOG</span>
                                        </div>
                                    )}
                                </Link>

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                                            <Calendar className="w-3 h-3" />
                                            {date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {author}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                                        <Link href={`/blog/${post.slug}`} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                    </h2>

                                    {/* Excerpt */}
                                    <div
                                        className="text-gray-600 text-sm mb-6 line-clamp-3 prose prose-sm"
                                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                    />

                                    {/* Footer */}
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <Link href={`/blog/${post.slug}`}>
                                            <Button variant="ghost" className="p-0 h-auto font-semibold hover:bg-transparent hover:text-red-500 text-gray-900 flex items-center gap-2">
                                                Read Article <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
