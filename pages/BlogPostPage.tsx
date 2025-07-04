import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Blog } from '../types.ts';
import { fetchPublishedBlogBySlug } from '../services/supabaseClient.ts';
import Button from '../components/common/Button.tsx';

const { useParams, Link } = ReactRouterDOM;

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("No blog post specified.");
            setLoading(false);
            return;
        }

        const loadPost = async () => {
            setLoading(true);
            try {
                const data = await fetchPublishedBlogBySlug(slug);
                if (data) {
                    setPost(data);
                } else {
                    setError("Blog post not found.");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load the blog post.");
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [slug]);
    
    if (loading) {
        return <div className="text-center py-20">Loading post...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!post) {
        return <div className="text-center py-20">Post not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-12">
            <article>
                <header className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">{post.title}</h1>
                    <p className="text-slate-500 mt-4">
                        Published on {new Date(post.published_at!).toLocaleDateString()}
                    </p>
                </header>

                {post.featured_image_url && (
                    <img 
                        src={post.featured_image_url} 
                        alt={post.title} 
                        className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8"
                    />
                )}

                <div 
                    className="prose lg:prose-xl max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
            </article>

            <div className="mt-12 text-center border-t pt-8">
                <Link to="/blog">
                    <Button variant="secondary">&larr; Back to Blog</Button>
                </Link>
            </div>
        </div>
    );
};

export default BlogPostPage;