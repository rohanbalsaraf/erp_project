import { useState, useEffect } from 'react';
import { Users, Search, Plus, MoreVertical, Mail, Phone, BookOpen, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const StudentsList = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    enrollment_id: '',
    name: '',
    email: '',
    phone: '',
    department: user?.profile?.department || '',
    division: '',
    category: ''
  });

  const [sortData, setSortData] = useState({
    division: ''
  });

  // PRE-FILL DEPARTMENT IF USER IS RESTRICTED
  useEffect(() => {
    if (user?.profile?.department) {
      setNewStudent(prev => ({ ...prev, department: user.profile.department }));
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...newStudent };
      if (user?.role !== 'admin' && user?.profile?.department) {
        payload.department = user.profile.department;
      }

      await api.post('/students/', payload);
      setSuccess('Student admitted! Credentials sent.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 2000);
      setNewStudent({
        student_id: '',
        enrollment_id: '',
        name: '',
        email: '',
        phone: '',
        department: user?.profile?.department || '',
        division: '',
        category: ''
      });
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data)[0] : 'Failed to add student';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleUpdateDivision = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.patch(`/students/${selectedStudent.id}/`, {
        division: sortData.division
      });
      setSuccess('Division assigned successfully!');
      setTimeout(() => {
        setIsSortModalOpen(false);
        setSuccess('');
      }, 1500);
      fetchStudents();
    } catch (err) {
      setError('Failed to update division');
    }
  };

  const openSortModal = (student) => {
    setSelectedStudent(student);
    setSortData({ division: student.division || '' });
    setIsSortModalOpen(true);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Admit and manage students' : 'Sort students into divisions'}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            <span>New Admission</span>
          </button>
        )}
      </div>

      {/* Add Student Modal (Admin Only) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Primary Admission</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-8 space-y-6">
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3 text-green-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold">{success}</span>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-600">
                  <X size={16} />
                  <span className="text-sm font-bold">{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold tracking-tight uppercase text-[10px]">Enrollment Number (10th/12th/Diploma)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. ENR78954"
                    value={newStudent.enrollment_id}
                    onChange={(e) => setNewStudent({...newStudent, enrollment_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold tracking-tight uppercase text-[10px]">Student ID (Login ID)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. STU123"
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold tracking-tight uppercase text-[10px]">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="John Doe"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold tracking-tight uppercase text-[10px]">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="john@college.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold tracking-tight uppercase text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="+91 1234567890"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold tracking-tight uppercase text-[10px]">Department</label>
                  <select
                    required
                    disabled={user?.role !== 'admin' && !!user?.profile?.department}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${user?.role !== 'admin' && user?.profile?.department ? 'bg-gray-100' : 'bg-gray-50'}`}
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  >
                    <option value="">Select Branch</option>
                    <option value="Computer Science">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sort / Division Modal (Teacher/Admin) */}
      {isSortModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-indigo-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
              <div>
                <h2 className="text-xl font-bold text-indigo-900 truncate">Assign Division</h2>
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">{selectedStudent?.name}</p>
              </div>
              <button onClick={() => setIsSortModalOpen(false)} className="p-2 hover:bg-white rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDivision} className="p-8 space-y-6">
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3 text-green-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold">{success}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 tracking-tight uppercase text-[10px]">Select Division for {selectedStudent?.department}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setSortData({ division: div })}
                      className={`py-3 rounded-xl font-bold transition-all border-2 ${
                        sortData.division === div 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-gray-50 border-transparent text-gray-600 hover:border-indigo-200 hover:bg-white'
                      }`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 transform hover:-translate-y-1"
                >
                  Update Student Scope
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID or Enrollment..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-semibold">
                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Identity</th>
                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Academic Dept</th>
                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Enrollment ID</th>
                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Division</th>
                <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 uppercase font-bold tracking-widest animate-pulse">Synchronizing Student Data...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No students found in your scope.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-indigo-100">
                          {student.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{student.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-none mt-1">{student.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <BookOpen size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold text-gray-700">{student.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {student.enrollment_id || 'NOT_SET'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${student.division ? 'bg-indigo-100 text-indigo-700' : 'bg-red-50 text-red-500 italic'}`}>
                        {student.division || 'Unsorted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isTeacher && (
                        <button 
                          onClick={() => openSortModal(student)}
                          className="px-4 py-2 bg-white border border-gray-200 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                        >
                          Sort
                        </button>
                      )}
                      {isAdmin && (
                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
                          <MoreVertical size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
