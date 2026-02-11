// frontend/src/components/common/Footer.jsx
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Library MS</h3>
                        <p className="text-sm">
                            A modern library management system built with MERN stack.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-white">Home</a></li>
                            <li><a href="/books" className="hover:text-white">Books</a></li>
                            <li><a href="/login" className="hover:text-white">Login</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                        <p className="text-sm">
                            Email: support@libraryms.com<br />
                            © {new Date().getFullYear()} Library Management System
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;