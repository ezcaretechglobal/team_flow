
import React, { useState } from 'react';
import { Project, Task, TaskStatus, User } from '../types';

interface ProjectsProps {
  currentUser: User;
  projects: Project[];
  tasks: Task[];
  onProjectsChange: (p: Project[]) => void;
  onTasksChange: (t: Task[]) => void;
}

const Projects: React.FC<ProjectsProps> = ({ currentUser, projects, tasks, onProjectsChange, onTasksChange }) => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      client: formData.get('client') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      description: formData.get('description') as string,
    };
    onProjectsChange([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    const formData = new FormData(e.currentTarget);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      title: formData.get('title') as string,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      client: selectedProject.client,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      notes: formData.get('notes') as string,
      status: TaskStatus.TODO,
    };
    onTasksChange([...tasks, newTask]);
    setIsTaskModalOpen(false);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    onTasksChange(updated);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="text-gray-500">데이터는 구글 시트와 실시간 동기화됩니다.</p>
        </div>
        <button 
          onClick={() => setIsProjectModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md"
        >
          + 새 프로젝트
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.length > 0 ? projects.map(project => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{project.ownerName}</span>
                  <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{project.client}</span>
                  <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{project.startDate} ~ {project.endDate}</span>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedProject(project); setIsTaskModalOpen(true); }}
                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
              >
                + 할 일 추가
              </button>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">할 일</th>
                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">기간</th>
                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">비고</th>
                    <th className="px-6 py-2 text-xs font-bold text-gray-500 uppercase">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.filter(t => t.projectId === project.id).length > 0 ? (
                    tasks.filter(t => t.projectId === project.id).map(task => (
                      <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium">{task.title}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{task.startDate} ~ {task.endDate}</td>
                        <td className="px-6 py-3 text-sm text-gray-400 italic max-w-xs truncate">{task.notes}</td>
                        <td className="px-6 py-3">
                          <StatusSelect status={task.status} onChange={(s) => updateTaskStatus(task.id, s)} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-6 py-8 text-sm text-gray-400 text-center">등록된 할 일이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400 font-medium">생성된 프로젝트가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Project Modal (기존과 동일하되 Props 연동) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">새 프로젝트 등록</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">프로젝트명</label>
                <input name="name" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">고객사</label>
                <input name="client" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">시작일</label>
                  <input type="date" name="startDate" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">종료일</label>
                  <input type="date" name="endDate" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">설명</label>
                <textarea name="description" rows={3} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">취소</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg">프로젝트 생성</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal (기존과 동일) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">[{selectedProject?.name}] - 새 할 일</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">할 일 제목</label>
                <input name="title" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">시작일</label>
                  <input type="date" name="startDate" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">종료일</label>
                  <input type="date" name="endDate" required className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">메모</label>
                <textarea name="notes" rows={3} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2.5 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">취소</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg">추가하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusSelect = ({ status, onChange }: { status: TaskStatus, onChange: (s: TaskStatus) => void }) => (
  <select 
    value={status} 
    onChange={(e) => onChange(e.target.value as TaskStatus)}
    className={`text-xs font-bold rounded border-gray-200 py-1 pl-2 pr-6 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
      status === TaskStatus.DONE ? 'text-green-600 bg-green-50 border-green-200' : 
      status === TaskStatus.IN_PROGRESS ? 'text-blue-600 bg-blue-50 border-blue-200' : 
      'text-gray-600 bg-gray-50'
    }`}
  >
    <option value={TaskStatus.TODO}>할 일</option>
    <option value={TaskStatus.IN_PROGRESS}>진행 중</option>
    <option value={TaskStatus.DONE}>완료</option>
  </select>
);

export default Projects;
