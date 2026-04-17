import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, Bell, Calendar, LogOut, Menu, X } from 'lucide-react'
import Login from './pages/Login'
import api from './services/api'

// Simple Dashboard Component
const DashboardHome = ({ user }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.username}</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">Role</h3>
        <p className="text-2xl font-bold text-gray-900 capitalize">{user?.role}</p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-pink-50 rounded-lg">
            <Calendar className="w-6 h-6 text-pink-600" />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">Department</h3>
        <p className="text-2xl font-bold text-gray-900">{user?.profile?.department || 'N/A'}</p>
      </div>
    </div>
  </div>
)

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/profile/')
        setUser(res.data)
      } catch (err) {
        console.error('Failed to fetch user')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <span className={`font-bold text-xl text-indigo-600 ${!isSidebarOpen && 'hidden'}`}>ERP Portal</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {[
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
            { icon: <Users size={20} />, label: 'Students', path: '/students' },
            { icon: <UserCog size={20} />, label: 'Faculty', path: '/faculty' },
            { icon: <Calendar size={20} />, label: 'Attendance', path: '/attendance' },
            { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title={item.label}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-gray-500 font-medium">System Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
              {user?.username?.substring(0, 2)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/students" element={<div className="p-6">Students Management Coming Soon</div>} />
            <Route path="/faculty" element={<div className="p-6">Faculty Management Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <AppContent />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App

export default App
