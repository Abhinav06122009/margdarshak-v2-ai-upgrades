
import React from 'react';
import { folders } from './folders';

interface FoldersGridProps {
  onFolderSelect: (folderId: string) => void;
}

export const FoldersGrid = ({ onFolderSelect }: FoldersGridProps) => {
  return (
    <div className="px-6 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-white">FOLDERS</h2>
      <div className="grid grid-cols-3 gap-4">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className="bg-transparent border: slate-100 rounded-2xl rounded-lg p-4 hover:bg-transparent transition-colors text-center"
          >
            <div className="text-2xl mb-2">{folder.icon}</div>
            <div className="text-sm font-medium">{folder.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
