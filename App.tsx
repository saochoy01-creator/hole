
import React, { useState, useEffect } from 'react';
import { AppSection, FamilyMember, NewsItem } from './types.ts';
import Navigation from './components/Navigation.tsx';
import FamilyTree from './components/FamilyTree.tsx';
import { CLAN_NAME, SAMPLE_NEWS, SAMPLE_FAMILY_TREE } from './constants.tsx';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.TREE);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const [news, setNews] = useState<NewsItem[]>(() => JSON.parse(localStorage.getItem('clan_news') || JSON.stringify(SAMPLE_NEWS)));
  const [familyTree, setFamilyTree] = useState<FamilyMember>(() => JSON.parse(localStorage.getItem('clan_tree') || JSON.stringify(SAMPLE_FAMILY_TREE)));
  const [historyText, setHistoryText] = useState(() => localStorage.getItem('clan_history') || "Lịch sử dòng họ đang được cập nhật...");
  const [houseText, setHouseText] = useState(() => localStorage.getItem('clan_house') || "Từ đường là nơi thờ tự linh thiêng của dòng họ.");
  const [regulations, setRegulations] = useState<string[]>(() => JSON.parse(localStorage.getItem('clan_regs') || '["Gìn giữ truyền thống", "Hiếu học", "Đoàn kết"]'));

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editHistory, setEditHistory] = useState<string | null>(null);
  const [editHouse, setEditHouse] = useState<string | null>(null);
  const [editRegs, setEditRegs] = useState<string[] | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    localStorage.setItem('clan_news', JSON.stringify(news));
    localStorage.setItem('clan_tree', JSON.stringify(familyTree));
    localStorage.setItem('clan_history', historyText);
    localStorage.setItem('clan_house', houseText);
    localStorage.setItem('clan_regs', JSON.stringify(regulations));
  }, [news, familyTree, historyText, houseText, regulations]);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAdmin(true); setShowLogin(false); setPassword(''); showToast("Đăng nhập quản trị!");
    } else showToast("Sai mật khẩu!", "error");
  };

  const saveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const updateNode = (node: FamilyMember): FamilyMember => {
      if (node.id === editingMember.id) return editingMember;
      return { ...node, children: node.children?.map(updateNode) };
    };
    setFamilyTree(updateNode(familyTree)); setEditingMember(null); showToast("Đã lưu!");
  };

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.TREE: return <FamilyTree root={familyTree} isAdmin={isAdmin} onEditMember={setEditingMember} onAddChild={(p) => setEditingMember({ id: Date.now().toString(), name: 'Thành viên mới', generation: p.generation + 1, isMale: true, parentName: p.name })} />;
      case AppSection.CHRONICLES: return (
        <div className="bg-white p-8 rounded-3xl shadow-lg relative group max-w-4xl mx-auto">
          {isAdmin && <button onClick={() => setEditHistory(historyText)} className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100">Sửa</button>}
          <h2 className="text-3xl font-traditional text-red-900 text-center mb-6">Phả Kỹ</h2>
          <div className="whitespace-pre-wrap font-serif text-lg">{historyText}</div>
        </div>
      );
      case AppSection.ANCESTRAL_HOUSE: return (
        <div className="bg-white p-8 rounded-3xl shadow-lg relative group max-w-4xl mx-auto">
          {isAdmin && <button onClick={() => setEditHouse(houseText)} className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100">Sửa</button>}
          <h2 className="text-3xl font-traditional text-red-900 text-center mb-6">Từ Đường</h2>
          <p className="italic text-center text-red-950">{houseText}</p>
        </div>
      );
      case AppSection.REGULATIONS: return (
        <div className="bg-[#fffef0] p-12 rounded-3xl shadow-xl border-8 border-double border-red-900 relative group max-w-3xl mx-auto">
          {isAdmin && <button onClick={() => setEditRegs([...regulations])} className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100">Sửa</button>}
          <h2 className="text-3xl font-traditional text-red-900 text-center mb-8">Tộc Ước</h2>
          <ul className="space-y-4 font-serif italic">
            {regulations.map((r, i) => <li key={i}><strong>Điều {i+1}:</strong> {r}</li>)}
          </ul>
        </div>
      );
      case AppSection.NEWS: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(n => (
            <div key={n.id} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 relative">
              {isAdmin && <button onClick={() => setNews(news.filter(x => x.id !== n.id))} className="absolute top-2 right-2 text-red-500">✖</button>}
              <img src={n.imageUrl || "https://picsum.photos/seed/clan/400/200"} className="w-full h-32 object-cover rounded-xl mb-3" />
              <h4 className="font-bold text-red-900">{n.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">{n.summary}</p>
            </div>
          ))}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5f0] pb-20">
      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] bg-red-900 text-white px-6 py-2 rounded-full shadow-2xl">{toast.message}</div>}
      <header className="h-[300px] bg-red-950 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative text-5xl font-traditional text-yellow-400 z-10">{CLAN_NAME}</h1>
      </header>
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white/90 backdrop-blur rounded-3xl p-2 shadow-2xl">
          <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
        <main className="mt-10">{renderSection()}</main>
      </div>

      {!isAdmin ? (
        <button onClick={() => setShowLogin(true)} className="fixed bottom-6 right-6 w-12 h-12 bg-white/20 rounded-full border flex items-center justify-center">🔑</button>
      ) : (
        <button onClick={() => setIsAdmin(false)} className="fixed bottom-6 right-6 bg-red-900 text-white px-4 py-2 rounded-full shadow-xl">Thoát</button>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-center">Quản trị viên</h3>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-3 rounded-xl mb-4" placeholder="Mật khẩu" autoFocus />
            <button type="submit" className="w-full bg-red-900 text-white py-3 rounded-xl">Đăng nhập</button>
            <button type="button" onClick={() => setShowLogin(false)} className="w-full text-gray-400 mt-2">Hủy</button>
          </form>
        </div>
      )}

      {/* Modal Sửa Thành Viên */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <form onSubmit={saveMember} className="bg-white p-8 rounded-3xl w-full max-w-md">
            <h3 className="font-bold mb-4">Sửa thông tin</h3>
            <input type="text" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="w-full border p-2 mb-4" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-red-900 text-white py-2 rounded">Lưu</button>
              <button type="button" onClick={() => setEditingMember(null)} className="flex-1 bg-gray-100">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Sửa Phả Kỹ */}
      {editHistory !== null && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl">
            <textarea value={editHistory} onChange={e => setEditHistory(e.target.value)} className="w-full h-64 border p-2 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { setHistoryText(editHistory); setEditHistory(null); }} className="flex-1 bg-red-900 text-white py-2 rounded">Lưu</button>
              <button onClick={() => setEditHistory(null)} className="flex-1 bg-gray-100 py-2 rounded">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa Tộc Ước */}
      {editRegs !== null && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg">
            <div className="space-y-2 mb-4 max-h-60 overflow-auto">
              {editRegs.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input value={r} onChange={e => { const n = [...editRegs]; n[i] = e.target.value; setEditRegs(n); }} className="flex-1 border p-1" />
                  <button onClick={() => setEditRegs(editRegs.filter((_, idx) => idx !== i))} className="text-red-500">✖</button>
                </div>
              ))}
              <button onClick={() => setEditRegs([...editRegs, ""])} className="w-full border-dashed border p-2 text-gray-400">+ Thêm</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setRegulations(editRegs); setEditRegs(null); }} className="flex-1 bg-red-900 text-white py-2 rounded">Lưu</button>
              <button onClick={() => setEditRegs(null)} className="flex-1 bg-gray-100 py-2 rounded">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
