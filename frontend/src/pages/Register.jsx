import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, ChevronRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    admin_key: '',
    role: 'Super Admin',
    department: 'Administration',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/register/', formData);
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        const errorMsg = Object.values(err.response.data)[0];
        setError(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
      } else {
        setError('Registration failed. Please verify your Admin Key.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 md:p-14">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Admin Console</h3>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60">Secure Onboarding</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-xs mb-8 border border-red-100 font-bold flex items-center space-x-3">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Username</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="admin_root"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="admin@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Role</label>
                <select
                  className="w-full pl-6 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Registrar">Registrar</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                <select
                  className="w-full pl-6 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold appearance-none"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Administration">Administration</option>
                  <option value="Admissions">Admissions</option>
                  <option value="Accounts">Accounts</option>
                  <option value="IT Services">IT Services</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Admin Verification Key</label>
              <div className="relative text-indigo-600">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-indigo-50/50 border border-indigo-100 rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all text-sm font-black placeholder:text-indigo-200"
                  placeholder="ENTER SECRET KEY"
                  value={formData.admin_key}
                  onChange={(e) => setFormData({ ...formData, admin_key: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-slate-900 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 mt-10 active:scale-95"
            >
              {loading ? (
                <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">Verify & Initialize Account</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Institutional Access Only</p>
            <Link to="/login" className="text-indigo-600 font-black text-sm hover:text-slate-900 transition-colors uppercase tracking-widest">Return to Secure Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
