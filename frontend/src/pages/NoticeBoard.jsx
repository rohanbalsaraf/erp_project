import { useState, useEffect } from 'react';
import { Bell, Plus, Calendar, Megaphone, Trash2, X } from 'lucide-react';
import api from '../services/api';

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', message: '' });

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotices(res.data);
    } catch (err) {
      console.error('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAddNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications/', newNotice);
      setIsModalOpen(false);
      setNewNotice({ title: '', message: '' });
      fetchNotices();
    } catch (err) {
      alert('Failed to post notice');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this announcement?')) return;
    try {
      await api.delete(`/notifications/${id}/`);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice. Only authorized Admins can perform this action.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-500 mt-1">Official announcements and college updates</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            <Plus size={20} />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Post New Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddNotice} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. End Semester Exam Schedule"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Type your message here..."
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({...newNotice, message: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-4">
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
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No active announcements</div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                    <div className="flex items-center text-gray-400 text-xs mt-1 font-medium">
                      <Calendar size={14} className="mr-1" />
                      {notice.date}
                    </div>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {notice.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
