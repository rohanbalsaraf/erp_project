import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import api from '../services/api';

const Fees = ({ user }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFees = async () => {
    try {
      const res = await api.get('/fees/');
      setFees(res.data);
    } catch (err) {
      console.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">FEE PORTAL</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage tuition and administrative dues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Fee List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-20 font-bold text-gray-400">Fetching financial records...</div>
          ) : fees.length === 0 ? (
            <div className="text-center py-20 font-bold text-gray-400">No pending dues found.</div>
          ) : (
            fees.map((fee) => (
              <div key={fee.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-6">
                  <div className={`p-4 rounded-2xl ${fee.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase tracking-tight">{fee.description}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Due: {fee.date_due}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8 text-right">
                  <div>
                    <p className="text-xl font-black text-gray-900">${fee.amount}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${fee.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>{fee.status}</span>
                  </div>
                  {fee.status !== 'Paid' && (
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-6">Wallet Balance</h3>
            <p className="text-5xl font-black tracking-tighter mb-2">$0.00</p>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">No credits available</p>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Add Funds</button>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-10 h-6 bg-gray-200 rounded-md" />
                <span className="text-xs font-bold text-gray-900">Visa ending in 4421</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fees;
