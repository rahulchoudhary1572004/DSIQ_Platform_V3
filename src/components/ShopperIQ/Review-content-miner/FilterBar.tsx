import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWorkspaceProducts } from '../../../redux/slices/workspaceViewSlice';

const FilterBar = ({ filters, setFilters }: any) => {
  const dispatch = useDispatch();
  const { currentWorkspace, products, productsStatus, productsError } = useSelector((state: any) => state.workspaceView);

  const [pendingFilters, setPendingFilters] = useState({
    retailer: filters.retailer ? filters.retailer.split(',').filter(Boolean) : [],
    brand: filters.brand ? filters.brand.split(',').filter(Boolean) : [],
    product: filters.product ? filters.product.split(',').filter(Boolean) : [],
    category: filters.category ? filters.category.split(',').filter(Boolean) : [],
    isPromotion: filters.isPromotion || false,
    rating: filters.rating || { min: 1, max: 5 },
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    retailer: false,
    brand: false,
    product: false,
    category: false,
  });

  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  const refs = {
    retailer: useRef(null),
    brand: useRef(null),
    product: useRef(null),
    category: useRef(null),
  };

  // Memoized derived data
  const { retailers, brands, categories, productsList } = useMemo(() => ({
    retailers: [...new Set(currentWorkspace?.settings?.map((setting: any) => setting.retailer?.retailer_name).filter(Boolean))],
    brands: [...new Set(currentWorkspace?.settings?.map((setting: any) => setting.brand?.name).filter(Boolean))],
    categories: [...new Set(currentWorkspace?.settings?.map((setting: any) => setting.category?.name).filter(Boolean))],
    productsList: products || [],
  }), [currentWorkspace, products]);

  // Fetch products
  useEffect(() => {
    if (currentWorkspace?.id && productsStatus === 'idle') {
      dispatch(fetchWorkspaceProducts(currentWorkspace.id) as any);
    }
  }, [currentWorkspace?.id, productsStatus, dispatch]);

  // Sync pendingFilters with props
  useEffect(() => {
    setPendingFilters({
      retailer: filters.retailer ? filters.retailer.split(',').filter(Boolean) : [],
      brand: filters.brand ? filters.brand.split(',').filter(Boolean) : [],
      product: filters.product ? filters.product.split(',').filter(Boolean) : [],
      category: filters.category ? filters.category.split(',').filter(Boolean) : [],
      isPromotion: filters.isPromotion || false,
      rating: filters.rating || { min: 1, max: 5 },
    });
  }, [filters]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(refs).forEach(field => {
        if (refs[field].current && !refs[field].current.contains(event.target)) {
          setDropdownOpen(prev => ({ ...prev, [field]: false }));
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle slider dragging
  const handleMouseDown = useCallback((type) => (event) => {
    event.preventDefault();
    setIsDragging(type);

    const updatePosition = (clientX) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      let position = (clientX - rect.left) / rect.width;
      position = Math.max(0, Math.min(1, position)); // Clamp to slider bounds

      const rawValue = 1 + (position * 4); // Raw value between 1 and 5
      const roundedValue = Number(rawValue.toFixed(1)); // Round to 1 decimal place

      setPendingFilters(prev => {
        const newRating = { ...prev.rating };
        if (type === 'min') {
          newRating.min = Math.max(1, Math.min(roundedValue, newRating.max));
        } else if (type === 'max') {
          newRating.max = Math.min(5, Math.max(roundedValue, newRating.min));
        }
        return { ...prev, rating: newRating };
      });
    };

    const handleMove = (moveEvent) => updatePosition(moveEvent.clientX || moveEvent.touches?.[0]?.clientX);
    const handleEnd = () => {
      setIsDragging(null);
      // Snap to nearest integer on drag end for clean state
      setPendingFilters(prev => {
        const newRating = { ...prev.rating };
        newRating.min = Math.round(newRating.min);
        newRating.max = Math.round(newRating.max);
        return { ...prev, rating: newRating };
      });
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
  }, []);

  const handleMultiSelectChange = useCallback((field, value) => {
    setPendingFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value],
    }));
  }, []);

  const handlePromotionChange = useCallback((value) => {
    setPendingFilters(prev => ({ ...prev, isPromotion: value }));
  }, []);

  const handleRatingChange = useCallback((type, value) => {
    const numValue = parseInt(value);
    setPendingFilters(prev => {
      const newRating = { ...prev.rating };
      if (type === 'min' && numValue <= prev.rating.max) newRating.min = numValue;
      if (type === 'max' && numValue >= prev.rating.min) newRating.max = numValue;
      return { ...prev, rating: newRating };
    });
  }, []);

  const clearRating = useCallback(() => {
    setPendingFilters(prev => ({ ...prev, rating: { min: 1, max: 5 } }));
  }, []);

  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      retailer: '',
      brand: '',
      product: '',
      category: '',
      isPromotion: false,
      rating: { min: 1, max: 5 },
    };
    setPendingFilters({
      retailer: [], brand: [], product: [], category: [], isPromotion: false, rating: { min: 1, max: 5 },
    });
    setFilters(defaultFilters);
  }, [setFilters]);

  const applyFilters = useCallback(() => {
    const filtersToApply = {
      ...pendingFilters,
      retailer: pendingFilters.retailer.join(','),
      brand: pendingFilters.brand.join(','),
      product: pendingFilters.product.join(','),
      category: pendingFilters.category.join(','),
    };
    setFilters(filtersToApply);
  }, [pendingFilters, setFilters]);

  const hasActiveFilters = useMemo(() => (
    pendingFilters.retailer.length > 0 ||
    pendingFilters.brand.length > 0 ||
    pendingFilters.product.length > 0 ||
    pendingFilters.category.length > 0 ||
    pendingFilters.isPromotion ||
    (pendingFilters.rating.min > 1 || pendingFilters.rating.max < 5)
  ), [pendingFilters]);

  const fieldStyles = {
    retailer: { iconColor: 'text-indigo-600', tagBg: 'bg-indigo-50', tagText: 'text-indigo-800', tagHover: 'text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600' },
    brand: { iconColor: 'text-emerald-600', tagBg: 'bg-emerald-50', tagText: 'text-emerald-800', tagHover: 'text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600' },
    product: { iconColor: 'text-purple-600', tagBg: 'bg-purple-50', tagText: 'text-purple-800', tagHover: 'text-purple-500 hover:bg-purple-100 hover:text-purple-600' },
    category: { iconColor: 'text-amber-600', tagBg: 'bg-amber-50', tagText: 'text-amber-800', tagHover: 'text-amber-500 hover:bg-amber-100 hover:text-amber-600' },
  };

  const renderMultiSelect = (field, options, label, ref) => (
    <div className="w-full">
      <label className="text-[calc(0.75*0.875rem)] font-semibold text-gray-800 mb-[calc(0.75*0.5rem)] flex items-center gap-[calc(0.75*0.5rem)] md:text-[calc(0.75*1rem)] lg:text-[calc(0.75*1.125rem)]">
        <svg className={`w-[calc(0.75*1rem)] h-[calc(0.75*1rem)] ${fieldStyles[field].iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {field === 'retailer' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
          {field === 'brand' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />}
          {field === 'product' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
          {field === 'category' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}
        </svg>
        {label}
      </label>
      <div className="relative" ref={ref}>
        <button
          className="w-full h-[calc(0.75*2.5rem)] px-[calc(0.75*1rem)] pr-[calc(0.75*2.5rem)] rounded-xl border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[calc(0.75*0.125rem)] focus:ring-indigo-200 transition-all duration-200 bg-white text-gray-700 text-left appearance-none cursor-pointer hover:border-gray-400 text-[calc(0.75*0.875rem)] md:text-[calc(0.75*1rem)]"
          onClick={() => setDropdownOpen(prev => ({ ...prev, [field]: !prev[field] }))}
        >
          {pendingFilters[field].length > 0 ? `${pendingFilters[field].length} selected` : `All ${label}s`}
        </button>
        <div className="absolute inset-y-0 right-0 flex items-center px-[calc(0.75*0.75rem)] pointer-events-none">
          <svg className="w-[calc(0.75*1.25rem)] h-[calc(0.75*1.25rem)] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {dropdownOpen[field] && (
          <div className="absolute z-10 w-full mt-[calc(0.75*0.25rem)] bg-white border border-gray-300 rounded-lg shadow-lg max-h-[calc(0.75*15rem)] overflow-y-auto">
            {options.map(option => (
              <label key={option} className="flex items-center px-[calc(0.75*1rem)] py-[calc(0.75*0.5rem)] hover:bg-gray-100 cursor-pointer text-[calc(0.75*0.875rem)] md:text-[calc(0.75*1rem)]">
                <input
                  type="checkbox"
                  checked={pendingFilters[field].includes(option)}
                  onChange={() => handleMultiSelectChange(field, option)}
                  className="h-[calc(0.75*1rem)] w-[calc(0.75*1rem)] text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-[calc(0.75*0.5rem)]">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {pendingFilters[field].length > 0 && (
        <div className="mt-[calc(0.75*0.5rem)] flex flex-wrap items-center gap-[calc(0.75*0.5rem)]">
          {pendingFilters[field].map(item => (
            <span key={item} className={`inline-flex items-center px-[calc(0.75*0.625rem)] py-[calc(0.75*0.125rem)] rounded-full text-[calc(0.75*0.75rem)] font-medium ${fieldStyles[field].tagBg} ${fieldStyles[field].tagText} md:text-[calc(0.75*0.875rem)]`}>
              {item}
              <button
                onClick={() => handleMultiSelectChange(field, item)}
                className={`flex-shrink-0 ml-[calc(0.75*0.25rem)] h-[calc(0.75*1rem)] w-[calc(0.75*1rem)] rounded-full inline-flex items-center justify-center ${fieldStyles[field].tagHover} focus:outline-none`}
              >
                <svg className="h-[calc(0.5*0.5cm)] w-[calc(0.5*0.5cm)]" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-[calc(0.75*0.75rem)]  w-full">
      <div className="text-[calc(0.75*1rem)] font-semibold text-gray-900 mb-[calc(0.75*0.5rem)] md:text-[calc(0.75*1.125rem)] lg:text-[calc(0.75*1.25rem)]">
        Current Workspace: {currentWorkspace?.name || 'No Workspace Selected'}
      </div>
      {productsStatus === 'loading' && (
        <div className="text-[calc(0.75*0.875rem)] text-gray-600">Loading products...</div>
      )}
      {productsStatus === 'failed' && (
        <div className="text-[calc(0.75*0.875rem)] text-rose-600">Error: {productsError}</div>
      )}
      {renderMultiSelect('retailer', retailers, 'Retailer', refs.retailer)}
      {renderMultiSelect('brand', brands, 'Brand', refs.brand)}
      {renderMultiSelect('category', categories, 'Category', refs.category)}
      {renderMultiSelect('product', productsList, 'Product', refs.product)}
      <div className="w-full">
        <label className="text-[calc(0.75*0.875rem)] font-semibold text-gray-900 mb-[calc(0.75*0.5rem)] flex items-center gap-[calc(0.75*0.5rem)] md:text-[calc(0.75*1rem)] lg:text-[calc(0.75*1.125rem)]">
          <svg className="w-[calc(0.75*1rem)] h-[calc(0.75*1rem)] text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10m-10 4h10m-10 4h10M3 3h18v18H3V3z" />
          </svg>
          Promotion
        </label>
        <div className="relative">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pendingFilters.isPromotion}
              onChange={(e) => handlePromotionChange(e.target.checked)}
              className="h-[calc(0.75*1rem)] w-[calc(0.75*1rem)] text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-[calc(0.75*0.875rem)] text-gray-600 md:text-[calc(0.75*1rem)]">
              Show only promotional products
            </span>
          </label>
        </div>
      </div>
      {/* Rating Range Slider */}
      <div className="w-full">
        <label className="text-[calc(0.75*0.875rem)] font-semibold text-gray-900 mb-[calc(0.75*0.5rem)] flex items-center gap-[calc(0.75*0.5rem)] md:text-[calc(0.75*1rem)] lg:text-[calc(0.75*1.125rem)]">
          <svg className="w-[calc(0.75*1rem)] h-[calc(0.75*1rem)] text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.1 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Rating: {pendingFilters.rating.min === 1 && pendingFilters.rating.max === 5 ? 'Any' : `${pendingFilters.rating.min} - ${pendingFilters.rating.max} stars`}
        </label>
        <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
          <div ref={sliderRef} className="relative mb-2 select-none">
            <div className="h-1 bg-gray-200 rounded-full relative">
              <div
                className="absolute h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{
                  left: `${((pendingFilters.rating.min - 1) / 4) * 100}%`,
                  width: `${((pendingFilters.rating.max - pendingFilters.rating.min) / 4) * 100}%`,
                }}
              />
              <div
                className="absolute w-4 h-4 bg-white border-2 border-indigo-500 rounded-full transform -translate-x-1/2 -top-1.5 cursor-pointer hover:bg-indigo-50 transition-colors"
                style={{ left: `${((pendingFilters.rating.min - 1) / 4) * 100}%` }}
                onMouseDown={handleMouseDown('min')}
                onTouchStart={handleMouseDown('min')}
              />
              <div
                className="absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-full transform -translate-x-1/2 -top-1.5 cursor-pointer hover:bg-purple-50 transition-colors"
                style={{ left: `${((pendingFilters.rating.max - 1) / 4) * 100}%` }}
                onMouseDown={handleMouseDown('max')}
                onTouchStart={handleMouseDown('max')}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              {[1, 5].map(num => (
                <span key={num} className="w-6 text-center">{num}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Min:</label>
              <select
                value={pendingFilters.rating.min}
                onChange={(e) => handleRatingChange('min', e.target.value)}
                className="border border-gray-200 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num} disabled={num > pendingFilters.rating.max}>{num}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Max:</label>
              <select
                value={pendingFilters.rating.max}
                onChange={(e) => handleRatingChange('max', e.target.value)}
                className="border border-gray-200 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num} disabled={num < pendingFilters.rating.min}>{num}</option>
                ))}
              </select>
            </div>
            <button
              onClick={clearRating}
              className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <div className="pt-[calc(0.75*0.5rem)]">
        {hasActiveFilters && (
          <button
            className="w-full h-[calc(0.75*2.5rem)] bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-[calc(0.75*0.5rem)] text-[calc(0.75*0.875rem)] md:text-[calc(0.75*1rem)] mb-[calc(0.75*0.5rem)]"
            onClick={clearAllFilters}
          >
            <svg className="w-[calc(0.75*1.25rem)] h-[calc(0.75*1.25rem)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        )}
        <button
          className="w-full h-[calc(0.75*2.5rem)] bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-[calc(0.75*0.5rem)] text-[calc(0.75*0.875rem)] md:text-[calc(0.75*1rem)]"
          onClick={applyFilters}
        >
          <svg className="w-[calc(0.75*1.25rem)] h-[calc(0.75*1.25rem)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;