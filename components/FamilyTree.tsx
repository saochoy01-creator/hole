
import React, { useState, useRef, useMemo } from 'react';
import { FamilyMember } from '../types.ts';
import * as htmlToImage from 'html-to-image';

interface MemberNodeProps {
  member: FamilyMember;
  isAdmin: boolean;
  highlightedId: string | null;
  onEdit?: (member: FamilyMember) => void;
  onAddChild?: (parent: FamilyMember) => void;
}

const MemberNode: React.FC<MemberNodeProps> = ({ member, isAdmin, highlightedId, onEdit, onAddChild }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = member.children && member.children.length > 0;
  const isHighlighted = highlightedId === member.id;
  const isCompact = member.generation >= 4;
  const isGen1To2 = member.generation <= 2;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const renderVerticalName = (name: string) => {
    return name.split(' ').map((word, i) => (
      <span key={i} className="block leading-[1.0] whitespace-nowrap">{word}</span>
    ));
  };

  return (
    <div className="flex flex-col items-center" id={`member-${member.id}`}>
      <div className="relative flex flex-col items-center">
        {member.generation > 1 && (
          <div className="absolute top-[-20px] left-1/2 w-[2px] h-[20px] bg-red-900/30 -ml-[1px]" />
        )}

        <div className={`
          relative z-10 transition-all duration-500 transform shadow-md group
          ${isHighlighted ? 'scale-110 ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#fdf6e3] z-40' : 'hover:-translate-y-1 hover:shadow-xl'}
          ${isCompact ? 'min-w-[40px] px-2 py-3 rounded-lg border-[1px] bg-white' : 'w-44 p-4 rounded-2xl border-[3px] bg-white'}
          ${member.isMale ? 'border-blue-200' : 'border-pink-200'}
          ${isGen1To2 ? 'ring-2 ring-red-900/10 border-red-900 bg-red-50' : ''}
          ${isHighlighted ? 'border-yellow-500 !bg-yellow-50' : ''}
        `}>
          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(member); }}
              className="absolute -top-3 -left-3 bg-yellow-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </button>
          )}

          <div className={`font-bold text-red-950 font-traditional text-center ${isCompact ? 'text-[10px]' : (isGen1To2 ? 'text-xl' : 'text-md')}`}>
            {isCompact ? renderVerticalName(member.name) : member.name}
          </div>

          {!isCompact && (
            <div className={`text-[8px] font-black uppercase tracking-widest rounded-full py-0.5 mt-2 ${isGen1To2 ? 'bg-red-900 text-yellow-400 px-2' : 'bg-gray-100 text-gray-500'}`}>
              {member.generation === 1 ? 'Thủy Tổ' : `Đời ${member.generation}`}
            </div>
          )}

          {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddChild?.(member); }}
              className="absolute -bottom-3 -right-3 bg-green-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </button>
          )}
        </div>

        {hasChildren && (
          <button
            onClick={toggleExpand}
            className={`absolute left-1/2 -translate-x-1/2 z-20 w-5 h-5 rounded-full border shadow-sm flex items-center justify-center bg-white ${isCompact ? '-bottom-3.5' : '-bottom-2.5'} ${isExpanded ? 'text-red-900' : 'text-gray-400 rotate-180'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="relative pt-10 flex flex-col items-center w-full">
          <div className="absolute top-0 left-1/2 w-[2px] h-[20px] bg-red-900/30 -ml-[1px]" />
          <div className="flex flex-row justify-center relative w-full">
             {member.children?.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === (member.children?.length ?? 0) - 1;
                const isOnly = member.children?.length === 1;
                return (
                  <div key={child.id} className="relative px-3">
                     {!isOnly && (
                        <div className={`absolute top-[20px] h-[2px] bg-red-900/30 ${isFirst ? 'left-1/2 right-0' : isLast ? 'left-0 right-1/2' : 'left-0 right-0'}`} />
                     )}
                     <div className="pt-10">
                        <MemberNode member={child} isAdmin={isAdmin} highlightedId={highlightedId} onEdit={onEdit} onAddChild={onAddChild} />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const flatMembers = useMemo(() => {
    const list: FamilyMember[] = [];
    const traverse = (node: FamilyMember) => {
      list.push(node);
      if (node.children) node.children.forEach(traverse);
    };
    traverse(root);
    return list;
  }, [root]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    return flatMembers.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, flatMembers]);

  const handleSelectMember = (member: FamilyMember) => {
    setHighlightedId(member.id);
    setSearchQuery('');
    setTimeout(() => {
      const element = document.getElementById(`member-${member.id}`);
      if (element && containerRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 100);
    setTimeout(() => setHighlightedId(null), 5000);
  };

  const handleZoom = (delta: number) => setScale(prev => Math.max(0.2, Math.min(1.5, prev + delta)));

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, input')) return;
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setStartY(e.pageY - (containerRef.current?.offsetTop || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollLeft = scrollLeft - (x - startX);
    containerRef.current.scrollTop = scrollTop - (y - startY);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#fdf6e3]/80 rounded-3xl border border-red-900/10 h-[80vh]">
      <div className="absolute top-4 right-4 z-[60] flex flex-col items-end gap-2">
        <div className="relative w-64 md:w-80">
          <input 
            type="text" placeholder="Tìm thành viên..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-2xl shadow-xl px-4 py-2 border border-red-900/10 focus:ring-2 ring-red-900/20 outline-none"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border overflow-hidden">
              {searchResults.map(m => (
                <button key={m.id} onClick={() => handleSelectMember(m)} className="w-full px-4 py-2 text-left hover:bg-red-50 text-sm border-b last:border-0">
                  <span className="font-bold text-red-950">{m.name}</span> <span className="text-[10px] text-gray-400">Đời {m.generation}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-lg border">
          <button onClick={() => handleZoom(0.1)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-900 font-bold">+</button>
          <button onClick={() => handleZoom(-0.1)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-900 font-bold">-</button>
          <button onClick={() => setScale(0.85)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-900 text-xs">⟲</button>
        </div>
      </div>

      <div 
        ref={containerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
        className={`w-full h-full overflow-auto scrollbar-hide flex items-start justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div ref={treeRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }} className="inline-block p-40 min-w-full text-center transition-transform duration-300">
          <MemberNode member={root} isAdmin={isAdmin} highlightedId={highlightedId} onEdit={onEditMember} onAddChild={onAddChild} />
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
