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
    <div className="min-h-screen bg-black text-white relative">
      {/* Fundo preto sólido cobrindo tudo */}
      <div className="fixed inset-0 bg-black z-0"></div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">
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
        <article className="max-w-4xl mx-auto bg-black/80 backdrop-blur-sm">
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-400 mb-6">
              <time>{new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</time>
              <span className="hidden sm:inline">•</span>
              <span>{post.author}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">{post.excerpt}</p>
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
              <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden border border-purple-500/30 mb-8 sm:mb-12">
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
            prose-headings:font-bold
            prose-headings:mb-6
            prose-headings:mt-10
            prose-h1:text-3xl sm:prose-h1:text-4xl
            prose-h1:bg-gradient-to-r prose-h1:from-cyan-400 prose-h1:to-purple-400 prose-h1:bg-clip-text prose-h1:text-transparent
            prose-h2:text-2xl sm:prose-h2:text-3xl
            prose-h2:bg-gradient-to-r prose-h2:from-purple-400 prose-h2:to-pink-400 prose-h2:bg-clip-text prose-h2:text-transparent
            prose-h2:border-b prose-h2:border-purple-500/20 prose-h2:pb-3
            prose-h3:text-xl sm:prose-h3:text-2xl
            prose-h3:text-purple-300
            prose-p:text-gray-300 
            prose-p:leading-relaxed
            prose-p:mb-6
            prose-p:text-base sm:prose-p:text-lg
            prose-a:text-purple-400 
            prose-a:no-underline 
            prose-a:font-medium
            hover:prose-a:text-purple-300
            hover:prose-a:underline
            prose-strong:text-white
            prose-strong:font-semibold
            prose-code:text-purple-400
            prose-code:bg-purple-500/10
            prose-code:px-2
            prose-code:py-1
            prose-code:rounded
            prose-code:text-sm
            prose-pre:bg-black/60
            prose-pre:border
            prose-pre:border-purple-500/30
            prose-pre:p-4
            prose-pre:rounded-lg
            prose-pre:overflow-x-auto
            prose-blockquote:border-l-4
            prose-blockquote:border-l-purple-400
            prose-blockquote:text-gray-300
            prose-blockquote:pl-6
            prose-blockquote:italic
            prose-blockquote:my-6
            prose-ul:text-gray-300
            prose-ul:my-6
            prose-ul:space-y-2
            prose-ol:text-gray-300
            prose-ol:my-6
            prose-ol:space-y-2
            prose-li:text-base sm:prose-li:text-lg
            prose-li:leading-relaxed
            prose-li:marker:text-purple-400
            prose-hr:border-purple-500/30
            prose-hr:my-12
          ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Footer */}
          <footer className="mt-12 sm:mt-16 pt-8 border-t border-purple-500/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                href="/blog"
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
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
