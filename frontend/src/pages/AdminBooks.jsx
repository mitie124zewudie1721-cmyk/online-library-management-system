// src/pages/AdminBooks.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit modal state
    const [editBook, setEditBook] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publicationYear: '',
        totalCopies: '',
        availableCopies: '',
        coverImage: '',
        description: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch (err) {
            setError('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (book) => {
        setEditBook(book);
        setEditForm({
            title: book.title || '',
            author: book.author || '',
            isbn: book.isbn || '',
            category: book.category || 'Fiction',
            publicationYear: book.publicationYear || '',
            totalCopies: book.totalCopies || 1,
            availableCopies: book.availableCopies || 1,
            coverImage: book.coverImage || '',
            description: book.description || '',
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: ['publicationYear', 'totalCopies', 'availableCopies'].includes(name)
                ? (value === '' ? '' : Number(value))
                : value,
        }));
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        if (!editBook) return;

        try {
            const res = await api.put(`/books/${editBook._id}`, editForm);
            setBooks(prev => prev.map(b => b._id === editBook._id ? res.data : b));
            setEditBook(null);
            alert('Book updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update book');
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book? This cannot be undone.')) return;

        try {
            await api.delete(`/books/${bookId}`);
            setBooks(prev => prev.filter(b => b._id !== bookId));
            alert('Book deleted successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete book');
        }
    };

    if (loading) return <div className="text-center py-10">Loading books...</div>;
    if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Books</h1>
                <button
                    onClick={() => navigate('/add-book')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                    + Add New Book
                </button>
            </div>

            {books.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center text-gray-600">
                    No books found in the library yet.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Title</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Author</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">ISBN</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Copies</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {books.map(book => (
                                <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{book.author}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{book.isbn}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{book.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {book.availableCopies} / {book.totalCopies}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-4">
                                        <button
                                            onClick={() => openEditModal(book)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBook(book._id)}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editBook && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 lg:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Book</h2>
                                <button onClick={() => setEditBook(null)} className="text-gray-500 hover:text-gray-700 text-3xl">×</button>
                            </div>

                            <form onSubmit={handleUpdateBook} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                        <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                                        <input type="text" name="author" value={editForm.author} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                                        <input type="text" name="isbn" value={editForm.isbn} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                        <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required>
                                            <option value="Fiction">Fiction</option>
                                            <option value="Non-Fiction">Non-Fiction</option>
                                            <option value="Science">Science</option>
                                            <option value="Technology">Technology</option>
                                            <option value="History">History</option>
                                            <option value="Children">Children</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year *</label>
                                        <input type="number" name="publicationYear" value={editForm.publicationYear} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required min="1000" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
                                        <input type="number" name="totalCopies" value={editForm.totalCopies} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required min="1" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies *</label>
                                        <input type="number" name="availableCopies" value={editForm.availableCopies} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" required min="0" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL (optional)</label>
                                        <input type="url" name="coverImage" value={editForm.coverImage} onChange={handleEditChange} className="w-full border rounded-lg px-4 py-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                        <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="4" className="w-full border rounded-lg px-4 py-2" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4 border-t">
                                    <button type="button" onClick={() => setEditBook(null)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                                    <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;