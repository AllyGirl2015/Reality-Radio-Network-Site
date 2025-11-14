import { getPostBySlug, getPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found | Reality Radio Network',
    };
  }

  return {
    title: `${post.title} | Reality Radio Network Blog`,
    description: post.excerpt || 'Read more on Reality Radio Network blog',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-24">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <time>{new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</time>
              <span>•</span>
              <span>{post.author}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-300 mb-6">{post.excerpt}</p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative h-96 rounded-lg overflow-hidden border border-purple-500/30">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-purple max-w-none
            prose-headings:bg-gradient-to-r prose-headings:from-cyan-400 prose-headings:to-purple-400 prose-headings:bg-clip-text prose-headings:text-transparent
            prose-headings:font-bold
            prose-h1:text-4xl
            prose-h2:text-3xl 
            prose-h3:text-2xl
            prose-p:text-gray-300 
            prose-p:leading-relaxed
            prose-a:text-purple-400 
            prose-a:no-underline 
            hover:prose-a:text-purple-300
            prose-strong:text-white
            prose-code:text-purple-400
            prose-code:bg-purple-500/10
            prose-code:px-2
            prose-code:py-1
            prose-code:rounded
            prose-pre:bg-black/60
            prose-pre:border
            prose-pre:border-purple-500/30
            prose-blockquote:border-l-purple-400
            prose-blockquote:text-gray-300
            prose-ul:text-gray-300
            prose-ol:text-gray-300
            prose-li:marker:text-purple-400
          ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-purple-500/30">
            <div className="flex justify-between items-center">
              <Link
                href="/blog"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                ← View all posts
              </Link>

              <div className="text-gray-400 text-sm">
                Published by {post.author}
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
