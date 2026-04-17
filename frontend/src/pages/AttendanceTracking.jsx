import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Filter, Users, Search } from 'lucide-react';
import api from '../services/api';

const AttendanceTracking = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'student' ? 'view' : 'mark');
  const [selectedCourse, setSelectedCourse] = useState('Computer Networks');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, studentsRes] = await Promise.all([
          api.get('/attendance/'),
          user?.role !== 'student' ? api.get('/students/') : Promise.resolve({ data: [] })
        ]);
        setAttendance(attendanceRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleMarkAttendance = async (studentId, status) => {
    try {
      const payload = {
        student: studentId,
        date: new Date().toISOString().split('T')[0],
        course: selectedCourse,
        status: status,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      await api.post('/attendance/', payload);
      // Refresh list
      const res = await api.get('/attendance/');
      setAttendance(res.data);
    } catch (err) {
      alert('Failed to mark attendance');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-500 mt-1">
            {user?.role === 'student' ? 'View your daily attendance records' : 'Mark and manage student attendance'}
          </p>
        </div>
      </div>

      {user?.role !== 'student' && (
        <div className="flex space-x-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('mark')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'mark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Mark Attendance
          </button>
          <button 
            onClick={() => setActiveTab('view')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'view' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Summary View
          </button>
        </div>
      )}

      {activeTab === 'mark' ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-4">
              <select 
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option>Computer Networks</option>
                <option>Operating Systems</option>
                <option>DBMS</option>
                <option>Theory of Computation</option>
              </select>
              <div className="text-sm text-gray-500 font-medium">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status Today</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const todayRecord = attendance.find(a => a.student === student.id && a.date === new Date().toISOString().split('T')[0]);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.student_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {todayRecord ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${todayRecord.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {todayRecord.status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleMarkAttendance(student.id, 'Present')}
                            className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all rounded-lg"
                            title="Mark Present"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button 
                            onClick={() => handleMarkAttendance(student.id, 'Absent')}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all rounded-lg"
                            title="Mark Absent"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendance.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${record.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {record.status === 'Present' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{record.course}</h3>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 text-xs font-medium">
                  <Clock size={14} className="mr-1" />
                  {record.time}
                </div>
              </div>
              {user?.role !== 'student' && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Student ID: {record.student}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;
