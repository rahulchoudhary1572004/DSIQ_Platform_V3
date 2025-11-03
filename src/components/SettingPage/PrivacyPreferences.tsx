import React from 'react';
const PrivacyPreferences = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy Preferences</h2>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-medium text-gray-800">Data Visibility & Anonymization</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-800">User Activity Tracking</h4>
                  <p className="text-xs text-gray-500">Track user activity for analytics and improvement</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="toggle-user-tracking" className="sr-only" defaultChecked />
                  <label htmlFor="toggle-user-tracking" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                    <span className="absolute left-1 top-1 block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-4"></span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Anonymize User Data</h4>
                  <p className="text-xs text-gray-500">Remove personally identifiable information from analytics</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="toggle-anonymize" className="sr-only" defaultChecked />
                  <label htmlFor="toggle-anonymize" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                    <span className="absolute left-1 top-1 block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-4"></span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Data Sharing with Third Parties</h4>
                  <p className="text-xs text-gray-500">Allow data to be shared with integrated third-party services</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input type="checkbox" id="toggle-data-sharing" className="sr-only" defaultChecked />
                  <label htmlFor="toggle-data-sharing" className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer">
                    <span className="absolute left-1 top-1 block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-4"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                For more information on how we handle data privacy, please refer to our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPreferences;