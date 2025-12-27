
import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember } from '../types';
import * as htmlToImage from 'https://esm.sh/html-to-image';

interface MemberNodeProps {
  member: FamilyMember;
  isAdmin: boolean;
  onEdit?: (member: FamilyMember) => void;
  onAddChild?: (parent: FamilyMember) => void;
}

const MemberNode: React.FC<MemberNodeProps> = ({ member, isAdmin, onEdit, onAddChild }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Đời 4 trở đi dùng chế độ compact (dọc)
  const isCompact = member.generation >= 4;
  const isGen1To2 = member.generation <= 2;

  const renderVerticalName = (name: string) => {
    return name.split(' ').map((word, i) => (
      <span key={i} className="block leading-[1.0] whitespace-nowrap">{word}</span>
    ));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        {/* Đường nối lên cha - Dài 20px, căn tâm tuyệt đối */}
        {member.generation > 1 && (
          <div 
            className="absolute top-[-20px] left-1/2 w-[2px] h-[20px] bg-red-900/30 z-0" 
            style={{ marginLeft: '-1px' }}
          />
        )}

        {/* Khối thông tin thành viên */}
        <div className={`
          relative z-10 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl group
          ${isCompact 
            ? 'min-w-[40px] px-2 py-3 rounded-lg border-[1px] bg-white hover:border-red-600' 
            : 'w-44 p-4 rounded-2xl border-[3px] bg-white shadow-sm'
          }
          ${member.isMale 
            ? 'border-blue-200' 
            : 'border-pink-200'
          }
          ${isGen1To2 ? 'ring-2 ring-red-900/10 ring-offset-2 border-red-900 bg-red-50' : ''}
        `}>
          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(member); }}
              className="absolute -top-3 -left-3 bg-yellow-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </button>
          )}

          <div className={`
            font-bold text-red-950 font-traditional text-center
            ${isCompact ? 'text-[10px]' : (isGen1To2 ? 'text-xl' : 'text-md')}
          `}>
            {isCompact ? renderVerticalName(member.name) : member.name}
          </div>

          {!isCompact && (
            <>
              {(member.birthDate || member.deathDate) && (
                <div className="text-[9px] text-gray-400 font-bold italic mt-1 leading-none">
                  {member.birthDate || '...'} {member.deathDate ? `- ${member.deathDate}` : ''}
                </div>
              )}
              <div className={`text-[8px] font-black uppercase tracking-widest rounded-full py-0.5 mt-2 ${isGen1To2 ? 'bg-red-900 text-yellow-400 px-2' : 'bg-gray-100 text-gray-500'}`}>
                {member.generation === 1 ? 'Thủy Tổ' : `Đời ${member.generation}`}
              </div>
            </>
          )}

          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddChild?.(member); }}
              className="absolute -bottom-3 -right-3 bg-green-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </button>
          )}
        </div>

        {member.spouseName && !isCompact && (
          <div className="mt-1.5 p-1.5 rounded-lg border border-dashed border-gray-200 bg-gray-50/30 w-40 text-center">
             <div className="text-[9px] font-bold text-gray-500 truncate">h/p: {member.spouseName}</div>
          </div>
        )}

        {hasChildren && (
          <button
            onClick={toggleExpand}
            className={`
              absolute left-1/2 -translate-x-1/2 z-20 w-5 h-5 rounded-full border shadow-sm flex items-center justify-center transition-all hover:scale-110 bg-white
              ${isCompact ? '-bottom-3.5' : '-bottom-2.5'}
              ${isExpanded ? 'text-red-900 border-red-900/20' : 'text-gray-400 border-gray-100 rotate-180'}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="relative pt-10 flex flex-col items-center w-full">
          {/* 1. Đường xuống từ cha: Dài chính xác 20px, bắt đầu từ top: 0 */}
          <div 
            className="absolute top-0 left-1/2 w-[2px] h-[20px] bg-red-900/30 z-0" 
            style={{ marginLeft: '-1px' }}
          />
          
          <div className="flex flex-row justify-center relative w-full">
             {member.children?.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === (member.children?.length ?? 0) - 1;
                const isOnly = member.children?.length === 1;
                
                return (
                  <div key={child.id} className="relative px-3">
                     {/* 2. Thanh ngang nối anh em: Nằm chính xác tại mốc 20px */}
                     {!isOnly && (
                        <div className={`
                          absolute top-[20px] h-[2px] bg-red-900/30 z-0
                          ${isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'}
                        `}></div>
                     )}
                     
                     {/* 3. Container chứa MemberNode: Cần pt-10 để tạo khoảng trống cho đường lên 20px + đường xuống 20px */}
                     <div className="pt-10">
                        <MemberNode member={child} isAdmin={isAdmin} onEdit={onEdit} onAddChild={onAddChild} />
                     </div>
                  </div>
                );
             })}
          </div>
        </div>
      )}
    </div>
  );
};

interface FamilyTreeProps {
  root: FamilyMember;
  isAdmin: boolean;
  onEditMember: (member: FamilyMember) => void;
  onAddChild: (parent: FamilyMember) => void;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ root, isAdmin, onEditMember, onAddChild }) => {
  const [scale, setScale] = useState(0.85);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.2));
  const handleResetZoom = () => setScale(0.85);

  const handleExportPNG = async () => {
    if (!treeRef.current) return;
    try {
      setIsExporting(true);
      const originalScale = scale;
      setScale(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      const dataUrl = await htmlToImage.toPng(treeRef.current, { backgroundColor: '#fdf6e3', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `phado-ho-le.png`;
      link.href = dataUrl;
      link.click();
      setScale(originalScale);
    } catch (err) {
      alert('Lỗi xuất ảnh. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollLeft = scrollLeft - (x - startX);
    containerRef.current.scrollTop = scrollTop - (y - startY);
  };

  const onMouseUpOrLeave = () => setIsDragging(false);

  return (
    <div className="relative w-full overflow-hidden bg-[#fdf6e3]/80 backdrop-blur-sm rounded-3xl border border-red-900/10 shadow-inner min-h-[700px] h-[80vh]">
      
      <div className={`absolute top-4 right-4 z-[60] flex flex-col items-end gap-2 transition-all duration-300 ${isDragging ? 'opacity-20' : 'opacity-100'}`}>
        <button 
          onClick={() => setShowControls(!showControls)}
          className={`w-10 h-10 rounded-full shadow-2xl flex items-center justify-center transition-all ${showControls ? 'bg-red-900 text-white rotate-90' : 'bg-white text-red-900 hover:bg-red-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {showControls && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 border border-red-900/10 flex flex-col gap-3 animate-fadeIn">
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-[10px] font-black uppercase text-gray-400 text-center">Tỉ lệ: {Math.round(scale * 100)}%</span>
              <div className="flex gap-2">
                <button onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-red-900 rounded-lg transition-all">+</button>
                <button onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-red-900 rounded-lg transition-all">-</button>
                <button onClick={handleResetZoom} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-red-900 rounded-lg transition-all">⟲</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleExportPNG} className="text-[10px] font-bold bg-red-900 text-white px-3 py-2 rounded-lg hover:bg-red-800 transition-all flex items-center gap-2">
                <span>Xuất PNG</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className={`w-full h-full overflow-auto scrollbar-hide flex items-start justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div 
          ref={treeRef}
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out' 
          }}
          className="inline-block p-40 min-w-full text-center"
        >
          <div className="inline-block">
            <MemberNode 
              member={root} 
              isAdmin={isAdmin} 
              onEdit={onEditMember} 
              onAddChild={onAddChild} 
            />
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#8b0000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute bottom-4 left-6 pointer-events-none opacity-30 select-none">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900">Sơ đồ phả hệ trực tuyến</span>
      </div>

      {isExporting && (
        <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-pulse font-traditional text-red-900 text-xl font-bold">Đang xử lý hình ảnh...</div>
        </div>
      )}
    </div>
  );
};

export default FamilyTree;
