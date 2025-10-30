"use client";
import { useEffect, useState } from "react";
import { getSinglePost } from "@/app/lib/notion";
import Link from "next/link";
import { ArrowLeft, Clock, User, Share2, Bookmark, ArrowUp } from "lucide-react";

export default async function Page({ params }: { params: { slug: string } }) {
    const post = await fetchBlogData(params.slug);

    return <BlogPostClient post={post} />;
}

function BlogPostClient({ post }: { post: any }) {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [estimatedReadTime, setEstimatedReadTime] = useState("5 min");

    // Calculate estimated reading time based on content length
    useEffect(() => {
        const wordCount = post.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        const readingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed
        setEstimatedReadTime(`${readingTimeMinutes} min read`);
    }, [post.content]);

    // Handle scroll events for UI elements
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show/hide scroll-to-top button
            setShowScrollTop(currentScrollY > 500);

            // Hide header on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Format publish date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-16">
            {/* Floating header for navigation */}
            <header className={`fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-10 transition-transform duration-300 shadow-sm ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}>
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to blog
                    </Link>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors" aria-label="Save for later">
                            <Bookmark size={20} />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors" aria-label="Share this post">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Article content */}
            <article className="pt-24 px-4">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Post header */}
                    <header className="p-8 pb-6 border-b border-gray-100">
                        {/* Category tag */}
                        <div className="mb-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Blog</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>

                        {/* Meta information */}
                        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
                            <div className="flex items-center">
                                <User size={16} className="mr-1" />
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                <span>{formatDate(post.publishedDate)}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                <span>{estimatedReadTime}</span>
                            </div>
                        </div>
                    </header>

                    {/* Post content */}
                    <div className="p-8">
                        <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-a:text-blue-600 prose-img:rounded-lg" dangerouslySetInnerHTML={{ __html: post.content }} />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Topics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag: string, index: number) => (
                                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Author bio section */}
                <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {/* This would be an actual image in production */}
                            <span className="text-2xl font-bold text-gray-500">{post.author?.charAt(0) || "A"}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{post.author}</h3>
                            <p className="text-gray-600 mb-4">Writer and contributor at Blog Wiki. Passionate about sharing knowledge and insightful content.</p>
                            <div className="flex gap-3">
                                <a href="https://x.com/ddwiikkii" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                    Twitter
                                </a>
                                <a href="https://www.linkedin.com/in/dwikihidayat/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related posts section - This could be dynamic in production */}
                <div className="max-w-3xl mx-auto mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                                <Link href="#">The Ultimate Guide to Modern Web Development</Link>
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">Learn the latest techniques and best practices for building modern web applications.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="font-bold text-lg text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                                <Link href="#">Understanding React Server Components</Link>
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">Dive deep into the new React Server Components and how they can improve your application.</p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Scroll to top button */}
            {showScrollTop && (
                <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-20" aria-label="Scroll to top">
                    <ArrowUp size={20} />
                </button>
            )}
        </main>
    );
}

async function fetchBlogData(slug: string) {
    const res = await getSinglePost(slug);
    return res;
}
