
import React from 'react';
import { User, UserRole } from '../types';

interface AdminProps {
  users: User[];
  onUsersChange: (u: User[]) => void;
}

const AdminPortal: React.FC<AdminProps> = ({ users, onUsersChange }) => {
  const handleToggleRole = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextRole = u.role === UserRole.ADMIN ? UserRole.MEMBER : UserRole.ADMIN;
        return { ...u, role: nextRole };
      }
      return u;
    });
    onUsersChange(updated);
  };

  const handleManualVerify = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, isVerified: true } : u);
    onUsersChange(updated);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!confirm(`[퇴사 처리] '${userName}'님의 계정을 삭제하시겠습니까?`)) return;
    const updated = users.filter(u => u.id !== userId);
    onUsersChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl border border-indigo-500/30">
        <h1 className="text-3xl font-bold tracking-tight">System Admin Console</h1>
        <p className="mt-1 text-indigo-300">사용자 권한 및 계정 동기화 관리</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-800">사용자 관리</h2>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Total: {users.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase border-b">사용자</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase border-b">상태</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase border-b">권한</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase border-b text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black mr-3 ${user.role === UserRole.ADMIN ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-green-50 text-green-700 border border-green-200">인증됨</span>
                    ) : (
                      <button onClick={() => handleManualVerify(user.id)} className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100">강제승인</button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${user.role === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleToggleRole(user.id)} className="text-indigo-600 hover:underline text-xs font-bold">권한변경</button>
                    <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-red-600 hover:text-red-800 text-xs font-bold">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
