"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPublishedBlog } from "./lib/notion";
import { Post } from "./types/Notion";
import { ArrowUp } from "lucide-react";

// Define the props for the server component
export interface HomeServerProps {
    initialPosts: Post[];
    totalPosts: number;
}

// Server component that fetches the initial data
export async function HomeServer() {
    const posts = await getAllPublishedBlog();
    const initialPosts = posts.slice(0, 10);

    return <HomeClient initialPosts={initialPosts} totalPosts={posts.length} />;
}

// Client component that handles pagination and interactions
export function HomeClient({ initialPosts, totalPosts }: HomeServerProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [visiblePosts, setVisiblePosts] = useState<Post[]>(initialPosts);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const postsPerPage = 10;
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    // Check scroll position to show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Load more posts when page changes
    const loadMorePosts = async () => {
        if (page >= totalPages) return;

        setLoading(true);
        try {
            // In a real app, you'd fetch the next page from your API
            // Here we're simulating pagination with the server data
            const nextPage = page + 1;
            const start = page * postsPerPage;
            const end = start + postsPerPage;

            // This would be an API call in a real implementation
            const morePosts = await getAllPublishedBlog();
            const newPosts = morePosts.slice(start, end);

            setPosts([...posts, ...newPosts]);
            setVisiblePosts([...posts, ...newPosts]);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to load more posts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <main className="min-h-screen py-16 px-4 bg-gray-50">
            {/* Hero section */}
            <div className="w-full max-w-4xl mx-auto mb-12 text-center">
                <h1 className="text-4xl font-bold mb-3 text-gray-800">List Blog Wiki.</h1>
                <p className="text-gray-600 text-lg">Explore our collection of insightful articles and tutorials</p>
            </div>

            {/* Blog posts container */}
            <div className="w-full max-w-3xl mx-auto">
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No posts available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {visiblePosts.map((post: Post, index: number) => (
                            <article key={index} className="rounded-lg p-6 border-b border-gray-200 transition-all duration-300">
                                {/* Post metadata */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-medium text-blue-600">
                                        {new Date(post.publishedDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>

                                {/* Post title and description */}
                                <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="block">
                                    <h2 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 mb-3">{post.title}</h2>
                                    <p className="text-gray-600 line-clamp-3">{post.description}</p>
                                </Link>

                                {/* Read more link */}
                                <div className="mt-4">
                                    <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
                                        Read more
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Load more button */}
                {posts.length > 0 && page < totalPages && (
                    <div className="mt-12 text-center">
                        <button onClick={loadMorePosts} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50">
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                <span>Load More Posts</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Scroll to top button */}
                {showScrollTop && (
                    <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors" aria-label="Scroll to top">
                        <ArrowUp size={20} />
                    </button>
                )}
            </div>
        </main>
    );
}

// Default export for the page
export default async function Home() {
    return <HomeServer />;
}
