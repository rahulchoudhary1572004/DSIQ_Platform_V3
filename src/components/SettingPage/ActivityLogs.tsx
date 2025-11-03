import { useState } from 'react';
import { 
  BarChart4, 
  Download, 
  Users, 
  Save, 
  Lock, 
  BarChart2, 
  FileText,
  Calendar, 
  Clock,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Activity,
  TrendingUp,
  PieChart,
  LayoutGrid
} from 'lucide-react';

export default function ActivityLogs() {
  const [activeTab, setActiveTab] = useState('log');
  
  // Enhanced data with user-feature relationships
  const users = [
    { id: 1, name: 'John Doe', role: 'Administrator' },
    { id: 2, name: 'Anna Rodriguez', role: 'Manager' },
    { id: 3, name: 'Kevin Miller', role: 'Analyst' },
    { id: 4, name: 'Tina Smith', role: 'Marketing' },
    { id: 5, name: 'Robert Brown', role: 'Sales' }
  ];
  
  const features = [
    { id: 1, name: 'Dashboards', icon: BarChart4 },
    { id: 2, name: 'Reports', icon: FileText },
    { id: 3, name: 'Exports', icon: Download },
    { id: 4, name: 'User Management', icon: Users },
    { id: 5, name: 'Settings', icon: Lock }
  ];
  
  // This data connects users to features with usage count
  const userFeatureData = [
    { userId: 1, featureId: 1, count: 87 },
    { userId: 1, featureId: 2, count: 24 },
    { userId: 1, featureId: 3, count: 15 },
    { userId: 2, featureId: 1, count: 53 },
    { userId: 2, featureId: 3, count: 45 },
    { userId: 3, featureId: 2, count: 67 },
    { userId: 3, featureId: 4, count: 20 },
    { userId: 4, featureId: 1, count: 38 },
    { userId: 4, featureId: 2, count: 27 },
    { userId: 5, featureId: 3, count: 21 },
    { userId: 5, featureId: 5, count: 22 }
  ];
  
  // Computed data for existing views
  const mostActiveUsers = users.map(user => {
    const totalActions = userFeatureData
      .filter(item => item.userId === user.id)
      .reduce((sum, item) => sum + item.count, 0);
    
    return { ...user, actions: totalActions };
  }).sort((a, b) => b.actions - a.actions);
  
  const featureUsage = features.map(feature => {
    const count = userFeatureData
      .filter(item => item.featureId === feature.id)
      .reduce((sum, item) => sum + item.count, 0);
    
    return { ...feature, count };
  }).sort((a, b) => b.count - a.count);
  
  const activityLog = [
    { user: 'John Doe', action: 'Exported sales dashboard', time: '10 minutes ago', icon: Download, status: 'success', featureName: 'Exports' },
    { user: 'Anna Rodriguez', action: 'Created new user account', time: '1 hour ago', icon: Users, status: 'success', featureName: 'User Management' },
    { user: 'System', action: 'Automated backup completed', time: '3 hours ago', icon: Save, status: 'success', featureName: 'System' },
    { user: 'Kevin Miller', action: 'Modified privacy settings', time: '5 hours ago', icon: Lock, status: 'warning', featureName: 'Settings' },
    { user: 'Tina Smith', action: 'Created new marketing dashboard', time: 'Yesterday, 3:45 PM', icon: BarChart2, status: 'success', featureName: 'Dashboards' },
    { user: 'Robert Brown', action: 'Generated monthly report', time: 'Yesterday, 10:30 AM', icon: FileText, status: 'success', featureName: 'Reports' }
  ];
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-emerald-100 text-emerald-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getFeatureColor = (featureId) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-amber-100 text-amber-600',
      'bg-rose-100 text-rose-600'
    ];
    return colors[(featureId - 1) % colors.length];
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 text-sm font-medium ${
        activeTab === id
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );
  
  // Get top features for a specific user
  const getUserTopFeatures = (userId) => {
    return userFeatureData
      .filter(item => item.userId === userId)
      .sort((a, b) => b.count - a.count)
      .map(item => {
        const feature = features.find(f => f.id === item.featureId);
        return { ...feature, count: item.count };
      });
  };
  
  // Get top users for a specific feature
  const getFeatureTopUsers = (featureId) => {
    return userFeatureData
      .filter(item => item.featureId === featureId)
      .sort((a, b) => b.count - a.count)
      .map(item => {
        const user = users.find(u => u.id === item.userId);
        return { ...user, count: item.count };
      });
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Activity Analytics</h1>
          </div>
          <div className="text-sm text-gray-500">
            Monitor system activities and user engagement metrics
          </div>
        </header>
        
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <TabButton id="log" label="Activity Log" icon={Activity} />
              <TabButton id="users" label="User Activity" icon={Users} />
              <TabButton id="features" label="Feature Usage" icon={TrendingUp} />
              <TabButton id="analysis" label="User-Feature Analysis" icon={LayoutGrid} />
            </div>
          </div>
          
          {activeTab === 'log' && (
            <div>
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-800">Recent Activities</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search activities..."
                      className="pl-9 pr-4 py-2 w-64 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {activityLog.map((item, index) => (
                  <div key={index} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${getStatusColor(item.status)}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{item.user}</h4>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {item.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">{item.action}</p>
                        {item.featureName && item.featureName !== 'System' && (
                          <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                            {item.featureName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-white">
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(page => (
                    <button 
                      key={page} 
                      className={`h-8 w-8 flex items-center justify-center rounded-md ${
                        page === 1 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center px-3 py-1 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-800 mb-4">Most Active Users</h3>
              
              <div className="space-y-6">
                {mostActiveUsers.map((user, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-100 p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium text-gray-800">{user.name}</h4>
                            <p className="text-xs text-gray-500">{user.role}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-600">{user.actions} actions</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(user.actions / mostActiveUsers[0].actions) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-2">TOP FEATURES USED</h5>
                      <div className="flex flex-wrap gap-2">
                        {getUserTopFeatures(user.id).slice(0, 3).map((feature, idx) => (
                          <div key={idx} className={`text-xs px-2 py-1 rounded-full flex items-center ${getFeatureColor(feature.id)}`}>
                            <feature.icon className="h-3 w-3 mr-1" />
                            {feature.name}
                            <span className="ml-1 font-medium">({feature.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'features' && (
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-800 mb-4">Feature Utilization</h3>
              
              <div className="space-y-6">
                {featureUsage.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-100 p-4 hover:border-green-200 transition-colors">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getFeatureColor(feature.id)}`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-800">{feature.name}</h4>
                          <span className="text-sm font-medium text-green-600">{feature.count} uses</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(feature.count / featureUsage[0].count) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-500 mb-2">TOP USERS</h5>
                      <div className="flex flex-wrap gap-2">
                        {getFeatureTopUsers(feature.id).slice(0, 3).map((user, idx) => (
                          <div key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center">
                            {user.name}
                            <span className="ml-1 font-medium">({user.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'analysis' && (
            <div className="p-6">
              <div className="flex mb-6 justify-between items-center">
                <h3 className="text-base font-medium text-gray-800">User-Feature Relationship Analysis</h3>
                <div className="flex gap-2">
                  <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5">
                    <option>All Users</option>
                    {users.map(user => (
                      <option key={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5">
                    <option>All Features</option>
                    {features.map(feature => (
                      <option key={feature.id}>{feature.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Feature Usage by User</h4>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          {features.map(feature => (
                            <th key={feature.id} className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex flex-col items-center">
                                <feature.icon className="h-4 w-4 mb-1" />
                                {feature.name}
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => {
                          const userFeatures = getUserTopFeatures(user.id);
                          const totalCount = userFeatures.reduce((sum, feature) => sum + feature.count, 0);
                          
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.role}</div>
                                  </div>
                                </div>
                              </td>
                              
                              {features.map(feature => {
                                const usage = userFeatureData.find(
                                  item => item.userId === user.id && item.featureId === feature.id
                                );
                                const count = usage ? usage.count : 0;
                                const maxCount = Math.max(...userFeatureData.map(item => item.count));
                                const intensity = count ? Math.max(0.1, count / maxCount) : 0;
                                
                                return (
                                  <td key={feature.id} className="px-4 py-4 whitespace-nowrap text-center">
                                    {count > 0 ? (
                                      <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center"
                                           style={{ 
                                             backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                                             color: intensity > 0.5 ? 'white' : '#1e40af'
                                           }}>
                                        {count}
                                      </div>
                                    ) : (
                                      <div className="text-gray-300">-</div>
                                    )}
                                  </td>
                                );
                              })}
                              
                              <td className="px-4 py-4 whitespace-nowrap text-center font-medium text-blue-600">
                                {totalCount}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Feature Distribution by User</h4>
                  <div className="space-y-4">
                    {users.slice(0, 3).map(user => {
                      const topFeatures = getUserTopFeatures(user.id);
                      const totalActions = topFeatures.reduce((sum, f) => sum + f.count, 0);
                      
                      return (
                        <div key={user.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-xs">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({totalActions} actions)</span>
                          </div>
                          <div className="flex h-6 rounded-md overflow-hidden">
                            {topFeatures.map((feature, idx) => {
                              const width = (feature.count / totalActions) * 100;
                              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
                              
                              return width > 0 ? (
                                <div 
                                  key={idx} 
                                  className={`${colors[feature.id % colors.length]} relative group`}
                                  style={{ width: `${width}%` }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 transition-opacity text-white text-xs">
                                    {feature.name}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="text-xs text-gray-500">
                              Most used: <span className="font-medium">{topFeatures[0]?.name || 'None'}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">{topFeatures.length}</span> features used
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">User Distribution by Feature</h4>
                  <div className="space-y-4">
                    {features.slice(0, 3).map(feature => {
                      const topUsers = getFeatureTopUsers(feature.id);
                      const totalUsage = topUsers.reduce((sum, u) => sum + u.count, 0);
                      
                      return (
                        <div key={feature.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${getFeatureColor(feature.id)}`}>
                              <feature.icon className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium">{feature.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({totalUsage} uses)</span>
                          </div>
                          <div className="flex h-6 rounded-md overflow-hidden">
                            {topUsers.map((user, idx) => {
                              const width = (user.count / totalUsage) * 100;
                              const colors = ['bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800'];
                              
                              return width > 0 ? (
                                <div 
                                  key={idx} 
                                  className={`${colors[idx % colors.length]} relative group`}
                                  style={{ width: `${width}%` }}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 transition-opacity text-white text-xs">
                                    {user.name}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="text-xs text-gray-500">
                              Top user: <span className="font-medium">{topUsers[0]?.name || 'None'}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">{topUsers.length}</span> users
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-800">Activity Timeline</h3>
            </div>
            <div className="p-4 h-64 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500 text-sm">Activity timeline chart would go here</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-800">Quick Stats</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 text-xs font-medium mb-1">ACTIVE USERS</div>
                  <div className="text-2xl font-bold text-gray-900">247</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +12% this week
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 text-xs font-medium mb-1">TOTAL ACTIONS</div>
                  <div className="text-2xl font-bold text-gray-900">1,423</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +8% this week
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-600 text-xs font-medium mb-1">AVG SESSION</div>
                  <div className="text-2xl font-bold text-gray-900">24m</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +3% this week
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="text-amber-600 text-xs font-medium mb-1">RETENTION</div>
                  <div className="text-2xl font-bold text-gray-900">86%</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +5% this week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}