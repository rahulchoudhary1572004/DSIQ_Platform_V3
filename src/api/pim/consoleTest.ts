/**
 * Simple Console Test Script for PIM API
 * 
 * Run this in the browser console to quickly test API endpoints
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire file
 * 3. Run: await testPimAPI()
 */

// Import the services (adjust path as needed)
import { productService, viewTemplateService, ENV } from './index';

/**
 * Quick console test function
 */
async function testPimAPI() {
  console.log('🧪 Starting PIM API Tests...\n');
  console.log('📍 GraphQL URL:', ENV.GRAPHQL_URL);
  console.log('🏢 Org ID:', ENV.ORG_ID);
  console.log('🔑 Auth Token:', localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing');
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 1: Fetch Products
  try {
    console.log('Test 1: Fetching products...');
    const products = await productService.getAll({
      fields: ['id', 'title', 'price', 'sku', 'status'],
    });
    console.log('✅ Success! Fetched', products.length, 'products');
    console.log('Sample product:', products[0]);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    console.log('\n');
  }

  // Test 2: Fetch Paginated Products
  try {
    console.log('Test 2: Fetching paginated products (page 1, limit 5)...');
    const result = await productService.getPaginated({
      page: 1,
      limit: 5,
      fields: ['id', 'title', 'price'],
    });
    console.log('✅ Success!');
    console.log('Products on page:', result.products.length);
    console.log('Total products:', result.pagination.totalItems);
    console.log('Total pages:', result.pagination.totalPages);
    console.log('Sample products:', result.products);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error fetching paginated products:', error.message);
    console.log('\n');
  }

  // Test 3: Search Products
  try {
    console.log('Test 3: Searching products with query "test"...');
    const result = await productService.search({
      search: 'test',
      page: 1,
      limit: 5,
    });
    console.log('✅ Success! Found', result.products.length, 'products');
    console.log('Results:', result.products);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error searching products:', error.message);
    console.log('\n');
  }

  // Test 4: Fetch View Templates
  try {
    console.log('Test 4: Fetching view templates...');
    const templates = await viewTemplateService.getAll({
      orgId: ENV.ORG_ID,
      fields: ['id', 'name'],
    });
    console.log('✅ Success! Fetched', templates.length, 'templates');
    console.log('Templates:', templates);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error fetching templates:', error.message);
    console.log('\n');
  }

  // Test 5: Create Product
  try {
    console.log('Test 5: Creating a test product...');
    const newProduct = await productService.create({
      title: `Test Product ${Date.now()}`,
      description: 'Created via console test',
      sku: `TEST-${Date.now()}`,
      price: 99.99,
      status: 'draft',
    });
    console.log('✅ Success! Created product:', newProduct);
    console.log('\n');

    // Test 6: Update the product we just created
    console.log('Test 6: Updating the product we just created...');
    const updated = await productService.update(newProduct.id, {
      price: 149.99,
      status: 'active',
    });
    console.log('✅ Success! Updated product:', updated);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error in create/update test:', error.message);
    console.log('\n');
  }

  console.log('='.repeat(60));
  console.log('🎉 All tests complete!');
  console.log('\nTip: Check the Network tab to see the actual GraphQL requests');
}

// Export for use
export { testPimAPI };

// Instructions
console.log(`
🧪 PIM API Console Tester Loaded!

To run tests, execute:
  await testPimAPI()

Or test individual services:
  
  // Fetch products
  const products = await productService.getAll({ 
    fields: ['id', 'title', 'price'] 
  });
  
  // Create product
  const product = await productService.create({
    title: 'My Product',
    price: 99.99
  });
  
  // Get templates
  const templates = await viewTemplateService.getAll({
    filters: { orgId: '${ENV.ORG_ID}' }
  });

Available Services:
  - productService
  - viewTemplateService

Available Fields:
  Product: id, title, description, sku, price, status, category, brand, images, tags
  Template: id, name, description, isDefault, isActive, sections
`);
