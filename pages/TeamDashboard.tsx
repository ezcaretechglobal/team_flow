
import React, { useState } from 'react';
import { Project, Task, TaskStatus } from '../types';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
}

const TeamDashboard: React.FC<DashboardProps> = ({ projects, tasks }) => {
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const owners = Array.from(new Set([...projects.map(p => p.ownerName), ...tasks.map(t => t.ownerName)]));

  const filteredTasks = tasks.filter(task => {
    const ownerMatch = selectedOwner === 'all' || task.ownerName === selectedOwner;
    const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
    return ownerMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">전체 대시보드</h1>
          <p className="text-gray-500 text-sm">구글 시트를 기반으로 모든 팀원의 상황을 동기화합니다.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 py-2"
          >
            <option value="all">모든 담당자</option>
            {owners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 py-2"
          >
            <option value="all">모든 상태</option>
            <option value={TaskStatus.TODO}>할 일</option>
            <option value={TaskStatus.IN_PROGRESS}>진행 중</option>
            <option value={TaskStatus.DONE}>완료</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="전체 프로젝트" value={projects.length} color="indigo" />
        <StatCard title="진행 중" value={tasks.filter(t => t.status !== TaskStatus.DONE).length} color="blue" />
        <StatCard title="완료" value={tasks.filter(t => t.status === TaskStatus.DONE).length} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">팀 전체 실시간 업무 현황</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">프로젝트</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">태스크</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">담당자</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">기간</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.length > 0 ? filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">{task.projectName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{task.ownerName}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">{task.startDate} ~ {task.endDate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} />
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-sm">표시할 데이터가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div className={`bg-white p-6 rounded-xl border border-gray-200 border-l-4 border-l-${color}-500 shadow-sm transition-transform hover:-translate-y-1`}>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
    <p className="text-4xl font-black mt-2 text-gray-900">{value}</p>
  </div>
);

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const styles = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-600 border-gray-200',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
    [TaskStatus.DONE]: 'bg-green-100 text-green-700 border-green-200',
  };
  const labels = {
    [TaskStatus.TODO]: '대기',
    [TaskStatus.IN_PROGRESS]: '진행',
    [TaskStatus.DONE]: '완료',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default TeamDashboard;
