
/**
 * [Google Apps Script 웹 앱 URL]
 * 구글 시트 Apps Script 배포 후 받은 URL을 아래 따옴표 사이에 붙여넣으세요.
 * 예: https://script.google.com/macros/s/AKfyc.../exec
 */
export const CLOUD_API_URL = 'https://script.google.com/macros/s/AKfycbw9naDx7Nh4s-DiY8n5E94HJi2GcU12ujMk1h2qoO3UhK5qV5eHPpzFkuFam3BSb1_E/exec';

export const cloudFetch = async (type: 'users' | 'projects' | 'tasks') => {
  // URL이 설정되지 않은 경우 로컬 데이터 반환
  if (!CLOUD_API_URL || CLOUD_API_URL.includes('YOUR_GOOGLE_SCRIPT_URL')) {
    return JSON.parse(localStorage.getItem(`teamflow_${type}`) || '[]');
  }
  
  try {
    const response = await fetch(`${CLOUD_API_URL}?type=${type}`);
    const data = await response.json();
    // 로컬 백업 업데이트
    localStorage.setItem(`teamflow_${type}`, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error(`${type} 로딩 실패:`, err);
    return JSON.parse(localStorage.getItem(`teamflow_${type}`) || '[]');
  }
};

export const cloudSave = async (type: 'users' | 'projects' | 'tasks', data: any[]) => {
  // 로컬 저장소 즉시 반영 (사용자 경험을 위해)
  localStorage.setItem(`teamflow_${type}`, JSON.stringify(data));
  
  if (!CLOUD_API_URL || CLOUD_API_URL.includes('YOUR_GOOGLE_SCRIPT_URL')) return;

  try {
    // GAS POST 요청은 보통 JSON 문자열을 body로 보냄
    await fetch(CLOUD_API_URL, {
      method: 'POST',
      mode: 'no-cors', 
      body: JSON.stringify({ action: 'saveAll', type, data })
    });
  } catch (err) {
    console.error(`${type} 저장 실패:`, err);
  }
};
