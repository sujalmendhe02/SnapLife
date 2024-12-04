import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import Register from './pages/Register';
import Search from './pages/Search';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateBlog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;