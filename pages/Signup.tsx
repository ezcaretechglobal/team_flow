
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthState, User, UserRole } from '../types';
import { cloudFetch, cloudSave } from '../api/config';

const EMAILJS_CONFIG = {
  SERVICE_ID: (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID || 'team_flow',
  TEMPLATE_ID: (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID || 'template_6l3wonb',
  PUBLIC_KEY: (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY || 'hhkNC7SwRvErxx63x',
  COMPANY_NAME: 'ezCaretech'
};

interface SignupProps {
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
}

const Signup: React.FC<SignupProps> = ({ setAuthState }) => {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFirstUser = async () => {
      const users = await cloudFetch('users');
      setIsFirstUser(users.length === 0);
    };
    checkFirstUser();

    const initEmailJS = () => {
      if ((window as any).emailjs) {
        (window as any).emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      }
    };

    if (document.readyState === 'complete') {
      initEmailJS();
    } else {
      window.addEventListener('load', initEmailJS);
      return () => window.removeEventListener('load', initEmailJS);
    }
  }, []);

  const sendVerificationEmail = async (email: string, name: string, code: string) => {
    try {
      await (window as any).emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          name: name,
          email: email,
          verify_code: code,
          company_name: EMAILJS_CONFIG.COMPANY_NAME
        }
      );
      return true;
    } catch (err) {
      console.error('이메일 발송 실패:', err);
      return false;
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const users: User[] = await cloudFetch('users');
    
    if (users.some(u => u.username === formData.username)) {
      setError('이미 사용 중인 아이디입니다.');
      setIsLoading(false);
      return;
    }
    if (users.some(u => u.email === formData.email)) {
      setError('이미 사용 중인 이메일입니다.');
      setIsLoading(false);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: users.length === 0 ? UserRole.ADMIN : UserRole.MEMBER,
      isVerified: false,
    };

    const success = await sendVerificationEmail(formData.email, formData.name, code);
    
    if (success) {
      setTempUser(newUser);
      setStep('verify');
    } else {
      setError('이메일 발송 중 오류가 발생했습니다.');
    }
    setIsLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode !== generatedCode) {
      setError('인증 코드가 일치하지 않습니다.');
      return;
    }

    if (tempUser) {
      setIsLoading(true);
      const users: User[] = await cloudFetch('users');
      const verifiedUser = { ...tempUser, isVerified: true };
      const updatedUsers = [...users, verifiedUser];
      
      // 구글 시트에 즉시 저장
      await cloudSave('users', updatedUsers);

      const { password: _, ...userSafe } = verifiedUser;
      setAuthState({ user: userSafe as User, isAuthenticated: true });
      setIsLoading(false);
      navigate('/dashboard');
    }
  };

  const handleResendCode = async () => {
    if (!tempUser) return;
    setIsLoading(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    const success = await sendVerificationEmail(tempUser.email, tempUser.name, newCode);
    if (success) {
      alert('코드가 재발송되었습니다.');
    } else {
      setError('재발송 실패');
    }
    setIsLoading(false);
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">이메일 인증</h2>
            <p className="text-sm text-gray-500 mt-2"><strong>{tempUser?.email}</strong>로 발송된 코드를 입력하세요.</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              required
              disabled={isLoading}
              className="block w-full text-center text-2xl tracking-widest font-bold rounded-lg border-gray-300 py-3 focus:ring-indigo-500 focus:border-indigo-500 border"
              placeholder="000000"
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
            />
            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:bg-indigo-300">
              {isLoading ? '저장 중...' : '인증 및 가입 완료'}
            </button>
            <div className="flex justify-center space-x-4 text-xs">
              <button type="button" onClick={handleResendCode} className="text-indigo-600 font-bold hover:underline">코드 재발송</button>
              <button type="button" onClick={() => setStep('form')} className="text-gray-500 hover:underline">이메일 수정</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">TeamFlow</h1>
          <p className="text-gray-500 mt-2">환영합니다! 팀워크를 시작해보세요.</p>
          {isFirstUser && (
            <div className="mt-4 p-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-700 font-medium animate-pulse">
              💡 첫 번째 사용자입니다. 관리자 권한이 부여됩니다.
            </div>
          )}
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">이름</label>
              <input type="text" required disabled={isLoading} className="block w-full rounded-lg border-gray-300 py-2.5 px-4 border text-sm" placeholder="홍길동" onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">아이디</label>
              <input type="text" required disabled={isLoading} className="block w-full rounded-lg border-gray-300 py-2.5 px-4 border text-sm" placeholder="userid123" onChange={e => setFormData({ ...formData, username: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">이메일 주소</label>
            <input type="email" required disabled={isLoading} className="block w-full rounded-lg border-gray-300 py-2.5 px-4 border text-sm" placeholder="gildong@example.com" onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">비밀번호</label>
            <input type="password" required disabled={isLoading} className="block w-full rounded-lg border-gray-300 py-2.5 px-4 border text-sm" placeholder="••••••••" onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg disabled:bg-indigo-300">
            {isLoading ? '동기화 중...' : '가입 및 이메일 인증'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">이미 계정이 있으신가요? <Link to="/login" className="text-indigo-600 font-bold hover:underline">로그인</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
