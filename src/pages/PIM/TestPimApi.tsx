/**
 * PIM API Test Component
 * Test all PIM API endpoints and functionality
 */

import React, { useState } from 'react';
import {
  useViewTemplates,
  useViewTemplateOperations,
  viewTemplateService,
  ENV,
  type ViewTemplate,
  type CreateViewTemplateInput,
} from '../../api/pim';

const TestPimApi: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'hooks' | 'services'>('hooks');

  const orgId = ENV.ORG_ID;
  
  // View Template Hooks
  const { 
    templates, 
    loading: templatesLoading, 
    error: templatesError, 
    fetchTemplates 
  } = useViewTemplates(orgId);
  
  const {
    loading: templateOpsLoading,
    getById,
    create,
    update,
    delete: deleteTemplate,
  } = useViewTemplateOperations(orgId);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [`${emoji} [${timestamp}] ${message}`, ...prev]);
  };

  // ============================================================================
  // VIEW TEMPLATE HOOKS TESTS
  // ============================================================================

  const testFetchAllTemplates = async () => {
    addResult('Testing: Fetch all view templates...', 'info');
    try {
      const result = await fetchTemplates({
        fields: ['id', 'name', 'sections { id title order attributes { id name type required } }'],
      });
      addResult(`Success: Fetched ${result.length} templates`, 'success');
      console.log('All Templates:', result);
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testFetchActiveTemplates = async () => {
    addResult('Testing: Fetch templates...', 'info');
    try {
      const result = await fetchTemplates({
        fields: ['id', 'name', 'sections { id title }'],
      });
      addResult(`Success: Fetched ${result.length} templates`, 'success');
      console.log('Templates:', result);
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testFetchDefaultTemplate = async () => {
    addResult('Testing: Fetch templates...', 'info');
    try {
      const result = await fetchTemplates({
        fields: ['id', 'name', 'sections'],
      });
      if (result.length > 0) {
        addResult(`Success: Found template "${result[0].name}"`, 'success');
        console.log('Template:', result[0]);
      } else {
        addResult('No templates found', 'info');
      }
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testGetTemplateById = async () => {
    addResult('Testing: Get template by ID (fetching first template)...', 'info');
    try {
      // First fetch all templates to get an ID
      const allTemplates = await fetchTemplates();
      if (allTemplates.length === 0) {
        addResult('No templates available to test', 'info');
        return;
      }

      const templateId = allTemplates[0].id;
      const template = await getById(templateId, ['id', 'name', 'sections { id title order attributes { id name type required } }']);
      
      if (template) {
        addResult(`Success: Fetched template "${template.name}" by ID`, 'success');
        console.log('Template by ID:', template);
      } else {
        addResult('Template not found', 'error');
      }
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testCreateTemplate = async () => {
    addResult('Testing: Create new view template...', 'info');
    const newTemplate: CreateViewTemplateInput = {
      name: `Test Template ${Date.now()}`,
      sections: [
        {
          title: 'Basic Information',
          order: 0,
          attributes: [
            {
              name: 'Product Name',
              type: 'Text',
              required: true,
              order: 0,
            },
            {
              name: 'SKU',
              type: 'Text',
              required: true,
              order: 1,
            },
            {
              name: 'Brand',
              type: 'Dropdown',
              required: true,
              order: 2,
              options: ['Brand A', 'Brand B', 'Brand C'],
            },
          ],
        },
        {
          title: 'Pricing & Inventory',
          order: 1,
          attributes: [
            {
              name: 'Cost Price',
              type: 'Number',
              required: true,
              order: 0,
            },
            {
              name: 'Selling Price',
              type: 'Number',
              required: true,
              order: 1,
            },
            {
              name: 'Stock Quantity',
              type: 'Number',
              required: true,
              order: 2,
            },
          ],
        },
      ],
    };

    try {
      const result = await create(newTemplate, ['id', 'name']);
      addResult(`Success: Created template "${result.name}" (ID: ${result.id})`, 'success');
      console.log('Created template:', result);
      return result;
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testUpdateTemplate = async () => {
    addResult('Testing: Update template (creating one first)...', 'info');
    try {
      // Create a template first
      const newTemplate = await testCreateTemplate();
      if (!newTemplate) return;

      // Update it
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updated = await update({
        template_id: newTemplate.id,
        update_data: {
          name: `Updated ${newTemplate.name}`,
        },
      });
      addResult(`Success: Updated template "${updated.name}"`, 'success');
      console.log('Updated template:', updated);
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testDeleteTemplate = async () => {
    addResult('Testing: Delete template (creating one first)...', 'info');
    try {
      // Create a template first
      const newTemplate = await testCreateTemplate();
      if (!newTemplate) return;

      // Delete it
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await deleteTemplate(newTemplate.id);
      addResult(`Success: ${result.message}`, 'success');
      console.log('Delete result:', result);
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  // ============================================================================
  // DIRECT SERVICE TESTS
  // ============================================================================

  const testServiceGetAll = async () => {
    addResult('Testing: Service - Get all templates...', 'info');
    try {
      const result = await viewTemplateService.getAll({
        orgId,
        fields: ['id', 'name'],
      });
      addResult(`Success: Service returned ${result.length} templates`, 'success');
      console.log('Service templates:', result);
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testServiceGetById = async () => {
    addResult('Testing: Service - Get template by ID...', 'info');
    try {
      const allTemplates = await viewTemplateService.getAll({
        orgId,
        fields: ['id'],
      });
      
      if (allTemplates.length === 0) {
        addResult('No templates available to test', 'info');
        return;
      }

      const template = await viewTemplateService.getById(
        allTemplates[0].id,
        orgId,
        ['id', 'name', 'sections { id title order attributes { id name type required } }']
      );
      
      if (template) {
        addResult(`Success: Service returned template "${template.name}"`, 'success');
        console.log('Service template by ID:', template);
      }
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testServiceCreateTemplate = async () => {
    addResult('Testing: Service - Create template...', 'info');
    try {
      const newTemplate: CreateViewTemplateInput = {
        name: `Service Test Template ${Date.now()}`,
        sections: [
          {
            title: 'Basic Information',
            order: 0,
            attributes: [
              {
                name: 'Product Name',
                type: 'Text',
                required: true,
                order: 0,
              },
            ],
          },
        ],
      };

      const result = await viewTemplateService.create(
        newTemplate,
        ['id', 'name']
      );
      addResult(`Success: Service created template "${result.name}"`, 'success');
      console.log('Service created:', result);
    } catch (err: any) {
      addResult(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  };

  const testAllHooks = async () => {
    addResult('========== Running All Hook Tests ==========', 'info');
    await testFetchAllTemplates();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testFetchActiveTemplates();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testFetchDefaultTemplate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testGetTemplateById();
    addResult('========== All Hook Tests Complete ==========', 'info');
  };

  const testAllServices = async () => {
    addResult('========== Running All Service Tests ==========', 'info');
    await testServiceGetAll();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testServiceGetById();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testServiceCreateTemplate();
    addResult('========== All Service Tests Complete ==========', 'info');
  };

  const testFullCRUD = async () => {
    addResult('========== Running Full CRUD Test ==========', 'info');
    await testCreateTemplate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testUpdateTemplate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testDeleteTemplate();
    addResult('========== CRUD Test Complete ==========', 'info');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🧪 View Template API Test Suite</h1>
          <p className="text-gray-600">Test View Template API endpoints and functionality</p>
          
          {/* Config Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Configuration:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>GraphQL URL:</strong> {ENV.GRAPHQL_URL}</p>
              <p><strong>Org ID:</strong> {ENV.ORG_ID}</p>
              <p><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('hooks')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'hooks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              React Hooks Tests
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'services'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Service Tests
            </button>
          </div>

          {/* Test Buttons */}
          <div className="p-6">
            {activeTab === 'hooks' ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">React Hooks Tests</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={testFetchAllTemplates}
                    disabled={templatesLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {templatesLoading ? 'Loading...' : 'Fetch All Templates'}
                  </button>
                  <button
                    onClick={testFetchActiveTemplates}
                    disabled={templatesLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {templatesLoading ? 'Loading...' : 'Fetch Active Only'}
                  </button>
                  <button
                    onClick={testFetchDefaultTemplate}
                    disabled={templatesLoading}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                  >
                    {templatesLoading ? 'Loading...' : 'Get Default Template'}
                  </button>
                  <button
                    onClick={testGetTemplateById}
                    disabled={templatesLoading || templateOpsLoading}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {templatesLoading || templateOpsLoading ? 'Loading...' : 'Get By ID'}
                  </button>
                  <button
                    onClick={testCreateTemplate}
                    disabled={templateOpsLoading}
                    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {templateOpsLoading ? 'Loading...' : 'Create Template'}
                  </button>
                  <button
                    onClick={testUpdateTemplate}
                    disabled={templateOpsLoading}
                    className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
                  >
                    {templateOpsLoading ? 'Loading...' : 'Create & Update'}
                  </button>
                  <button
                    onClick={testDeleteTemplate}
                    disabled={templateOpsLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {templateOpsLoading ? 'Loading...' : 'Create & Delete'}
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={testAllHooks}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium"
                  >
                    🚀 Run All Hook Tests
                  </button>
                  <button
                    onClick={testFullCRUD}
                    className="ml-3 px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 font-medium"
                  >
                    🔄 Test Full CRUD
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Direct Service Tests</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={testServiceGetAll}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Service: Get All
                  </button>
                  <button
                    onClick={testServiceGetById}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Service: Get By ID
                  </button>
                  <button
                    onClick={testServiceCreateTemplate}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Service: Create
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={testAllServices}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium"
                  >
                    🚀 Run All Service Tests
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results Log */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Test Results Log</h2>
              <button
                onClick={clearResults}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet. Click a button to start testing.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Data Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
            
            {/* Templates */}
            {templates.length > 0 ? (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  View Templates ({templates.length})
                </h3>
                <div className="bg-gray-50 rounded p-3 max-h-96 overflow-y-auto">
                  {templates.map(template => (
                    <div key={template.id} className="text-sm mb-3 pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{template.name}</p>
                      </div>
                      <p className="text-gray-600 text-xs">ID: {template.id}</p>
                      {template.sections && template.sections.length > 0 && (
                        <p className="text-gray-500 text-xs mt-1">
                          Sections: {template.sections.length}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
                No templates loaded yet. Click a test button to fetch data.
              </div>
            )}

            {/* Errors */}
            {templatesError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
                <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                <p className="text-sm text-red-700">{templatesError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Before Testing:</h3>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
            <li>Make sure auth token is set in localStorage: <code className="bg-yellow-100 px-2 py-1 rounded">localStorage.setItem('authToken', 'your-token')</code></li>
            <li>Verify the GraphQL endpoint is accessible: {ENV.GRAPHQL_URL}</li>
            <li>Check browser console for detailed logs and errors</li>
            <li>Results will appear in the "Test Results Log" section</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestPimApi;
