import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Users, UserCog, Bell, Calendar, 
  LogOut, Menu, X, Award, FileText, ClipboardList, 
  Briefcase, CreditCard, MessageSquare 
} from 'lucide-react'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentsList from './pages/StudentsList'
import AttendanceTracking from './pages/AttendanceTracking'
import FacultyManagement from './pages/FacultyManagement'
import NoticeBoard from './pages/NoticeBoard'
import Timetable from './pages/Timetable'
import ResultsView from './pages/ResultsView'
import Assignments from './pages/Assignments'
import Projects from './pages/Projects'
import Fees from './pages/Fees'
import Leaves from './pages/Leaves'
import SalaryManagement from './pages/SalaryManagement'
import api from './services/api'

// Refined Dashboard Component with Real Data
const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard-stats/');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 font-bold text-gray-400 animate-pulse uppercase tracking-widest">Initialising Dash...</div>

  // Dynamic Metrics based on Role
  const metrics = user?.role === 'admin' ? [
    { label: 'Total Faculty', value: stats?.total_faculty, icon: <UserCog />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Students', value: stats?.total_students, icon: <Users />, color: 'bg-green-50 text-green-600' },
    { label: 'Staff Paid Out', value: `$${stats?.total_salary_paid || 0}`, icon: <CreditCard />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Doc Vault', value: stats?.total_documents, icon: <FileText />, color: 'bg-pink-50 text-pink-600' },
  ] : user?.role === 'teacher' ? [
    { label: 'My Students', value: stats?.my_students, icon: <Users />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Assignments', value: stats?.assignments_posted, icon: <ClipboardList />, color: 'bg-pink-50 text-pink-600' },
    { label: 'Projects', value: stats?.projects_tracked, icon: <Briefcase />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Attendance', value: stats?.attendance_avg, icon: <Award />, color: 'bg-green-50 text-green-600' },
  ] : [
    { label: 'Attendance', value: stats?.attendance, icon: <Award />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Dues/Fees', value: stats?.pending_fees, icon: <CreditCard />, color: 'bg-red-50 text-red-600' },
    { label: 'Projects', value: stats?.my_projects, icon: <Briefcase />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Assigned Work', value: stats?.pending_assignments, icon: <ClipboardList />, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">System Console</h1>
          <p className="text-gray-500 mt-2 font-black uppercase text-[10px] tracking-widest">Active Identity: <span className="text-indigo-600">{user?.username}</span> // Role: <span className="text-indigo-600">{user?.role}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <span className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Production v1.0.4</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
            <div className={`p-4 w-fit rounded-2xl mb-6 transition-all group-hover:scale-110 ${m.color}`}>
              {m.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
            <p className="text-3xl font-black text-gray-900">{m.value || 0}</p>
          </div>
        ))}
      </div>

      {/* Role-Specific Activity Chart Placeholder */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Analytical Trends</h3>
        <div className="flex items-end space-x-5 h-64">
          {[40, 70, 50, 90, 65, 85, 30].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-indigo-50/50 rounded-2xl relative overflow-hidden h-full">
                <div 
                  className="absolute bottom-0 left-0 w-full bg-indigo-600 rounded-2xl transition-all duration-1000 ease-out group-hover:bg-indigo-400"
                  style={{ height: `${val}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-gray-400 mt-4 uppercase">Day {i+1}</span>
            </div>
          ))}
        </div>
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
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black tracking-widest animate-pulse uppercase">Syncing Security Core...</div>

  // REFINED CRM ROLE MAPPING
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['admin', 'teacher', 'student'] },
    
    // ADMIN ONLY: Management & Staff
    { icon: <UserCog size={20} />, label: 'Faculty Management', path: '/faculty', roles: ['admin'] },
    { icon: <Users size={20} />, label: 'Student Accounts', path: '/students', roles: ['admin'] },
    { icon: <CreditCard size={20} />, label: 'Payroll & Salaries', path: '/salaries', roles: ['admin'] },
    { icon: <FileText size={20} />, label: 'Document Vault', path: '/documents', roles: ['admin'] },
    { icon: <MessageSquare size={20} />, label: 'Global Leaves', path: '/leaves', roles: ['admin'] },
    
    // TEACHER ONLY: Academic Core
    { icon: <Users size={20} />, label: 'My Students', path: '/students', roles: ['teacher'] },
    { icon: <Award size={20} />, label: 'Gradebook', path: '/results', roles: ['teacher'] },
    { icon: <ClipboardList size={20} />, label: 'Course Assignments', path: '/assignments', roles: ['teacher'] },
    { icon: <Briefcase size={20} />, label: 'Project Tracking', path: '/projects', roles: ['teacher'] },
    { icon: <Calendar size={20} />, label: 'Time Table Management', path: '/timetable', roles: ['teacher'] },
    { icon: <MessageSquare size={20} />, label: 'Leave Requests', path: '/leaves', roles: ['teacher'] },
    
    // STUDENT ONLY: Student Portal
    { icon: <Briefcase size={20} />, label: 'My Projects', path: '/projects', roles: ['student'] },
    { icon: <ClipboardList size={20} />, label: 'My Assignments', path: '/assignments', roles: ['student'] },
    { icon: <CreditCard size={20} />, label: 'Financials/Fees', path: '/fees', roles: ['student'] },
    { icon: <Award size={20} />, label: 'Academic Results', path: '/results', roles: ['student'] },
    { icon: <Calendar size={20} />, label: 'Time Table', path: '/timetable', roles: ['student'] },
    { icon: <MessageSquare size={20} />, label: 'Leave Requests', path: '/leaves', roles: ['student'] },
    
    // COMMON
    { icon: <Bell size={20} />, label: 'Bulletin Board', path: '/notifications', roles: ['admin', 'teacher', 'student'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm fixed h-full z-40`}>
        <div className="p-8 flex items-center justify-between">
          <span className={`font-black text-xl text-indigo-600 tracking-tighter uppercase ${!isSidebarOpen && 'hidden'}`}>ERP CORE</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.label} to={item.path}
              className="flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
            >
              <div className="transition-transform group-hover:scale-110">{item.icon}</div>
              {isSidebarOpen && <span className="font-bold text-[13px] tracking-tight">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">Terminate Session</span>}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-30">
          <h2 className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">Security Clearance: <span className="text-indigo-600">{user?.role}</span></h2>
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-gray-900 tracking-tight">{user?.username}</span>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">{user?.role}</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 uppercase">
              {user?.username?.substring(0, 2)}
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-50/50">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/students" element={<StudentsList user={user} />} />
            <Route path="/attendance" element={<AttendanceTracking user={user} />} />
            <Route path="/faculty" element={<FacultyManagement user={user} />} />
            <Route path="/notifications" element={<NoticeBoard user={user} />} />
            <Route path="/timetable" element={<Timetable user={user} />} />
            <Route path="/results" element={<ResultsView user={user} />} />
            <Route path="/assignments" element={<Assignments user={user} />} />
            <Route path="/projects" element={<Projects user={user} />} />
            <Route path="/leaves" element={<Leaves user={user} />} />
            <Route path="/fees" element={<Fees user={user} />} />
            <Route path="/salaries" element={<SalaryManagement user={user} />} />
            <Route path="/documents" element={<div className="p-12 font-black text-gray-300 uppercase tracking-widest text-xl">Operational Document Vault Active</div>} />
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
        <Route path="/register" element={<Register />} />
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
