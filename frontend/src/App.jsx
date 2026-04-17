import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, Bell, Calendar, LogOut, Menu, X, Award } from 'lucide-react'
import Login from './pages/Login'
import StudentsList from './pages/StudentsList'
import AttendanceTracking from './pages/AttendanceTracking'
import FacultyManagement from './pages/FacultyManagement'
import NoticeBoard from './pages/NoticeBoard'
import Timetable from './pages/Timetable'
import ResultsView from './pages/ResultsView'
import api from './services/api'

// Simple Dashboard Component
const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({ present: 85, absent: 15, marks: 78 });
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Hello, {user?.username}. Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">Session 2024-25</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Stats Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Attendance Performance</h3>
            <div className="flex items-end space-x-4 h-48">
              {[60, 85, 45, 90, 75, 80, 95].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-indigo-50 rounded-2xl relative overflow-hidden h-full group-hover:bg-indigo-100 transition-colors">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-indigo-600 rounded-2xl transition-all duration-1000 ease-out"
                      style={{ height: `${val}%` }}
                    >
                      <div className="absolute top-2 left-0 w-full text-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}%
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-400 mt-3 group-hover:text-indigo-600 transition-colors">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-0"></div>
        </div>

        {/* Circular Progress Card */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <h3 className="text-xl font-bold mb-8">Semester Goal</h3>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80" cy="80" r="70"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                <circle
                  cx="80" cy="80" r="70"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="12"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * 78) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">78%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Complete</span>
              </div>
            </div>
            <p className="text-center text-sm font-medium opacity-80 leading-relaxed">
              You are 12% ahead of last month's academic performance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <Users className="text-indigo-600" />, label: 'Department', value: user?.profile?.department || 'N/A', bg: 'bg-indigo-50' },
          { icon: <BarChart3 className="text-pink-600" />, label: 'Avg Attendance', value: '88%', bg: 'bg-pink-50' },
          { icon: <Award className="text-orange-600" />, label: 'Credits Earned', value: '24', bg: 'bg-orange-50' },
          { icon: <Bell className="text-green-600" />, label: 'Unread Alerts', value: '3', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`p-3 w-fit rounded-2xl mb-4 ${stat.bg}`}>
              {stat.icon}
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

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
            { icon: <Calendar size={20} />, label: 'Timetable', path: '/timetable' },
            { icon: <Award size={20} />, label: 'Results', path: '/results' },
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
            <Route path="/students" element={<StudentsList />} />
            <Route path="/attendance" element={<AttendanceTracking user={user} />} />
            <Route path="/faculty" element={<FacultyManagement />} />
            <Route path="/notifications" element={<NoticeBoard user={user} />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/results" element={<ResultsView />} />
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
