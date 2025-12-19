
import React from 'react';
import { User, Task, TaskStatus } from '../types';
import { StatusBadge } from './TeamDashboard';

interface MyTasksProps {
  currentUser: User;
  tasks: Task[];
}

const MyTasks: React.FC<MyTasksProps> = ({ currentUser, tasks }) => {
  const myTasks = tasks.filter(t => t.ownerId === currentUser.id);

  // Gantt Chart logic (기존과 동일하되 myTasks 사용)
  const minDate = myTasks.length > 0 ? new Date(Math.min(...myTasks.map(t => new Date(t.startDate).getTime()))) : new Date();
  const maxDate = myTasks.length > 0 ? new Date(Math.max(...myTasks.map(t => new Date(t.endDate).getTime()))) : new Date();
  
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 5);

  const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    const offset = Math.ceil((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return (offset / diffDays) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const duration = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return (duration / diffDays) * 100;
  };

  const dates = [];
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(minDate);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentUser.name} 님의 업무</h1>
          <p className="text-gray-500 text-sm">팀 공통 클라우드에서 배정된 태스크입니다.</p>
        </div>
        <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase tracking-widest">
          Cloud Synced
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">태스크 리스트</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {myTasks.length > 0 ? myTasks.map(task => (
              <div key={task.id} className="p-5 hover:bg-indigo-50/30 transition-colors flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{task.title}</h4>
                  <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-tighter">{task.projectName} | {task.client}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">{task.startDate} ~ {task.endDate}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            )) : (
              <div className="p-20 text-center text-gray-300 font-medium">배정된 태스크가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">간트 차트 (일정)</h2>
          </div>
          <div className="p-5 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex mb-4 border-b border-gray-100 pb-2">
                <div className="w-1/4 text-[10px] font-black text-gray-300 uppercase">Task Name</div>
                <div className="flex-1 flex text-[9px] font-bold text-gray-300">
                  {dates.map((d, i) => (
                    <div key={i} className={`flex-1 text-center border-l border-gray-50 ${d.getDay() === 0 ? 'text-red-300' : ''}`}>
                      {d.getDate() === 1 ? `${d.getMonth() + 1}/${d.getDate()}` : d.getDate()}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {myTasks.map(task => (
                  <div key={task.id} className="flex items-center group">
                    <div className="w-1/4 pr-4 truncate text-xs font-bold text-gray-600 group-hover:text-indigo-600 transition-colors" title={task.title}>
                      {task.title}
                    </div>
                    <div className="flex-1 relative h-6 bg-gray-50/50 rounded-full border border-gray-100">
                      <div 
                        className={`absolute h-full rounded-full shadow-sm flex items-center px-2 overflow-hidden text-[8px] text-white font-black transition-all hover:scale-[1.02]
                          ${task.status === TaskStatus.DONE ? 'bg-green-500' : task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-indigo-400'}
                        `}
                        style={{
                          left: `${getPosition(task.startDate)}%`,
                          width: `${getWidth(task.startDate, task.endDate)}%`,
                        }}
                      >
                        <span className="truncate uppercase">{task.projectName}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {myTasks.length === 0 && <div className="py-20 text-center text-gray-300 text-xs">데이터 없음</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
