import { useState, useEffect } from 'react';
import { Briefcase, Plus, Send, Activity, CheckCircle2, Circle, X } from 'lucide-react';
import api from '../services/api';

const Projects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    student: user?.profile?.id || ''
  });
  const [updateData, setUpdateData] = useState({
    status: '',
    track_details: ''
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApplyProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects/', {
        ...newProject,
        student: user?.profile?.id
      });
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to submit project proposal');
    }
  };

  const handleOpenUpdate = (proj) => {
    setSelectedProject(proj);
    setUpdateData({
      status: proj.status,
      track_details: proj.track_details || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleOpenJournal = (proj) => {
    setSelectedProject(proj);
    setIsJournalModalOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/projects/${selectedProject.id}/`, updateData);
      setIsUpdateModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to update project progress');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Project Tracking</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitor milestones and submissions</p>
        </div>
        {user?.role === 'student' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Propose Project</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 font-black text-gray-400 animate-pulse uppercase tracking-widest">Syncing Data Core...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 font-black text-gray-400 uppercase tracking-widest">No projects currently tracked</div>
        ) : (
          projects.map((proj) => (
            <div key={proj.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-8 group hover:border-indigo-200 transition-all">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Briefcase size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{proj.title}</h3>
                  {user?.role === 'teacher' && (
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-tighter italic">
                      {proj.student_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                    proj.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                    proj.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <div className="mt-6 flex items-center space-x-6">
                  <div className="h-1.5 flex-1 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${proj.status === 'Completed' ? 'bg-green-500 w-full' : proj.status === 'In Progress' ? 'bg-indigo-600 w-1/2' : 'bg-orange-400 w-1/4'}`} 
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">{proj.status === 'Completed' ? '100%' : proj.status === 'In Progress' ? '50%' : '25%'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {user?.role === 'student' && (
                  <button 
                    onClick={() => handleOpenUpdate(proj)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    Update Progress
                  </button>
                )}
                {user?.role === 'teacher' && (
                  <button 
                    onClick={() => handleOpenJournal(proj)}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                  >
                    View Journal
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Project Proposal</h2>
            </div>
            <form onSubmit={handleApplyProject} className="p-8 space-y-6">
              <input
                type="text" required placeholder="Project Title"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none uppercase"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <textarea
                required placeholder="Scope & Objectives" rows="4"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none resize-none"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600">Dismiss</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-tighter">Update Progress</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Editing: {selectedProject?.title}</p>
            </div>
            <form onSubmit={handleUpdateProject} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Project Phase</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none italic"
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                >
                  <option value="Proposed">Proposed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Update Track Journal</label>
                <textarea
                  placeholder="What did you achieve today?" rows="4"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500 font-bold outline-none resize-none"
                  value={updateData.track_details}
                  onChange={(e) => setUpdateData({...updateData, track_details: e.target.value})}
                />
              </div>
              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 italic">Sync Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Journal Modal (Teacher View) */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Track Journal</h2>
                <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-widest leading-none">Reviewing: {selectedProject?.student_name}</p>
              </div>
              <button 
                onClick={() => setIsJournalModalOpen(false)}
                className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Overview</label>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedProject?.title}</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{selectedProject?.description}</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                  <Activity size={12} className="text-indigo-500" />
                  <span>Student Applied Journal</span>
                </label>
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 relative">
                  <span className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Recent Log</span>
                  <p className="text-slate-900 font-bold italic leading-relaxed">
                    "{selectedProject?.track_details || 'No journal entries provided for this phase.'}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                  <p className="text-sm font-black text-slate-900 uppercase mt-1">{selectedProject?.status}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership</p>
                  <p className="text-sm font-black text-slate-900 uppercase mt-1">{selectedProject?.student_name}</p>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/30">
              <button 
                onClick={() => setIsJournalModalOpen(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-100"
              >
                Confirm Review Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
