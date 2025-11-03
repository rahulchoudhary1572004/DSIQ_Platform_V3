import React from 'react';
import { Save } from 'lucide-react';
const BackupRestore = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Backup & Restore</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Save className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Backup & Restore Coming Soon</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Manage data backups and restore points, set retention policies, and automate cleanup processes.
        </p>
        <button className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
          Notify Me
        </button>
      </div>
    </div>
  );
};

export default BackupRestore;
