import { useState, useEffect } from 'react';
import { UserCog, Search, Plus, MoreVertical, Mail, Phone, BookOpen, GraduationCap } from 'lucide-react';
import api from '../services/api';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: '',
  });

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty/');
      setFaculty(res.data);
    } catch (err) {
      console.error('Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty/', newFaculty);
      setIsModalOpen(false);
      setNewFaculty({ employee_id: '', name: '', email: '', department: '' });
      fetchFaculty();
    } catch (err) {
      alert('Failed to add faculty');
    }
  };

  const filteredFaculty = faculty.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-500 mt-1">Manage all instructors and department staff</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Add Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Add New Faculty</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Search size={20} className="rotate-45" /> {/* Using Search as X surrogate here, will fix with X in next pass if needed */}
              </button>
            </div>
            
            <form onSubmit={handleAddFaculty} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. EMP101"
                  value={newFaculty.employee_id}
                  onChange={(e) => setNewFaculty({...newFaculty, employee_id: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Prof. Jane Smith"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="jane.smith@college.edu"
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newFaculty.department}
                  onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search faculty..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-semibold">
                <th className="px-6 py-4">Faculty Info</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Loading faculty...</td></tr>
              ) : filteredFaculty.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <GraduationCap size={16} />
                      <span className="text-sm font-medium">{member.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Mail size={12} />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;
