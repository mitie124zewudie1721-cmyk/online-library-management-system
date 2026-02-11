// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// ─── Layout Components ───────────────────────────────────────────────
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// ─── Public Pages (no login required) ────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// ─── Protected Pages (any logged-in user) ────────────────────────────
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import BorrowedBooks from './pages/BorrowedBooks';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile'; // ← ADD THIS LINE (fix for the error)

// ─── Staff Pages (admin + librarian) ─────────────────────────────────
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';

// ─── Admin Pages ──────────────────────────────────────────────────────
import ManageBooks from './pages/admin/ManageBooks';
import AdminOverdueBorrows from './pages/admin/AdminOverdueBorrows';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPendingUpdates from './pages/admin/AdminPendingUpdates';

// ─── 404 Page ────────────────────────────────────────────────────────
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar – fixed on large screens */}
          <Sidebar />

          {/* Main content area – pushed right by sidebar on desktop */}
          <div className="flex-1 flex flex-col md:ml-64">
            {/* Top Navbar */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <Routes>
                {/* ─── Public Routes ─── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ─── Protected Routes – requires login ─── */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/books/:id" element={<BookDetails />} />
                  <Route path="/borrowed" element={<BorrowedBooks />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} /> {/* ← Edit profile page */}
                </Route>

                {/* ─── Staff Routes – admin or librarian only ─── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'librarian']} />}>
                  <Route path="/add-book" element={<AddBook />} />
                  <Route path="/edit-book/:id" element={<EditBook />} />
                  <Route path="/manage-books" element={<ManageBooks />} />
                  <Route path="/profile/:id" element={<Profile />} /> {/* View any user profile */}
                </Route>

                {/* ─── Admin-only Routes – admin only ─── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'librarian']} />}>
                  <Route path="/admin/overdue" element={<AdminOverdueBorrows />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  {/* Keep pending-updates admin-only if you want */}
                  <Route path="/admin/pending-updates" element={<AdminPendingUpdates />} />
                </Route>

                {/* ─── Catch-all 404 – must be last ─── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;