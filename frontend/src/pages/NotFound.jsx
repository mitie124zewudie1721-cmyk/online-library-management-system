import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-9xl md:text-[14rem] font-extrabold text-gray-200">404</h1>
                    <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mt-6 mb-8">
                        Page Not Found
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white font-bold py-5 px-12 rounded-full text-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-2xl"
                    >
                        Return to Home
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}