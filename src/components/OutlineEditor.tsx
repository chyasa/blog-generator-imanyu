import React, { useState, useCallback } from 'react';
import { FileText, Plus, Trash2, GripVertical, ArrowDown, ArrowUp, Info, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { OutlineItem } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragOverEvent,
  pointerWithin,
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface OutlineEditorProps {
  outline: OutlineItem[];
  onOutlineChange: (outline: OutlineItem[]) => void;
  onApprove: () => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

interface SortableItemProps {
  item: OutlineItem;
  items: OutlineItem[];
  onUpdateTitle: (id: string, title: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onAdd: (parentId: string | null) => void;
  onRemove: (id: string) => void;
  isOver?: boolean;
  dropPosition?: 'before' | 'after' | 'child' | null;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
}

const SortableItem = ({
  item,
  items,
  onUpdateTitle,
  onMove,
  onAdd,
  onRemove,
  isOver,
  dropPosition,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${(item.level - 1) * 2}rem`,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  const index = items.findIndex((i) => i.id === item.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-start gap-2 p-2 rounded-lg transition-all
        ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''}
        ${dropPosition === 'before' ? 'border-t-2 border-blue-500' : ''}
        ${dropPosition === 'after' ? 'border-b-2 border-blue-500' : ''}
        ${dropPosition === 'child' ? 'border-l-4 border-blue-500' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2" {...attributes} {...listeners}>
          <GripVertical className="w-5 h-5" />
        </div>

        {hasChildren && (
          <button
            onClick={() => onToggleCollapse(item.id)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors mt-2"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6"></div>}
      </div>

      <div className="flex-1">
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdateTitle(item.id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="セクションタイトルを入力..."
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onMove(item.id, 'up')}
          disabled={index === 0 || (index > 0 && items[index - 1].level !== item.level)}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="上に移動"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => onMove(item.id, 'down')}
          disabled={
            index === items.length - 1 || 
            (index < items.length - 1 && items[index + 1].level !== item.level)
          }
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="下に移動"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => onAdd(item.id)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="サブセクションを追加"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="削除"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ドロップ位置の種類
type DropPosition = 'before' | 'after' | 'child' | null;

export function OutlineEditor({ 
  outline, 
  onOutlineChange, 
  onApprove, 
  onRegenerate,
  isLoading = false 
}: OutlineEditorProps) {
  const [showTips, setShowTips] = useState(true);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overItemId, setOverItemId] = useState<UniqueIdentifier | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 型の修正 - 子アイテムの有無を判断する関数
  const hasChildren = useCallback((itemId: string): boolean => {
    const index = outline.findIndex(item => item.id === itemId);
    if (index === -1 || index === outline.length - 1) return false;
    
    const currentLevel = outline[index].level;
    return outline[index + 1].level > currentLevel;
  }, [outline]);

  // 型の修正 - アイテムが折りたたまれているかどうかを判断
  const isCollapsed = (itemId: string): boolean => {
    return collapsedItems.has(itemId);
  };

  // 型の修正 - 折りたたみ状態を切り替える
  const toggleCollapse = (itemId: string) => {
    const newCollapsedItems = new Set(collapsedItems);
    if (newCollapsedItems.has(itemId)) {
      newCollapsedItems.delete(itemId);
    } else {
      newCollapsedItems.add(itemId);
    }
    setCollapsedItems(newCollapsedItems);
  };

  // アイテムが表示されるべきかどうかを判断
  const shouldShowItem = (index: number): boolean => {
    const item = outline[index];
    
    // 親アイテムを探す
    for (let i = index - 1; i >= 0; i--) {
      const potentialParent = outline[i];
      if (potentialParent.level < item.level) {
        // 親が折りたたまれていれば、子は表示しない
        if (isCollapsed(potentialParent.id)) {
          return false;
        }
        
        // さらに親の親も確認していく
        if (!shouldShowItem(i)) {
          return false;
        }
        
        break;
      }
    }
    
    return true;
  };

  // 表示されるアイテムのリストを取得
  const visibleItems = outline.filter((_, index) => shouldShowItem(index));

  const addItem = (parentId: string | null) => {
    const newItem: OutlineItem = {
      id: crypto.randomUUID(),
      title: '新しい項目',
      level: parentId ? outline.find(item => item.id === parentId)?.level! + 1 : 1,
    };

    if (parentId) {
      // 親アイテムを折りたたみから除外（子アイテムを追加したら展開する）
      if (collapsedItems.has(parentId)) {
        const newCollapsedItems = new Set(collapsedItems);
        newCollapsedItems.delete(parentId);
        setCollapsedItems(newCollapsedItems);
      }

      const parentIndex = outline.findIndex(item => item.id === parentId);
      let insertIndex = parentIndex + 1;
      
      // 親の直後のインデックスを探す
      while (
        insertIndex < outline.length && 
        outline[insertIndex].level > outline[parentIndex].level
      ) {
        insertIndex++;
      }
      
      const newOutline = [...outline];
      newOutline.splice(insertIndex, 0, newItem);
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
    
    // 削除されるアイテムを折りたたみリストから削除
    const idsToRemove = outline.slice(itemIndex, endIndex).map(item => item.id);
    const newCollapsedItems = new Set(collapsedItems);
    idsToRemove.forEach(id => {
      if (newCollapsedItems.has(id)) {
        newCollapsedItems.delete(id);
      }
    });
    setCollapsedItems(newCollapsedItems);
    
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
        // 移動する項目とその子項目を取得
        const startIndex = index;
        let endIndex = index + 1;
        while (endIndex < outline.length && outline[endIndex].level > currentItem.level) {
          endIndex++;
        }
        const itemsToMove = newOutline.splice(startIndex, endIndex - startIndex);
        
        // 移動先を計算
        let insertIndex = prevIndex;
        newOutline.splice(insertIndex, 0, ...itemsToMove);
        onOutlineChange(newOutline);
      }
    } else {
      let nextIndex = index + 1;
      while (nextIndex < outline.length && outline[nextIndex].level > currentItem.level) {
        nextIndex++;
      }
      if (nextIndex < outline.length && outline[nextIndex].level === currentItem.level) {
        // 次の同レベル項目の後ろまでのインデックスを計算
        let nextItemEndIndex = nextIndex + 1;
        while (nextItemEndIndex < outline.length && outline[nextItemEndIndex].level > outline[nextIndex].level) {
          nextItemEndIndex++;
        }
        
        // 移動する項目とその子項目を取得
        const startIndex = index;
        let endIndex = index + 1;
        while (endIndex < outline.length && outline[endIndex].level > currentItem.level) {
          endIndex++;
        }
        const itemsToMove = newOutline.splice(startIndex, endIndex - startIndex);
        
        // 移動先インデックスを調整
        let insertIndex = nextItemEndIndex - itemsToMove.length;
        newOutline.splice(insertIndex, 0, ...itemsToMove);
        onOutlineChange(newOutline);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      setOverItemId(null);
      setDropPosition(null);
      return;
    }

    const overId = event.over.id;
    setOverItemId(overId);

    if (activeId === overId) {
      setDropPosition(null);
      return;
    }

    // ドラッグ中のアイテムとドロップ先のアイテムを取得
    const activeIndex = outline.findIndex(item => item.id === String(activeId));
    const overIndex = outline.findIndex(item => item.id === String(overId));
    
    if (activeIndex === -1 || overIndex === -1) {
      setDropPosition(null);
      return;
    }

    const activeItem = outline[activeIndex];
    const overItem = outline[overIndex];

    // ドロップ位置を決定する際の閾値
    const rect = (event.over.rect as DOMRect);
    
    // マウス/タッチポインターの位置
    // @dnd-kitのイベントオブジェクトからポインター位置を取得
    const pointerPosition = {
      y: rect.top + rect.height / 2 // デフォルトは中央
    };

    // 可能な場合は実際のポインター位置を使用
    if ('delta' in event && event.delta) {
      // deltaを使って概算位置を計算
      pointerPosition.y = rect.top + rect.height / 2 + event.delta.y;
    }

    const relativeY = pointerPosition.y - rect.top;
    const threshold = rect.height / 3;

    // ドロップ位置を決定
    let position: DropPosition;
    
    if (relativeY < threshold) {
      // 上部 - 前に配置
      position = 'before';
    } else if (relativeY > rect.height - threshold) {
      // 下部 - 後ろに配置
      position = 'after';
    } else {
      // 中央部 - 子として配置
      position = 'child';
    }

    // 親子関係のチェック - ドラッグ中のアイテムの子にはドロップできない
    if (position === 'child') {
      let isChild = false;
      let index = activeIndex + 1;
      
      while (index < outline.length && outline[index].level > activeItem.level) {
        if (index === overIndex) {
          isChild = true;
          break;
        }
        index++;
      }
      
      if (isChild) {
        // 子アイテムには親をドロップできないので、前後に配置
        position = 'after';
      }
    }

    setDropPosition(position);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    // 実装はhandleDragOverに移行
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // リセット
    const currentPosition = dropPosition;
    setActiveId(null);
    setOverItemId(null);
    setDropPosition(null);
    
    if (!over || !currentPosition) return;
    
    if (active.id !== over.id) {
      const activeIndex = outline.findIndex((item) => item.id === String(active.id));
      const overIndex = outline.findIndex((item) => item.id === String(over.id));
      
      if (activeIndex === -1 || overIndex === -1) return;
      
      const activeItem = outline[activeIndex];
      const overItem = outline[overIndex];
      
      // 移動する項目とその子項目を取得
      const activeItemLevel = activeItem.level;
      let activeItemEndIndex = activeIndex + 1;
      while (
        activeItemEndIndex < outline.length && 
        outline[activeItemEndIndex].level > activeItemLevel
      ) {
        activeItemEndIndex++;
      }
      const itemsToMove = outline.slice(activeIndex, activeItemEndIndex);
      
      // 新しい配列を作成
      const newOutline = [...outline];
      
      // まず元の項目を削除
      newOutline.splice(activeIndex, itemsToMove.length);
      
      // 移動先インデックスを計算
      let insertIndex: number;
      let newLevel: number;
      
      switch (currentPosition) {
        case 'before':
          // 前に配置 - 同じレベル
          insertIndex = newOutline.findIndex((item) => item.id === String(over.id));
          newLevel = overItem.level;
          break;
          
        case 'after':
          // 後に配置 - 同じレベル
          insertIndex = newOutline.findIndex((item) => item.id === String(over.id)) + 1;
          
          // overItemの子アイテムの後ろに配置
          while (
            insertIndex < newOutline.length && 
            newOutline[insertIndex].level > overItem.level
          ) {
            insertIndex++;
          }
          
          newLevel = overItem.level;
          break;
          
        case 'child':
          // 子として配置
          insertIndex = newOutline.findIndex((item) => item.id === String(over.id)) + 1;
          newLevel = overItem.level + 1;
          
          // 子として配置する場合、親を展開状態にする
          if (collapsedItems.has(String(over.id))) {
            const newCollapsedItems = new Set(collapsedItems);
            newCollapsedItems.delete(String(over.id));
            setCollapsedItems(newCollapsedItems);
          }
          break;
        
        default:
          return;
      }
      
      // レベル差を計算して子アイテムにも適用
      const levelDiff = newLevel - activeItemLevel;
      
      // 階層レベルを調整したアイテムを作成
      const adjustedItems = itemsToMove.map(item => ({
        ...item,
        level: item.level + levelDiff
      }));
      
      // 計算したインデックスに項目を挿入
      newOutline.splice(insertIndex, 0, ...adjustedItems);
      
      onOutlineChange(newOutline);
    }
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    return outline.find((item) => item.id === String(activeId)) || null;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">アウトライン作成</h2>
        </div>

        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">ヒント</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ドラッグ&ドロップでセクションの順序を入れ替えられます</li>
                <li>「+」ボタンで新しいセクションを追加できます</li>
                <li>上下の矢印でセクションのレベルを変更できます</li>
                <li>子アイテムを持つセクションは▶をクリックして折りたたみ可能です</li>
              </ul>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <p className="text-gray-600 text-lg">アウトラインを生成しています...</p>
          </div>
        ) : (
          <>
            <div className="border border-gray-200 rounded-lg mb-4">
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={visibleItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  {visibleItems.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      items={outline}
                      onUpdateTitle={updateItemTitle}
                      onMove={moveItem}
                      onAdd={addItem}
                      onRemove={removeItem}
                      isOver={overItemId === item.id}
                      dropPosition={overItemId === item.id ? dropPosition : null}
                      hasChildren={hasChildren(item.id)}
                      isCollapsed={isCollapsed(item.id)}
                      onToggleCollapse={toggleCollapse}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white shadow-xl rounded-lg p-2 border-2 border-blue-500">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-blue-600" />
                        <div className="font-medium text-gray-800">{getActiveItem()?.title}</div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            <button
              onClick={() => addItem(null)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors w-full justify-center border-2 border-dashed border-blue-200 hover:border-blue-400"
              disabled={isLoading}
            >
              <Plus className="w-5 h-5" />
              <span>新しいセクションを追加</span>
            </button>
          </>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={onRegenerate}
            className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            アウトラインを再生成
          </button>
          
          <button
            onClick={onApprove}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={outline.length === 0 || isLoading}
          >
            このアウトラインで続ける
          </button>
        </div>
      </div>
    </div>
  );
}