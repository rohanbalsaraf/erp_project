import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, Layers } from 'lucide-react';
import api from '../services/api';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
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
    fetchTimetable();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
        <p className="text-gray-500 mt-1">Your academic timetable filtered by department</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {days.map((day) => {
          const dayLessons = timetable.filter(item => item.day === day);
          return (
            <div key={day} className="space-y-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm uppercase tracking-wider">
                <Calendar size={16} />
                <span>{day}</span>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="h-24 bg-gray-50 rounded-2xl animate-pulse"></div>
                ) : dayLessons.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                    <p className="text-xs text-gray-400">No classes</p>
                  </div>
                ) : (
                  dayLessons.map((lesson) => (
                    <div key={lesson.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                          {lesson.room}
                        </span>
                        <div className="flex items-center text-gray-400 text-[10px] font-bold uppercase">
                          <Clock size={12} className="mr-1" />
                          {lesson.time}
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-2">{lesson.course}</h4>
                      <div className="flex items-center text-xs text-gray-500">
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
    </div>
  );
};

export default Timetable;
