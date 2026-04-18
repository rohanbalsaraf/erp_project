import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Upload, Plus, X, Trash2, Calendar, User as UserIcon, Tag } from 'lucide-react';

const DocumentManagement = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Form',
    file: null
  });

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    setNewDoc({ ...newDoc, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newDoc.file) {
      setError("Please select a file to upload.");
      return;
    }
    
    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('title', newDoc.title);
    formData.append('category', newDoc.category);
    formData.append('file', newDoc.file);

    try {
      await api.post('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Document successfully uploaded to Cloud Vault.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 2000);
      setNewDoc({ title: '', category: 'Form', file: null });
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const canUpload = user?.role === 'admin';

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase relative inline-block">
            Document Vault
            <span className="absolute -top-1 -right-4 w-3 h-3 bg-indigo-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-4 w-3 h-3 bg-indigo-500 rounded-full"></span>
          </h1>
          <p className="text-gray-500 mt-2 font-bold text-sm">Secure Centralized Cloud File Repository</p>
        </div>
        
        {canUpload && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-indigo-200"
          >
            <Upload size={18} />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <FileText size={80} className="text-indigo-500 transform rotate-12 -translate-y-4 translate-x-4" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider rounded-lg">
                  {doc.category}
                </span>
                <span className="text-xs font-bold text-gray-400 flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {new Date(doc.date_uploaded).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-2 truncate">{doc.title}</h3>
              <p className="text-sm text-gray-500 font-bold flex items-center mb-6">
                <UserIcon size={14} className="mr-2" />
                Uploaded by Admin ID: {doc.uploaded_by}
              </p>
              
              <div className="flex space-x-3 mt-4">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-gray-50 text-indigo-600 font-black py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors border border-gray-100"
                >
                  View File
                </a>
              </div>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <FileText className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Vault is Empty</h3>
            <p className="text-slate-500 font-medium">No documents have been securely uploaded to the cloud yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && canUpload && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Upload File</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center">
                <span className="mr-2">✓</span> {success}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Document Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder="e.g. 2026 Academic Calendar"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Category</label>
                <select
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold appearance-none"
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                >
                  <option value="Policies">Policies</option>
                  <option value="Form">Official Forms</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Guidelines">Guidelines</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Physical File</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all text-sm font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-8 bg-indigo-600 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-widest text-xs hover:bg-slate-900 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {uploading ? (
                  <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Push to Cloud Vault'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
