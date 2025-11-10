// components/DAM/DAMSidebar_FolderTree.tsx - With Real Data Integration
import React, { FC, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Upload,
  Folder as FolderIcon,
  ArrowRight,
  Plus,
  Search as SearchIcon,
  ChevronDown,
  Edit2,
  Trash2,
  GripVertical,
} from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";
import { digitalAssets } from "./dam.data"; // ADDED: Import real data

type ActiveTab = "library" | "upload" | "folders";

interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "item";
  parentId?: string | null;
  children?: FolderNode[];
  isExpanded?: boolean;
  assetIds?: number[]; // CHANGED: Use number[] for actual asset IDs
}

interface DAMSidebarProps {
  isCollapsed: boolean;
  activeTab: ActiveTab;
  sortedAssets: DigitalAsset[];
  selectedAssets: Set<number>;
  onTabChange: (tab: ActiveTab) => void;
  onToggleCollapse: () => void;
  onFolderSelect: (folderId: string | null, assets: DigitalAsset[]) => void;
}

interface DragState {
  draggedId: string | null;
  overFolderId: string | null;
}

const TAB_CONFIG: Record<ActiveTab, { label: string; icon: React.ReactNode; description: string }> = {
  library: { label: "Library", icon: <Grid3x3 className="h-5 w-5" />, description: "All assets" },
  upload: { label: "Upload", icon: <Upload className="h-5 w-5" />, description: "Add new" },
  folders: { label: "Folders", icon: <FolderIcon className="h-5 w-5" />, description: "Organization" },
};

// IMPROVED: Get all assets from dam.data
const getAllAssets = (): DigitalAsset[] => {
  const allAssets: DigitalAsset[] = [];
  Object.values(digitalAssets).forEach((assets) => {
    allAssets.push(...assets);
  });
  return allAssets;
};

const allDataAssets = getAllAssets();

// IMPROVED: Sample tree with real asset IDs from dam.data
const SAMPLE_TREE: FolderNode[] = [
  {
    id: "f-1",
    name: "Electronics",
    type: "folder",
    isExpanded: true,
    assetIds: [101, 102, 103, 104, 105, 106], // Assets from product 1
    children: [
      {
        id: "f-1-1",
        name: "Wireless Headphones Pro",
        type: "folder",
        isExpanded: true,
        assetIds: [101, 102, 103],
        children: [
          {
            id: "f-1-1-1",
            name: "Videos",
            type: "folder",
            isExpanded: false,
            assetIds: [101],
            children: [],
            parentId: "f-1-1",
          },
          {
            id: "f-1-1-2",
            name: "Images",
            type: "folder",
            isExpanded: false,
            assetIds: [102, 104, 105],
            children: [],
            parentId: "f-1-1",
          },
          {
            id: "f-1-1-3",
            name: "Documents",
            type: "folder",
            isExpanded: false,
            assetIds: [103, 106],
            children: [],
            parentId: "f-1-1",
          },
        ],
        parentId: "f-1",
      },
      {
        id: "f-1-2",
        name: "Smart Watch Series X",
        type: "folder",
        isExpanded: false,
        assetIds: [201, 202],
        children: [
          {
            id: "f-1-2-1",
            name: "Product Shots",
            type: "folder",
            isExpanded: false,
            assetIds: [201],
            children: [],
            parentId: "f-1-2",
          },
          {
            id: "f-1-2-2",
            name: "Promotional",
            type: "folder",
            isExpanded: false,
            assetIds: [202],
            children: [],
            parentId: "f-1-2",
          },
        ],
        parentId: "f-1",
      },
    ],
  },
  {
    id: "f-2",
    name: "Archive",
    type: "folder",
    isExpanded: false,
    assetIds: [],
    children: [
      {
        id: "f-2-1",
        name: "Old Projects",
        type: "folder",
        isExpanded: false,
        assetIds: [],
        children: [],
        parentId: "f-2",
      },
    ],
  },
  {
    id: "f-3",
    name: "Marketing",
    type: "folder",
    isExpanded: false,
    assetIds: [],
    children: [
      {
        id: "f-3-1",
        name: "Social Media Assets",
        type: "folder",
        isExpanded: false,
        assetIds: [101, 201],
        children: [],
        parentId: "f-3",
      },
      {
        id: "f-3-2",
        name: "Campaign Materials",
        type: "folder",
        isExpanded: false,
        assetIds: [102, 103],
        children: [],
        parentId: "f-3",
      },
    ],
  },
];

const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const DAMSidebar: FC<DAMSidebarProps> = ({
  isCollapsed,
  activeTab,
  sortedAssets,
  selectedAssets,
  onTabChange,
  onToggleCollapse,
  onFolderSelect,
}) => {
  const [tree, setTree] = useState<FolderNode[]>(() => deepClone(SAMPLE_TREE));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    overFolderId: null,
  });
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  const createFolder = (parentId: string | null = null) => {
    const newNode: FolderNode = {
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "New Folder",
      type: "folder",
      parentId,
      children: [],
      assetIds: [],
      isExpanded: true,
    };

    const newTree = deepClone(tree);

    if (!parentId) {
      newTree.push(newNode);
    } else {
      const updateTree = (nodes: FolderNode[]): boolean => {
        for (const n of nodes) {
          if (n.id === parentId) {
            n.children = [...(n.children || []), newNode];
            n.isExpanded = true;
            return true;
          }
          if (n.children && updateTree(n.children)) return true;
        }
        return false;
      };
      updateTree(newTree);
    }

    setTree(newTree);
    setRenamingId(newNode.id);
  };

  const renameFolder = (folderId: string, newName: string) => {
    if (!newName.trim()) return;

    const newTree = deepClone(tree);
    const updateTree = (nodes: FolderNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === folderId) {
          n.name = newName.trim();
          return true;
        }
        if (n.children && updateTree(n.children)) return true;
      }
      return false;
    };

    updateTree(newTree);
    setTree(newTree);
    setRenamingId(null);
  };

  const deleteFolder = (folderId: string) => {
    const deleteNode = (nodes: FolderNode[]): FolderNode[] =>
      nodes
        .filter((n) => n.id !== folderId)
        .map((n) => ({
          ...n,
          children: n.children ? deleteNode(n.children) : [],
        }));

    const newTree = deleteNode(tree);
    setTree(newTree);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
      onFolderSelect(null, []);
    }
  };

  const moveFolder = (draggedId: string, targetParentId: string | null) => {
    const findAndRemove = (
      nodes: FolderNode[]
    ): { node: FolderNode | null; remaining: FolderNode[] } => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === draggedId) {
          const node = nodes[i];
          return {
            node,
            remaining: [...nodes.slice(0, i), ...nodes.slice(i + 1)],
          };
        }
        if (nodes[i].children) {
          const result = findAndRemove(nodes[i].children);
          if (result.node) {
            nodes[i].children = result.remaining;
            return { node: result.node, remaining: nodes };
          }
        }
      }
      return { node: null, remaining: nodes };
    };

    const newTree = deepClone(tree);
    const { node: draggedNode, remaining: afterRemoval } = findAndRemove(newTree);

    if (!draggedNode) return;

    draggedNode.parentId = targetParentId;

    if (!targetParentId) {
      setTree([...afterRemoval, draggedNode]);
    } else {
      const addNode = (nodes: FolderNode[]): boolean => {
        for (const n of nodes) {
          if (n.id === targetParentId) {
            n.children = [...(n.children || []), draggedNode];
            return true;
          }
          if (n.children && addNode(n.children)) return true;
        }
        return false;
      };
      addNode(afterRemoval);
      setTree(afterRemoval);
    }

    setDragState({ draggedId: null, overFolderId: null });
  };

  const toggleFolder = (id: string) => {
    const newTree = deepClone(tree);
    const toggle = (nodes: FolderNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === id) {
          n.isExpanded = !n.isExpanded;
          return true;
        }
        if (n.children && toggle(n.children)) return true;
      }
      return false;
    };
    toggle(newTree);
    setTree(newTree);
  };

  // IMPROVED: Get assets from real dam.data using numeric IDs
  const getAssetsForFolder = (folderId: string | null): DigitalAsset[] => {
    if (!folderId) return [];

    const findFolder = (nodes: FolderNode[]): FolderNode | null => {
      for (const n of nodes) {
        if (n.id === folderId) return n;
        if (n.children) {
          const found = findFolder(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const folder = findFolder(tree);
    if (!folder || !folder.assetIds || folder.assetIds.length === 0) return [];

    // Filter real assets from dam.data by numeric ID with safety check
    return allDataAssets.filter((asset) =>
      asset && asset.id && folder.assetIds?.includes(asset.id)
    );
  };

  const filterTree = (nodes: FolderNode[], query: string): FolderNode[] => {
    if (!query.trim()) return nodes;
    const q = query.toLowerCase();

    return nodes
      .filter((n) => n.name.toLowerCase().includes(q))
      .map((n) => ({
        ...n,
        children: n.children ? filterTree(n.children, query) : [],
        isExpanded: n.children && filterTree(n.children, query).length > 0,
      }));
  };

  const visibleTree = useMemo(() => filterTree(tree, searchQuery), [tree, searchQuery]);

  const renderNode = (node: FolderNode, level = 0): React.ReactNode => {
    const paddingLeft = 12 + level * 12;
    const isSelected = selectedFolderId === node.id;
    const isDragged = dragState.draggedId === node.id;
    const isDropTarget = dragState.overFolderId === node.id;
    const isHovered = hoveredFolderId === node.id;

    return (
      <div key={node.id}>
        <div
          draggable
          onDragStart={() => {
            setDragState({ draggedId: node.id, overFolderId: null });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragState((prev) => ({ ...prev, overFolderId: node.id }));
          }}
          onDragLeave={() => {
            setDragState((prev) =>
              prev.overFolderId === node.id
                ? { ...prev, overFolderId: null }
                : prev
            );
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragState.draggedId && dragState.draggedId !== node.id) {
              moveFolder(dragState.draggedId, node.id);
            }
            setDragState({ draggedId: null, overFolderId: null });
          }}
          onDragEnd={() => {
            setDragState({ draggedId: null, overFolderId: null });
          }}
          onMouseEnter={() => setHoveredFolderId(node.id)}
          onMouseLeave={() => setHoveredFolderId(null)}
          className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-150 cursor-grab active:cursor-grabbing ${
            isDragged ? "opacity-50 bg-gray-100" : ""
          } ${
            isDropTarget
              ? "bg-orange-100 border-2 border-orange-400 ring-2 ring-orange-200/50"
              : isSelected
                ? "bg-orange-50 border border-orange-300 shadow-sm"
                : isHovered
                  ? "bg-gray-100/80"
                  : "hover:bg-gray-50"
          }`}
          style={{ paddingLeft }}
          onClick={() => {
            setSelectedFolderId(node.id);
            const folderAssets = getAssetsForFolder(node.id);
            onFolderSelect(node.id, folderAssets);
          }}
        >
          {/* Drag Handle */}
          <div className={`p-0 flex-shrink-0 transition-opacity duration-150 cursor-grab ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <GripVertical className="h-3.5 w-3.5 text-gray-400" />
          </div>

          {/* Chevron */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(node.id);
            }}
            className="p-0 flex-shrink-0"
          >
            {node.children && node.children.length > 0 ? (
              <ChevronDown
                className={`h-4 w-4 transform transition-transform duration-200 text-gray-500 ${
                  node.isExpanded ? "rotate-0" : "-rotate-90"
                }`}
              />
            ) : (
              <div className="w-4" />
            )}
          </button>

          {/* Icon */}
          <FolderIcon className={`h-4 w-4 flex-shrink-0 transition-colors duration-150 ${
            isSelected ? "text-orange-600" : "text-amber-500"
          }`} />

          {/* Name */}
          {renamingId === node.id ? (
            <input
              autoFocus
              defaultValue={node.name}
              onBlur={(e) => renameFolder(node.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") renameFolder(node.id, e.currentTarget.value);
                if (e.key === "Escape") setRenamingId(null);
              }}
              className="flex-1 px-2 py-1 text-sm bg-white border-2 border-orange-400 rounded-md outline-none focus:ring-2 focus:ring-orange-300/50"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`flex-1 truncate font-medium ${
              isSelected ? "text-orange-900" : "text-gray-700"
            }`}>
              {node.name}
            </span>
          )}

          {/* Actions */}
          <div className={`flex items-center gap-1 transition-opacity duration-150 flex-shrink-0 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                createFolder(node.id);
              }}
              className="p-1.5 hover:bg-orange-200/60 rounded-md transition-colors duration-150"
              title="New subfolder"
            >
              <Plus className="h-3.5 w-3.5 text-orange-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingId(node.id);
              }}
              className="p-1.5 hover:bg-gray-300/60 rounded-md transition-colors duration-150"
              title="Rename"
            >
              <Edit2 className="h-3.5 w-3.5 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFolder(node.id);
              }}
              className="p-1.5 hover:bg-red-200/60 rounded-md transition-colors duration-150"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </button>
          </div>

          {/* Asset Count */}
          {node.assetIds && node.assetIds.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
              isSelected
                ? "bg-orange-200 text-orange-800"
                : "bg-gray-200 text-gray-700"
            }`}>
              {node.assetIds.length}
            </span>
          )}
        </div>

        {node.isExpanded && node.children && node.children.length > 0 && (
          <div className="space-y-1 animation-reveal">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <aside 
        className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-8 flex-shrink-0"
        style={{ 
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width'
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          title="Expand"
        >
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>

        <div className="flex flex-col gap-4">
          {Object.entries(TAB_CONFIG).map(([key, { icon }]) => (
            <button
              key={key}
              onClick={() => onTabChange(key as ActiveTab)}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                activeTab === key
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title={TAB_CONFIG[key as ActiveTab].label}
            >
              {icon}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className="w-80 bg-white flex flex-col border-r border-gray-200 flex-shrink-0"
      style={{ 
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width'
      }}
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-light text-grey-600">DAM</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            title="Collapse"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 font-light">Digital Asset Manager</p>
      </div>

      {/* TABS */}
      <nav className="px-5 py-4 space-y-1 border-b border-gray-200">
        {Object.entries(TAB_CONFIG).map(([key, { label, icon, description }]) => (
          <button
            key={key}
            onClick={() => onTabChange(key as ActiveTab)}
            className={`w-full px-4 py-3 rounded-lg flex items-start justify-between transition-colors duration-150 group ${
              activeTab === key
                ? "bg-orange-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3 flex-1 text-left">
              <span className="flex-shrink-0">
                {icon}
              </span>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    activeTab === key ? "text-orange-100" : "text-gray-500"
                  }`}
                >
                  {description}
                </p>
              </div>
            </div>
            {activeTab === key && (
              <ArrowRight className="h-4 w-4 opacity-60 transition-transform duration-150 group-hover:translate-x-1" />
            )}
          </button>
        ))}
      </nav>

      {/* FOLDERS TAB */}
      {activeTab === "folders" && (
        <>
          {/* SEARCH + CREATE */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400/50">
              <SearchIcon className="h-4 w-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search folders"
                className="bg-transparent flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => createFolder(null)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-orange-100 rounded-lg transition-colors duration-150"
              title="New folder"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* TREE */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <div className="space-y-1">
              {visibleTree.length === 0 ? (
                <div className="text-sm text-gray-500 px-3 py-12 text-center animate-fade-in">
                  <FolderIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No folders yet</p>
                  <p className="text-xs mt-1 opacity-75">Click + to create folder</p>
                </div>
              ) : (
                visibleTree.map((node) => renderNode(node, 0))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab !== "folders" && <div className="flex-1" />}

      {/* FOOTER */}
      <div className="px-6 py-5 border-t border-gray-200">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">ASSETS</p>
            <p className="text-2xl font-light text-orange-600">
              {sortedAssets.length}
            </p>
          </div>
          {selectedAssets.size > 0 && (
            <div className="pt-4 border-t border-gray-200 animate-fade-in">
              <p className="text-xs text-gray-600">
                <span className="font-medium text-orange-600">
                  {selectedAssets.size}
                </span>{" "}
                selected
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .animation-reveal {
          animation: slideDown 0.2s ease-out;
          overflow: hidden;
        }
      `}</style>
    </aside>
  );
};

export default DAMSidebar;
