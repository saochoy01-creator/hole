
import React, { useState, useEffect, useRef } from 'react';
import { AppSection, FamilyMember, NewsItem } from './types';
import Navigation from './components/Navigation';
import FamilyTree from './components/FamilyTree';
import { 
  CLAN_NAME, CLAN_ADDRESS, SAMPLE_NEWS, SAMPLE_FAMILY_TREE 
} from './constants';
import { generateClanHistory } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.TREE);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // States with Persistence
  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('clan_news');
    return saved ? JSON.parse(saved) : SAMPLE_NEWS;
  });
  const [familyTree, setFamilyTree] = useState<FamilyMember>(() => {
    const saved = localStorage.getItem('clan_tree');
    return saved ? JSON.parse(saved) : SAMPLE_FAMILY_TREE;
  });
  const [bannerUrl, setBannerUrl] = useState<string>(() => {
    return localStorage.getItem('clan_banner') || "https://images.unsplash.com/photo-1590483736622-39da8caf3501?auto=format&fit=crop&q=80&w=2000";
  });
  const [address, setAddress] = useState<string>(() => {
    return localStorage.getItem('clan_address') || CLAN_ADDRESS;
  });
  const [historyText, setHistoryText] = useState<string>(() => {
    return localStorage.getItem('clan_history') || "Lịch sử dòng họ đang được cập nhật...";
  });
  const [ancestralHouseText, setAncestralHouseText] = useState<string>(() => {
    return localStorage.getItem('clan_house_text') || "Từ đường là nơi thờ tự linh thiêng, nơi lưu giữ hồn cốt của tổ tiên qua bao thế hệ.";
  });
  const [regulations, setRegulations] = useState<string[]>(() => {
    const saved = localStorage.getItem('clan_regulations');
    return saved ? JSON.parse(saved) : [
      "Luôn giữ gìn truyền thống tốt đẹp của dòng họ.",
      "Khuyến học, khuyến tài cho con cháu.",
      "Đoàn kết, giúp đỡ lẫn nhau trong cuộc sống."
    ];
  });

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync with LocalStorage
  useEffect(() => { localStorage.setItem('clan_news', JSON.stringify(news)); }, [news]);
  useEffect(() => { localStorage.setItem('clan_tree', JSON.stringify(familyTree)); }, [familyTree]);
  useEffect(() => { localStorage.setItem('clan_banner', bannerUrl); }, [bannerUrl]);
  useEffect(() => { localStorage.setItem('clan_address', address); }, [address]);
  useEffect(() => { localStorage.setItem('clan_history', historyText); }, [historyText]);
  useEffect(() => { localStorage.setItem('clan_house_text', ancestralHouseText); }, [ancestralHouseText]);
  useEffect(() => { localStorage.setItem('clan_regulations', JSON.stringify(regulations)); }, [regulations]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      showToast("Đăng nhập quản trị thành công!");
    } else {
      showToast("Mật khẩu sai!", "error");
    }
  };

  const generateAIBio = async () => {
    if (!editingMember) return;
    setIsGeneratingBio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Hãy viết một đoạn tiểu sử ngắn, trang trọng cho một thành viên trong gia phả dòng họ. Tên: ${editingMember.name}, Đời thứ: ${editingMember.generation}, Giới tính: ${editingMember.isMale ? 'Nam' : 'Nữ'}. Viết phong cách truyền thống Việt Nam, khoảng 50 từ.`,
      });
      setEditingMember({ ...editingMember, bio: response.text });
      showToast("Đã tạo tiểu sử bằng AI!");
    } catch (err) {
      showToast("Lỗi AI: " + err, "error");
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    showToast("Đã thoát chế độ quản trị", "info");
  };

  const saveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const updateNode = (node: FamilyMember): FamilyMember => {
      if (node.id === editingMember.id) return editingMember;
      if (node.children) return { ...node, children: node.children.map(updateNode) };
      return node;
    };
    setFamilyTree(updateNode(familyTree));
    setEditingMember(null);
    showToast("Đã lưu thành viên");
  };

  const addChild = (parent: FamilyMember) => {
    const newChild: FamilyMember = {
      id: `child-${Date.now()}`,
      name: 'Thành viên mới',
      generation: parent.generation + 1,
      isMale: true,
      parentName: parent.name
    };
    const addNode = (node: FamilyMember): FamilyMember => {
      if (node.id === parent.id) return { ...node, children: [...(node.children || []), newChild] };
      if (node.children) return { ...node, children: node.children.map(addNode) };
      return node;
    };
    setFamilyTree(addNode(familyTree));
    setEditingMember(newChild);
  };

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.NEWS:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
            {news.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gold/10 hover:shadow-2xl transition-all">
                <img src={item.imageUrl} className="w-full h-48 object-cover" alt="" />
                <div className="p-6">
                  <div className="text-xs font-bold text-red-700 uppercase mb-2">{item.date}</div>
                  <h3 className="text-xl font-bold text-red-950 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{item.summary}</p>
                  <button className="text-red-800 font-bold text-sm hover:underline">Đọc tiếp →</button>
                </div>
              </article>
            ))}
          </div>
        );
      case AppSection.TREE:
        return <FamilyTree root={familyTree} isAdmin={isAdmin} onEditMember={setEditingMember} onAddChild={addChild} />;
      case AppSection.CHRONICLES:
        return (
          <div className="bg-white p-12 rounded-3xl shadow-xl border-t-8 border-red-900 animate-fadeIn max-w-4xl mx-auto">
            <h2 className="text-4xl font-traditional text-red-900 text-center mb-8 border-b-2 border-gold/20 pb-4 italic">Phả Kỹ Dòng Họ</h2>
            <div className="prose prose-red max-w-none text-gray-800 leading-relaxed font-serif text-lg whitespace-pre-wrap">
              {historyText}
            </div>
          </div>
        );
      case AppSection.ANCESTRAL_HOUSE:
        return (
          <div className="bg-white p-8 rounded-3xl shadow-xl animate-fadeIn max-w-4xl mx-auto">
            <h2 className="text-3xl font-traditional text-red-900 mb-6">Từ Đường Linh Thiêng</h2>
            <div className="aspect-video bg-gray-100 rounded-2xl mb-8 overflow-hidden shadow-inner flex items-center justify-center border-4 border-gold/10">
               <span className="text-gray-400 font-traditional italic text-lg">Hình ảnh từ đường đang được cập nhật...</span>
            </div>
            <p className="text-xl italic text-red-950 border-l-4 border-gold pl-6 leading-loose">{ancestralHouseText}</p>
          </div>
        );
      case AppSection.REGULATIONS:
        return (
          <div className="bg-[#fffef0] p-16 rounded shadow-2xl border-[12px] border-double border-red-900 animate-fadeIn max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg className="w-40 h-40 fill-red-900" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </div>
            <h2 className="text-4xl font-traditional text-red-900 text-center mb-12 uppercase tracking-widest">Tộc Ước Dòng Họ</h2>
            <div className="space-y-8 font-serif italic text-lg text-red-950">
              {regulations.map((r, i) => (
                <div key={i} className="flex gap-4">
                  <span className="font-bold text-red-800">Điều {i+1}:</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f9f5f0]">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-red-900 text-white px-8 py-3 rounded-full shadow-2xl animate-fadeIn border border-yellow-500 font-bold">
          {toast.message}
        </div>
      )}

      <header className="relative w-full h-[400px] flex items-center justify-center bg-red-950 shadow-2xl overflow-hidden">
        <img src={bannerUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 to-transparent"></div>
        <div className="relative text-center z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-traditional text-yellow-400 drop-shadow-2xl mb-4 tracking-tighter">{CLAN_NAME}</h1>
          <div className="inline-block px-8 py-2 bg-yellow-500/20 backdrop-blur-md rounded-full border border-yellow-500/30">
            <p className="text-yellow-100 font-bold tracking-widest uppercase text-sm">Gìn giữ cội nguồn - Phát huy truyền thống</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-2">
          <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
        
        <main className="mt-12">{renderSection()}</main>
      </div>

      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-[100] flex gap-4">
           <button onClick={handleLogout} className="bg-red-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold hover:bg-red-800 transition-all flex items-center gap-2 border border-yellow-500/50">
             Thoát Quản Trị
           </button>
        </div>
      )}

      {!isAdmin && (
        <button onClick={() => setShowLogin(true)} className="fixed bottom-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-white/10 group">
          <svg className="w-5 h-5 text-red-900/50 group-hover:text-red-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
        </button>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-red-900/10">
            <h3 className="text-3xl font-traditional text-red-900 mb-8 text-center">Xác thực quyền hạn</h3>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] focus:border-red-900 outline-none transition-all" autoFocus placeholder="••••" />
              <button type="submit" className="w-full bg-red-900 text-yellow-400 font-black py-4 rounded-2xl shadow-xl hover:bg-red-800 transition-all uppercase tracking-widest">Đăng nhập</button>
              <button type="button" onClick={() => setShowLogin(false)} className="w-full text-gray-400 font-bold py-2">Hủy bỏ</button>
            </form>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-gold/20 my-auto">
            <h3 className="text-2xl font-traditional text-red-900 mb-8 border-b pb-4 flex items-center gap-3">
              <span className="p-2 bg-red-50 rounded-lg">👤</span> Cập nhật thông tin thành viên
            </h3>
            <form onSubmit={saveMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Họ và Tên</label>
                 <input type="text" value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-red-900 outline-none font-bold" />
              </div>
              <div>
                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Giới tính</label>
                 <select value={editingMember.isMale ? 'male' : 'female'} onChange={(e) => setEditingMember({...editingMember, isMale: e.target.value === 'male'})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phối ngẫu (Vợ/Chồng)</label>
                 <input type="text" value={editingMember.spouseName || ''} onChange={(e) => setEditingMember({...editingMember, spouseName: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3" />
              </div>
              <div className="md:col-span-2">
                 <div className="flex justify-between items-end mb-2">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tiểu sử thành viên</label>
                   <button type="button" onClick={generateAIBio} disabled={isGeneratingBio} className="text-[10px] font-black bg-red-50 text-red-700 px-3 py-1 rounded-full hover:bg-red-100 disabled:opacity-50">
                     {isGeneratingBio ? 'ĐANG TẠO...' : '✨ GỢI Ý BẰNG AI'}
                   </button>
                 </div>
                 <textarea value={editingMember.bio || ''} onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 h-32 outline-none font-serif text-md" />
              </div>
              <div className="md:col-span-2 flex gap-4 pt-4 border-t">
                 <button type="submit" className="flex-1 bg-red-900 text-white font-black py-4 rounded-2xl hover:bg-red-800 shadow-xl transition-all">LƯU THÔNG TIN</button>
                 <button type="button" onClick={() => setEditingMember(null)} className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl">HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-24 border-t-8 border-red-900 bg-red-950 text-yellow-100/40 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h4 className="text-4xl font-traditional text-yellow-500/80 mb-6 uppercase tracking-tighter">{CLAN_NAME}</h4>
          <p className="text-sm font-serif italic mb-8">"Nước có nguồn, cây có cội - Con người có tổ có tông"</p>
          <div className="h-px bg-yellow-500/10 w-20 mx-auto mb-8"></div>
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-50">Hệ thống số hóa phả hệ &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
