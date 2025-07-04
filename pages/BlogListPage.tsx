import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Blog } from '../types.ts';
import { fetchPublishedBlogs } from '../services/supabaseClient.ts';

const { Link } = ReactRouterDOM;

const BlogCard: React.FC<{ post: Blog }> = ({ post }) => (
    <Link to={`/blog/${post.slug}`} className="block group bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <div className="overflow-hidden">
            <img 
                src={post.featured_image_url || `https://picsum.photos/seed/${post.id}/600/400`} 
                alt={post.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-800 group-hover:text-primary transition-colors">{post.title}</h2>
            <p className="text-sm text-slate-500 mt-2">Published on {new Date(post.published_at!).toLocaleDateString()}</p>
            <p className="text-slate-600 mt-4 leading-relaxed">{post.excerpt}</p>
            <span className="inline-block mt-4 font-semibold text-primary group-hover:underline">Read More &rarr;</span>
        </div>
    </Link>
);


const BlogListPage: React.FC = () => {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true);
            try {
                const data = await fetchPublishedBlogs();
                setPosts(data);
            } catch (err: any) {
                setError(err.message || "Failed to load blog posts.");
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    return (
        <div className="py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-darkest">Our Blog</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-DEFAULT">Insights, tutorials, and updates from the Invoice Maker team.</p>
            </div>

            {loading && <p className="text-center">Loading posts...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {!loading && posts.length === 0 && (
                <p className="text-center text-neutral-500">No blog posts have been published yet. Check back soon!</p>
            )}

            {!loading && posts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <BlogCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogListPage;