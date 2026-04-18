import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Assignments = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
    department: user?.profile?.department || ''
  });
  const [submissionData, setSubmissionData] = useState({
    submission_note: '',
    file_link: ''
  });

  const fetchAssignments = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        api.get('/assignments/'),
        api.get('/submissions/')
      ]);
      setAssignments(assignRes.data);
      setSubmissions(subRes.data);
    } catch (err) {
      console.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments/', {
        ...newAssignment,
        teacher: user?.profile?.id,
      });
      setIsModalOpen(false);
      fetchAssignments();
    } catch (err) {
      alert('Failed to post assignment');
    }
  };

  const handleOpenSubmit = (task) => {
    setSelectedAssignment(task);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/submissions/', {
        assignment: selectedAssignment.id,
        student: user?.profile?.id,
        ...submissionData
      });
      setIsSubmitModalOpen(false);
      setSubmissionData({ submission_note: '', file_link: '' });
      fetchAssignments();
    } catch (err) {
      alert('Failed to submit assignment');
    }
  };

  const isCompleted = (assignId) => submissions.some(s => s.assignment === assignId);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Academic Vault</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage assignments and task submissions</p>
        </div>
        {user?.role === 'teacher' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Post New Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-20 font-black text-gray-400 animate-pulse uppercase tracking-widest">Initialising Tasks...</div>
        ) : assignments.length === 0 ? (
          <div className="col-span-2 text-center py-20 font-black text-gray-400 uppercase tracking-widest">No active assignments</div>
        ) : (
          assignments.map((task) => {
            const completed = isCompleted(task.id);
            return (
              <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl transition-all ${completed ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <ClipboardList size={24} />
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${completed ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {completed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    <span>{completed ? 'Completed' : `Due: ${new Date(task.deadline).toLocaleDateString()}`}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">{task.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-8 font-bold uppercase tracking-wide line-clamp-2">
                  {task.description}
                </p>
                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white uppercase">
                      TR
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department: {task.department}</span>
                  </div>
                  {user?.role === 'student' && !completed && (
                    <button 
                      onClick={() => handleOpenSubmit(task)}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all italic"
                    >
                      Turn In Task
                    </button>
                  )}
                  {completed && (
                    <span className="text-green-600 font-black text-[10px] uppercase tracking-widest italic flex items-center">
                      <CheckCircle size={14} className="mr-1" /> Submitted
                    </span>
                  )}
                  {user?.role === 'teacher' && (
                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline italic">View Submissions</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Teacher: Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Post New Assignment</h2>
            </div>
            <form onSubmit={handleAddAssignment} className="p-8 space-y-6">
              <input
                type="text" required placeholder="Task Title"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
              />
              <textarea
                required placeholder="Instructions for Students" rows="4"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none resize-none"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">DeadLine</label>
                <input
                  type="datetime-local" required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 italic">Broadcast Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student: Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Turn In Work</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Submitting for: {selectedAssignment?.title}</p>
            </div>
            <form onSubmit={handleSubmitAssignment} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Work Link (URL)</label>
                <input
                  type="url" required placeholder="https://google.drive/your-link"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                  value={submissionData.file_link}
                  onChange={(e) => setSubmissionData({...submissionData, file_link: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Submission Note</label>
                <textarea
                  placeholder="Additional context for your teacher..." rows="3"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500 font-bold outline-none resize-none"
                  value={submissionData.submission_note}
                  onChange={(e) => setSubmissionData({...submissionData, submission_note: e.target.value})}
                />
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400">Recall</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 italic">
                  <span>Sign & Submit</span>
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

export default Assignments;
