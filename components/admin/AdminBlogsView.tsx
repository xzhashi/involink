import React, { useState, useEffect, useCallback } from 'react';
import { Blog } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { fetchAllBlogsAdmin, saveBlogAdmin, deleteBlogAdmin } from '../../services/adminService.ts';
import Button from '../../components/common/Button.tsx';
import Input from '../../components/common/Input.tsx';
import Textarea from '../../components/common/Textarea.tsx';
import Select from '../../components/common/Select.tsx';
import { PlusIcon } from '../../components/icons/PlusIcon.tsx';
import { PencilIcon } from '../../components/icons/PencilIcon.tsx';
import { TrashIcon } from '../../components/icons/TrashIcon.tsx';
import { XMarkIcon } from '../../components/icons/XMarkIcon.tsx';

const AdminBlogsView: React.FC = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<Blog> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllBlogsAdmin();
            setPosts(data);
        } catch (e: any) {
            setError(e.message || "Failed to load blog posts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);
    
    const slugify = (text: string) =>
      text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');

    const handleOpenModal = (post: Partial<Blog> | null = null) => {
        if (post) {
            setCurrentPost(post);
            setIsEditing(true);
        } else {
            setCurrentPost({
                title: '',
                slug: '',
                content: '',
                excerpt: '',
                featured_image_url: '',
                status: 'draft'
            });
            setIsEditing(false);
        }
        setShowModal(true);
        setError(null);
    };

    const handleSavePost = async () => {
        if (!currentPost || !currentPost.title) {
            setError("Post title is required.");
            return;
        }
        if (!currentPost.slug) {
            setError("Post slug is required. It's usually auto-generated from the title.");
            return;
        }
        
        setIsProcessing(true);
        setError(null);
        try {
            await saveBlogAdmin(currentPost);
            setShowModal(false);
            loadPosts();
        } catch (e: any) {
            setError(e.message || "Failed to save post.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        setIsProcessing(true);
        setError(null);
        try {
            await deleteBlogAdmin(postId);
            loadPosts();
        } catch (e: any) {
            setError(e.message || "Failed to delete post.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentPost) return;
        const { name, value } = e.target;
        
        if (name === 'title') {
            setCurrentPost({ ...currentPost, title: value, slug: slugify(value) });
        } else {
            setCurrentPost({ ...currentPost, [name]: value });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-darkest">Blog Posts</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusIcon className="w-5 h-5"/>}>
                    New Post
                </Button>
            </div>
            
            {loading && <p>Loading posts...</p>}
            {error && !showModal && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {!loading && posts.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-neutral-light">
                        {posts.map(post => (
                            <li key={post.id} className="px-4 py-3 sm:px-6 hover:bg-neutral-lightest">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="truncate flex-1">
                                        <p className="font-semibold text-primary-dark">{post.title}</p>
                                        <p className="text-xs text-neutral-500">
                                            /blog/{post.slug}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-4">
                                       <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                            post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {post.status}
                                        </span>
                                        <p className="text-xs text-neutral-500 hidden sm:block">
                                            By: {post.author_email}
                                        </p>
                                        <div className="space-x-1">
                                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(post)}><PencilIcon className="w-4 h-4"/></Button>
                                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeletePost(post.id)}><TrashIcon className="w-4 h-4"/></Button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
             {showModal && currentPost && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{isEditing ? 'Edit Post' : 'New Post'}</h3>
                            <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        {error && showModal && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-3 text-sm">{error}</p>}
                        <div className="space-y-4 overflow-y-auto flex-grow pr-2 thin-scrollbar">
                            <Input label="Title" name="title" value={currentPost.title || ''} onChange={handleInputChange} required />
                            <Input label="URL Slug (auto-generated)" name="slug" value={currentPost.slug || ''} onChange={handleInputChange} required />
                            <Textarea label="Content (HTML allowed)" name="content" value={currentPost.content || ''} onChange={handleInputChange} rows={10} />
                            <Textarea label="Excerpt (Short Summary)" name="excerpt" value={currentPost.excerpt || ''} onChange={handleInputChange} rows={3} />
                            <Input label="Featured Image URL" name="featured_image_url" value={currentPost.featured_image_url || ''} onChange={handleInputChange} />
                            <Select label="Status" name="status" value={currentPost.status || 'draft'} onChange={handleInputChange} options={[{value: 'draft', label: 'Draft'}, {value: 'published', label: 'Published'}]} />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleSavePost} disabled={isProcessing}>{isProcessing ? 'Saving...' : 'Save Post'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogsView;
