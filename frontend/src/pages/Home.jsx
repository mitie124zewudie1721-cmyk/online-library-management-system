// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_60%)]"></div>
                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
                        Library Management System
                    </h1>
                    <p className="text-xl md:text-3xl font-light mb-12 max-w-4xl mx-auto opacity-90">
                        Modern, secure, and easy-to-use platform for students, librarians, and administrators
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        {user ? (
                            <Link
                                to="/books"
                                className="inline-flex items-center px-10 py-5 bg-white text-indigo-900 font-bold text-xl rounded-full shadow-2xl hover:shadow-3xl hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-2"
                            >
                                Browse Books →
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-10 py-5 bg-white text-indigo-900 font-bold text-xl rounded-full shadow-2xl hover:shadow-3xl hover:bg-gray-100 transition-all duration-300"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-10 py-5 border-2 border-white text-white font-bold text-xl rounded-full hover:bg-white hover:text-indigo-900 transition-all duration-300"
                                >
                                    Create Free Account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
                        Why Choose Our Library System?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
                        {[
                            {
                                emoji: '📚',
                                title: 'Extensive Collection',
                                desc: 'Thousands of books across fiction, science, history, technology, children’s, and more.',
                            },
                            {
                                emoji: '🔄',
                                title: 'Easy Borrowing',
                                desc: 'Borrow books in seconds. Track due dates, renewals, and get automatic reminders.',
                            },
                            {
                                emoji: '📱',
                                title: 'Personal Dashboard',
                                desc: 'View your borrow history, current fines, profile details, and more — all in one place.',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4 border border-gray-100"
                            >
                                <div className="text-7xl mb-6 text-center">{feature.emoji}</div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-700 text-lg text-center leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-center px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">
                        Ready to start exploring?
                    </h2>

                    {user ? (
                        <Link
                            to="/books"
                            className="inline-block bg-white text-indigo-900 font-bold py-5 px-12 rounded-full text-xl hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl"
                        >
                            Open the Library Now →
                        </Link>
                    ) : (
                        <Link
                            to="/register"
                            className="inline-block bg-white text-indigo-900 font-bold py-5 px-12 rounded-full text-xl hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl"
                        >
                            Create Your Account Now →
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}