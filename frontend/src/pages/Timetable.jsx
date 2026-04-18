import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Layers, Plus, X, Send } from 'lucide-react';
import api from '../services/api';

const Timetable = ({ user }) => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    time: '',
    course: '',
    room: '',
    department: user?.profile?.department || ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable/');
      setTimetable(res.data);
    } catch (err) {
      console.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // Sync department when user profile loads
  useEffect(() => {
    if (user?.profile?.department) {
      setNewSlot(prev => ({ ...prev, department: user.profile.department }));
    }
  }, [user]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      if (!newSlot.department) {
        alert('Please select a department.');
        return;
      }
      await api.post('/timetable/', newSlot);
      setIsModalOpen(false);
      setNewSlot({
        day: 'Monday',
        time: '',
        course: '',
        room: '',
        department: user?.profile?.department || ''
      });
      fetchTimetable();
    } catch (err) {
      const errorMsg = err.response?.data ? Object.values(err.response.data)[0] : 'Failed to add timetable slot';
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Weekly Schedule</h1>
          <p className="text-gray-500 mt-1 font-medium">Your academic timetable filtered by department</p>
        </div>
        {user?.role === 'teacher' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Manage Schedule</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {days.map((day) => {
          const dayLessons = timetable.filter(item => item.day === day);
          return (
            <div key={day} className="space-y-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                <Calendar size={14} />
                <span>{day}</span>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="h-24 bg-gray-50 rounded-2xl animate-pulse"></div>
                ) : dayLessons.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-100 rounded-[2rem] text-center flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Free Day</p>
                    <div className="w-1 h-1 bg-gray-200 rounded-full mt-2" />
                  </div>
                ) : (
                  dayLessons.map((lesson) => (
                    <div key={lesson.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-indigo-600 px-3 py-1 bg-indigo-50 rounded-xl uppercase tracking-widest">
                          {lesson.room}
                        </span>
                        <div className="flex items-center text-gray-400 text-[9px] font-black uppercase tracking-tighter">
                          <Clock size={12} className="mr-1" />
                          {lesson.time}
                        </div>
                      </div>
                      <h4 className="font-black text-gray-900 text-xs mb-3 uppercase tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{lesson.course}</h4>
                      <div className="flex items-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        <Layers size={14} className="mr-1" />
                        {lesson.department}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Schedule Management</h2>
            </div>
            <form onSubmit={handleAddSlot} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Day</label>
                  <select
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Time</label>
                  <input
                    type="text"
                    required
                    placeholder="9:00 AM - 10:00 AM"
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
                  />
                </div>
              </div>
              <input
                type="text"
                required
                placeholder="Course Subject (e.g. Data Structures)"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase"
                value={newSlot.course}
                onChange={(e) => setNewSlot({...newSlot, course: e.target.value})}
              />
              <input
                type="text"
                required
                placeholder="Room / Lab (e.g. Lab 402)"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase"
                value={newSlot.room}
                onChange={(e) => setNewSlot({...newSlot, room: e.target.value})}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Department</label>
                <select
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                  value={newSlot.department}
                  onChange={(e) => setNewSlot({...newSlot, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Tech">Information Tech</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2">
                  <span>Register Slot</span>
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
