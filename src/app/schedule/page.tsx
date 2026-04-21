'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Calendar, 
  Plus, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import Link from 'next/link';
import { storageService } from '@/lib/storage/storageService';
import { Job, JobStatus } from '@/domain/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    setJobs(storageService.getJobs());
  }, []);

  const jobsWithDates = jobs.filter(j => j.targetStartDate || j.targetCompletionDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const jobsOnDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return jobsWithDates.filter(j => j.targetStartDate?.startsWith(dateStr));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'in progress': return 'bg-green-500';
      case 'lead': return 'bg-blue-500';
      case 'estimating': return 'bg-purple-500';
      case 'approved': return 'bg-indigo-500';
      case 'on hold': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-[var(--text-muted)]">View project timelines and upcoming dates.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </header>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-[var(--primary-subtle)] rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold w-48 text-center">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-[var(--primary-subtle)] rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg"
          >
            Today
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[var(--border-subtle)]">
          {DAYS.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayJobs = day ? jobsOnDay(day) : [];
            const isToday = day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={idx} 
                className={`min-h-24 border-b border-r border-[var(--border-subtle)] p-1 ${
                  day === null ? 'bg-[var(--bg-app)]' : ''
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium p-1 ${
                      isToday ? 'bg-[var(--primary)] text-white rounded-full w-7 h-7 flex items-center justify-center' : ''
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayJobs.slice(0, 3).map((job) => (
                        <div 
                          key={job.id}
                          className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${getStatusColor(job.status)}`}
                          title={job.title}
                        >
                          {job.title}
                        </div>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-[10px] text-[var(--text-muted)]">
                          +{dayJobs.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Upcoming Events" className="mt-6">
        <div className="space-y-3">
          {jobsWithDates
            .sort((a, b) => new Date(a.targetStartDate || '').getTime() - new Date(b.targetStartDate || '').getTime())
            .slice(0, 5)
            .map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-[var(--bg-app)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-lg flex items-center justify-center text-[var(--primary)]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                      <Clock size={12} />
                      {job.targetStartDate && new Date(job.targetStartDate).toLocaleDateString()}
                      {job.targetCompletionDate && ` - ${new Date(job.targetCompletionDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <Badge variant="info">{job.status}</Badge>
              </div>
            ))}
          {jobsWithDates.length === 0 && (
            <p className="text-center text-[var(--text-muted)] py-8">
              No upcoming events scheduled.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}