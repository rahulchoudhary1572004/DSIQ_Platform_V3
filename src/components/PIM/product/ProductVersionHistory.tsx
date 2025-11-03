import { useState } from 'react';
import { ArrowLeft, Eye, Undo, GitBranch } from "lucide-react";
import VersionComparison from './VersionComparison';

const ProductVersionHistory = ({ product, onClose, onRestore }) => {
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Mock version data - in real app this would come from API
  const versions = [
    {
      id: '1',
      version: 5,
      timestamp: '2024-01-15 14:30:00',
      author: 'John Doe',
      changes: ['Updated price', 'Modified description'],
      data: { name: 'Wireless Headphones v5', price: 99.99 },
      status: 'published'
    },
    {
      id: '2',
      version: 4,
      timestamp: '2024-01-14 16:45:00',
      author: 'Jane Smith',
      changes: ['Added new images', 'Updated keywords'],
      data: { name: 'Wireless Headphones v4', price: 89.99 },
      status: 'published'
    },
    {
      id: '3',
      version: 3,
      timestamp: '2024-01-13 09:15:00',
      author: 'Bob Wilson',
      changes: ['Initial creation'],
      data: { name: 'Wireless Headphones v3', price: 79.99 },
      status: 'archived'
    }
  ];

  const handleVersionSelect = (versionId) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setShowComparison(true);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      published: 'bg-blue-100 text-blue-800 border border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border border-gray-300',
      archived: 'bg-gray-50 text-gray-600 border border-gray-200'
    };
    return <span className={`px-2 py-1 rounded text-xs ${variants[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>{status}</span>;
  };

  if (showComparison && selectedVersions.length === 2) {
    const version1 = versions.find(v => v.id === selectedVersions[0]);
    const version2 = versions.find(v => v.id === selectedVersions[1]);
    return (
      <VersionComparison
        version1={version1}
        version2={version2}
        onClose={() => setShowComparison(false)}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 border border-gray-300" title="Back">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <GitBranch className="h-5 w-5 text-blue-800" />
          <span className="font-semibold text-lg text-gray-800">Version History - {product?.name || 'Product'}</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedVersions.length === 2 && (
            <button onClick={handleCompare} className="px-3 py-1 border border-blue-600 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm font-medium">
              Compare Versions
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="p-2 text-left font-medium text-gray-700">Select</th>
              <th className="p-2 text-left font-medium text-gray-700">Version</th>
              <th className="p-2 text-left font-medium text-gray-700">Timestamp</th>
              <th className="p-2 text-left font-medium text-gray-700">Author</th>
              <th className="p-2 text-left font-medium text-gray-700">Changes</th>
              <th className="p-2 text-left font-medium text-gray-700">Status</th>
              <th className="p-2 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <tr key={version.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => handleVersionSelect(version.id)}
                    disabled={selectedVersions.length >= 2 && !selectedVersions.includes(version.id)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                </td>
                <td className="p-2 font-medium text-blue-800">v{version.version}</td>
                <td className="p-2 text-gray-600">{version.timestamp}</td>
                <td className="p-2 text-gray-700">{version.author}</td>
                <td className="p-2">
                  <div className="max-w-xs space-y-1">
                    {version.changes.map((change, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {change}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-2">{getStatusBadge(version.status)}</td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-100" title="View">
                      <Eye className="h-4 w-4 text-blue-800" />
                    </button>
                    <button 
                      className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                      title="Restore"
                      onClick={() => onRestore(version)}
                    >
                      <Undo className="h-4 w-4 text-green-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductVersionHistory; 
