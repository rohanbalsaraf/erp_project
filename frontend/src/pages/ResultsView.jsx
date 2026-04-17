import { useState, useEffect } from 'react';
import { GraduationCap, Award, BookOpen, BarChart3, ChevronRight } from 'lucide-react';
import api from '../services/api';

const ResultsView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results/');
        setResults(res.data);
      } catch (err) {
        console.error('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const semesters = [...new Set(results.map(r => r.semester))].sort();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Academic Results</h1>
        <p className="text-gray-500 mt-1">Track your semester performance and grades</p>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading results...</div>
        ) : semesters.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No results published yet</div>
        ) : (
          semesters.map(sem => (
            <div key={sem} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <GraduationCap size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Semester {sem}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium">Average Grade</p>
                    <p className="text-lg font-bold text-indigo-600">A</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-8 py-4">Subject</th>
                      <th className="px-8 py-4">Marks</th>
                      <th className="px-8 py-4">Grade</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.filter(r => r.semester === sem).map(result => (
                      <tr key={result.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-3">
                            <BookOpen size={16} className="text-gray-400" />
                            <span className="font-bold text-gray-900">{result.subject}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-gray-600 font-medium">{result.marks}/100</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.grade === 'F' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest flex items-center">
                            Passed <Award size={14} className="ml-1.5 text-yellow-500" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResultsView;
