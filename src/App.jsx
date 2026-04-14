import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, LayoutDashboard, Database, Clock, Menu } from 'lucide-react';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCNlZhOtSrjp5znbL-fuV0QMpyivYNka11HMsO-Ehj2UeeS-HzXp7pisaAqb-jD2pwAPToLcc-EjIe/pub?gid=2029844039&single=true&output=csv";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (results) => {
        // 데이터 정제: 날짜 기준 정렬 및 빈 데이터 필터링
        const cleanData = results.data.filter(item => item.title);
        setData(cleanData);
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">데이터를 불러오는 중입니다...</div>;

  // --- 데이터 가공 로직 ---
  // 1. 장르별 분포 (Dashboard용)
  const genreData = Object.entries(data.reduce((acc, curr) => {
    acc[curr.form1] = (acc[curr.form1] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  // 2. 검색 필터링 (Archive용)
  const filteredData = data.filter(item => 
    item.title?.includes(searchTerm) || item.composer?.includes(searchTerm)
  );

  // 3. 연도별 타임라인 (Timeline용)
  const timelineData = [...data]
    .filter(item => item.perform_date)
    .sort((a, b) => new Date(b.perform_date) - new Date(a.perform_date))
    .slice(0, 50); // 최신 50건만 표시

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* 사이드바 네비게이션 */}
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6">
        <h1 className="text-xl font-bold mb-10 flex items-center gap-2">
          <Database size={24} /> 국악 아카이브
        </h1>
        <div className="space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> 대시보드
          </button>
          <button onClick={() => setActiveTab('archive')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'archive' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <Database size={20} /> 데이터 조회
          </button>
          <button onClick={() => setActiveTab('timeline')} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === 'timeline' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <Clock size={20} /> 타임라인
          </button>
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {/* 탭 1: 대시보드 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">인사이트 대시보드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="font-semibold mb-4 text-gray-600">장르별 작품 분포</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genreData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold mb-2 text-gray-600">전체 아카이브 데이터</h3>
                <p className="text-5xl font-black text-blue-600">{data.length.toLocaleString()}</p>
                <p className="mt-2 text-gray-400 font-medium font-sans italic">Total Records</p>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 데이터 아카이브 (검색 기능) */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">데이터 조회</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="제목 또는 작곡가 검색..." 
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">제목</th>
                    <th className="p-4 font-semibold text-gray-600">작곡가</th>
                    <th className="p-4 font-semibold text-gray-600">장르</th>
                    <th className="p-4 font-semibold text-gray-600">공연일</th>
                    <th className="p-4 font-semibold text-gray-600">장소</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredData.slice(0, 100).map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-medium text-blue-700">{item.title}</td>
                      <td className="p-4 text-gray-600">{item.composer || '-'}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.form1}</span></td>
                      <td className="p-4 text-gray-500">{item.perform_date}</td>
                      <td className="p-4 text-gray-500 text-xs">{item.perform_place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 탭 3: 타임라인 */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">공연 타임라인 (최신순)</h2>
            <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 p-4">
              {timelineData.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-7 top-1 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    <span className="text-sm font-bold text-blue-600">{item.perform_date}</span>
                    <h4 className="text-lg font-bold mt-1">{item.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{item.perform_name}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">{item.perform_place}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;