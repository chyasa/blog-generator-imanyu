import React, { useState, useRef } from 'react';
import { FileText, Plus, Trash2, GripVertical, ArrowDown, ArrowUp, Info } from 'lucide-react';
import { OutlineItem } from '../types';

interface OutlineEditorProps {
  outline: OutlineItem[];
  onOutlineChange: (outline: OutlineItem[]) => void;
  onApprove: () => void;
  onRegenerate: () => void;
}

export function OutlineEditor({ outline, onOutlineChange, onApprove, onRegenerate }: OutlineEditorProps) {
  const [draggedItem, setDraggedItem] = useState<OutlineItem | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' | 'child' } | null>(null);
  const [showTips, setShowTips] = useState(true);
  const dragTimeoutRef = useRef<number>();

  const addItem = (parentId: string | null) => {
    const newItem: OutlineItem = {
      id: crypto.randomUUID(),
      title: '新しい項目',
      level: parentId ? outline.find(item => item.id === parentId)?.level! + 1 : 1,
    };

    if (parentId) {
      const parentIndex = outline.findIndex(item => item.id === parentId);
      const newOutline = [...outline];
      newOutline.splice(parentIndex + 1, 0, newItem);
      onOutlineChange(newOutline);
    } else {
      onOutlineChange([...outline, newItem]);
    }
  };

  const removeItem = (id: string) => {
    const itemIndex = outline.findIndex(item => item.id === id);
    const itemLevel = outline[itemIndex].level;
    let endIndex = itemIndex + 1;
    
    while (endIndex < outline.length && outline[endIndex].level > itemLevel) {
      endIndex++;
    }
    
    const newOutline = [
      ...outline.slice(0, itemIndex),
      ...outline.slice(endIndex)
    ];
    
    onOutlineChange(newOutline);
  };

  const updateItemTitle = (id: string, title: string) => {
    onOutlineChange(
      outline.map(item =>
        item.id === id ? { ...item, title } : item
      )
    );
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = outline.findIndex(item => item.id === id);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === outline.length - 1)) return;

    const currentItem = outline[index];
    const newOutline = [...outline];
    
    if (direction === 'up') {
      let prevIndex = index - 1;
      while (prevIndex >= 0 && outline[prevIndex].level > currentItem.level) {
        prevIndex--;
      }
      if (prevIndex >= 0 && outline[prevIndex].level === currentItem.level) {
        newOutline.splice(index, 1);
        newOutline.splice(prevIndex, 0, currentItem);
      }
    } else {
      let nextIndex = index + 1;
      while (nextIndex < outline.length && outline[nextIndex].level > currentItem.level) {
        nextIndex++;
      }
      if (nextIndex < outline.length && outline[nextIndex].level === currentItem.level) {
        newOutline.splice(index, 1);
        newOutline.splice(nextIndex, 0, currentItem);
      }
    }
    
    onOutlineChange(newOutline);
  };

  const handleDragStart = (item: OutlineItem, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-white shadow-lg rounded-lg p-4 border-2 border-blue-500';
    dragImage.textContent = item.title;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);

    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: OutlineItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const threshold = rect.height / 3;

    // ドロップ位置の決定
    let position: 'before' | 'after' | 'child';
    if (y < threshold) {
      position = 'before';
    } else if (y > rect.height - threshold) {
      position = 'after';
    } else {
      position = 'child';
    }

    // 無効な移動を防ぐ
    if (isValidDrop(draggedItem, targetItem, position)) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = window.setTimeout(() => {
        setDropTarget({ id: targetItem.id, position });
      }, 100);
    }
  };

  const isValidDrop = (draggedItem: OutlineItem, targetItem: OutlineItem, position: 'before' | 'after' | 'child'): boolean => {
    // 親を子の下に移動することを防ぐ
    const draggedIndex = outline.findIndex(item => item.id === draggedItem.id);
    const targetIndex = outline.findIndex(item => item.id === targetItem.id);
    
    if (position === 'child') {
      // ドラッグ中の項目の子項目に移動することを防ぐ
      let index = draggedIndex + 1;
      while (index < outline.length && outline[index].level > draggedItem.level) {
        if (index === targetIndex) return false;
        index++;
      }
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent, targetItem: OutlineItem) => {
    e.preventDefault();
    if (!draggedItem || !dropTarget) return;

    const draggedIndex = outline.findIndex(item => item.id === draggedItem.id);
    const targetIndex = outline.findIndex(item => item.id === targetItem.id);
    
    // ドラッグ中の項目とその子項目を取得
    const draggedItemLevel = draggedItem.level;
    let draggedItemEndIndex = draggedIndex + 1;
    while (
      draggedItemEndIndex < outline.length && 
      outline[draggedItemEndIndex].level > draggedItemLevel
    ) {
      draggedItemEndIndex++;
    }
    const draggedItems = outline.slice(draggedIndex, draggedItemEndIndex);

    // 新しい階層レベルを計算
    let newLevel = targetItem.level;
    if (dropTarget.position === 'before' || dropTarget.position === 'after') {
      newLevel = targetItem.level;
    } else if (dropTarget.position === 'child') {
      newLevel = targetItem.level + 1;
    }

    // 階層レベルの差分を計算
    const levelDiff = newLevel - draggedItemLevel;

    // 階層レベルを調整
    const adjustedItems = draggedItems.map(item => ({
      ...item,
      level: item.level + levelDiff
    }));

    // 新しい配列を作成
    const newOutline = [...outline];
    newOutline.splice(draggedIndex, draggedItems.length);

    let insertIndex = targetIndex;
    if (dropTarget.position === 'after') {
      insertIndex++;
      while (
        insertIndex < newOutline.length && 
        newOutline[insertIndex].level > targetItem.level
      ) {
        insertIndex++;
      }
    }
    
    if (draggedIndex < insertIndex) {
      insertIndex -= draggedItems.length;
    }

    newOutline.splice(insertIndex, 0, ...adjustedItems);
    onOutlineChange(newOutline);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
    clearTimeout(dragTimeoutRef.current);
  };

  const handleDragLeave = () => {
    clearTimeout(dragTimeoutRef.current);
    setDropTarget(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">記事の目次</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              目次を再生成
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              この目次で本文を生成
            </button>
          </div>
        </div>

        {showTips && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">使い方のヒント</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ドラッグ＆ドロップで項目を並び替えできます</li>
                  <li>• 項目の上部にドロップで前に配置、下部で後ろに配置</li>
                  <li>• 中央部にドロップで子項目として配置</li>
                  <li>• 矢印ボタンで同じレベルの項目間を移動できます</li>
                  <li>• 項目を削除すると、その配下の項目も削除されます</li>
                </ul>
              </div>
              <button
                onClick={() => setShowTips(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {outline.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(item, e)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`
                flex items-start gap-2 p-2 rounded-lg transition-all relative
                ${draggedItem?.id === item.id ? 'opacity-50' : 'opacity-100'}
                ${dropTarget?.id === item.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
              `}
              style={{ marginLeft: `${(item.level - 1) * 2}rem` }}
            >
              {dropTarget?.id === item.id && (
                <div
                  className={`absolute left-0 right-0 h-1 bg-blue-500 ${
                    dropTarget.position === 'before' ? '-top-1' :
                    dropTarget.position === 'after' ? '-bottom-1' :
                    'hidden'
                  }`}
                />
              )}
              <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItemTitle(item.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="セクションタイトルを入力..."
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0 || (index > 0 && outline[index - 1].level !== item.level)}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="上に移動"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={
                    index === outline.length - 1 || 
                    (index < outline.length - 1 && outline[index + 1].level !== item.level)
                  }
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="下に移動"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => addItem(item.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="サブセクションを追加"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addItem(null)}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors w-full justify-center border-2 border-dashed border-blue-200 hover:border-blue-400"
        >
          <Plus className="w-5 h-5" />
          <span>新しいセクションを追加</span>
        </button>
      </div>
    </div>
  );
}