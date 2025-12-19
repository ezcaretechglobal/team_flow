
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthState, User, UserRole } from '../types';
import { cloudFetch } from '../api/config';

interface LoginProps {
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
}

const Login: React.FC<LoginProps> = ({ setAuthState }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 로그인 시점에 구글 시트에서 최신 유저 목록 가져오기
      const users: User[] = await cloudFetch('users');
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        if (!user.isVerified) {
          setError('이메일 인증이 완료되지 않은 계정입니다.');
          setIsLoading(false);
          return;
        }
        const { password: _, ...userSafe } = user;
        setAuthState({ user: userSafe as User, isAuthenticated: true });
        navigate('/dashboard');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">TeamFlow</h1>
          <p className="text-gray-500 mt-2">환영합니다! 팀 계정으로 접속하세요.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">아이디</label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4 border"
              placeholder="Your ID"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">비밀번호</label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4 border"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-indigo-700 transition duration-200 shadow-lg disabled:bg-indigo-300"
          >
            {isLoading ? '동기화 및 접속 중...' : '접속하기'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
              무료로 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
