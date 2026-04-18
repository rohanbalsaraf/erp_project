import { useState, useEffect } from 'react';
import { DollarSign, Search, Plus, Calendar, User, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newSalary, setNewSalary] = useState({
    user: '',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    status: 'Paid'
  });

  const fetchData = async () => {
    try {
      const [salaryRes, staffRes] = await Promise.all([
        api.get('/salaries/'),
        api.get('/faculty/') // Fetch teachers to populate the user dropdown
      ]);
      setSalaries(salaryRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSalary = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/salaries/', newSalary);
      setSuccess('Salary disbursement recorded successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
      }, 3000);
      setNewSalary({
        user: '',
        amount: '',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        status: 'Paid'
      });
      fetchData();
    } catch (err) {
      setError('Failed to record salary. Please check the details.');
    }
  };

  const totalPaid = salaries.reduce((acc, curr) => 
    curr.status === 'Paid' ? acc + parseFloat(curr.amount) : acc, 0
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500 mt-1">Track and manage salary disbursements for staff</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={20} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Paid Out</p>
              <p className="text-2xl font-bold text-gray-900">${totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by staff name..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-semibold">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Loading payroll...</td></tr>
              ) : salaries.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No records found</td></tr>
              ) : (
                salaries.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{record.full_name}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">${parseFloat(record.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{record.month}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(record.payment_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Record New Payment</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSalary} className="p-8 space-y-6">
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-600">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff Member</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={newSalary.user}
                  onChange={(e) => setNewSalary({...newSalary, user: e.target.value})}
                >
                  <option value="">Select Staff</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.user}>{s.name} ({s.employee_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="0.00"
                  value={newSalary.amount}
                  onChange={(e) => setNewSalary({...newSalary, amount: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Month</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. April 2026"
                  value={newSalary.month}
                  onChange={(e) => setNewSalary({...newSalary, month: e.target.value})}
                />
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
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;
