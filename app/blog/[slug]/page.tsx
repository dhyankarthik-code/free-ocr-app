
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/wordpress';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title.rendered} - OCR Extraction Blog`,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 160),
        openGraph: {
            images: post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                ? [post._embedded['wp:featuredmedia'][0].source_url]
                : [],
        },
        alternates: {
            canonical: `/blog/${slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
    const imageUrl = featuredMedia?.source_url;
    const date = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const author = post._embedded?.author?.[0]?.name || 'Team';

    // Fix mixed content issues by replacing http with https in content
    const sanitizedContent = post.content.rendered.replace(/http:\/\/([^\s"']+)/g, 'https://$1');
    const sanitizedTitle = post.title.rendered.replace(/http:\/\/([^\s"']+)/g, 'https://$1');

    return (
        <div className="bg-white pt-24 pb-16">
            <article className="container mx-auto px-4 max-w-4xl">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/blog">
                        <Button variant="ghost" size="sm" className="bg-gray-50 hover:bg-gray-100 text-gray-600 gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Blog
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-6">
                        <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                            <Calendar className="w-4 h-4" />
                            {date}
                        </span>
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {author}
                        </span>
                    </div>

                    <h1
                        className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8"
                        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
                    />

                    {imageUrl && (
                        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg mb-10">
                            <img
                                src={imageUrl}
                                alt={featuredMedia?.alt_text || post.title.rendered}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </header>

                {/* Content */}
                <div
                    className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 hover:prose-a:text-red-700 prose-img:rounded-xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Original Source Link */}

            </article>
        </div>
    );
}
