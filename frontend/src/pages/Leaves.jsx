import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, CheckCircle2, XCircle, Send, X } from 'lucide-react';
import api from '../services/api';

const Leaves = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  const [newLeave, setNewLeave] = useState({
    reason: '',
    start_date: '',
    end_date: '',
    applicant_type: user?.role === 'student' ? 'Student' : 'Teacher'
  });

  const [reviewNote, setReviewNote] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves/', {
        ...newLeave,
        applicant_id: user?.profile?.id || user?.id,
      });
      setIsModalOpen(false);
      setNewLeave({
        reason: '',
        start_date: '',
        end_date: '',
        applicant_type: user?.role === 'student' ? 'Student' : 'Teacher'
      });
      fetchLeaves();
    } catch (err) {
      alert('Failed to submit leave request');
    }
  };

  const openReviewModal = (leave, status) => {
    setSelectedLeave(leave);
    setNewStatus(status);
    setReviewNote('');
    setIsReviewModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/leaves/${selectedLeave.id}/`, { 
        status: newStatus,
        remarks: reviewNote,
        approved_by: user?.id 
      });
      setIsReviewModalOpen(false);
      fetchLeaves();
    } catch (err) {
      alert('Failed to update leave status');
    }
  };

  const canApprove = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Duty & Presence</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and monitor administrative absence requests</p>
        </div>
        {(user?.role === 'student' || user?.role === 'teacher') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 font-black text-gray-400 animate-pulse uppercase tracking-widest">Syncing Presence Data...</div>
        ) : leaves.length === 0 ? (
          <div className="col-span-full text-center py-20 font-black text-gray-400 uppercase tracking-widest">No active leave requests</div>
        ) : (
          leaves.map((leave) => (
            <div key={leave.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    leave.status === 'Approved' ? 'bg-green-50 text-green-600' : 
                    leave.status === 'Rejected' ? 'bg-red-50 text-red-600' : 
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {leave.status}
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    leave.applicant_type === 'Teacher' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {leave.applicant_type}
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase italic">{leave.start_date}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Leave Application</h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6 italic">"{leave.reason}"</p>
              
              {leave.remarks && (
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border-l-4 border-indigo-400">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Admin Note:</p>
                  <p className="text-[11px] font-bold text-gray-600 leading-tight">{leave.remarks}</p>
                </div>
              )}

              <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={14} className="text-gray-300" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{leave.end_date}</span>
                </div>
                {canApprove && leave.status === 'Pending' && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => openReviewModal(leave, 'Rejected')}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <XCircle size={18} />
                    </button>
                    <button 
                      onClick={() => openReviewModal(leave, 'Approved')}
                      className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Apply for Leave</h2>
            </div>
            <form onSubmit={handleApplyLeave} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Start Date</label>
                  <input
                    type="date" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({...newLeave, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">End Date</label>
                  <input
                    type="date" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({...newLeave, end_date: e.target.value})}
                  />
                </div>
              </div>
              <textarea
                required placeholder="Reason for Absence..." rows="4"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500 font-bold outline-none resize-none"
                value={newLeave.reason}
                onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
              />
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400">Dimiss</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 italic">
                  <span>Sign & Post</span>
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review (Approval) Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className={`p-10 border-b border-gray-100 ${newStatus === 'Approved' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Review Decision</h2>
              <p className={`text-xs font-black mt-1 uppercase tracking-widest ${newStatus === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>Target Action: {newStatus}</p>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Administrative Remarks (Note)</label>
                <textarea
                  required placeholder={newStatus === 'Approved' ? "e.g. Approved for medical reasons." : "e.g. Declined due to insufficient documentation."}
                  rows="4"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500 font-bold outline-none resize-none italic"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400">Cancel</button>
                <button 
                  type="submit" 
                  className={`flex-1 text-white py-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg ${newStatus === 'Approved' ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'} italic`}
                >
                  Confirm {newStatus}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
