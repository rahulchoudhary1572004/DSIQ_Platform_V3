import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { 
  BarChart, Briefcase, Layers, LineChart, PieChart, Keyboard, 
  ChevronDown, ChevronRight, Cog, MessageSquare, BookOpen, 
  ShoppingBag, TrendingUp, Calendar, Users, FileText, Zap, 
  Clipboard, Target, LayoutDashboard, Package, Image, Share2, 
  Globe, LayoutList, Link2
} from "lucide-react";

// Constants
const ICON_SIZE = 14;
const MENU_ITEMS = {
  "Digital Shelf IQ": [
    { icon: <BarChart size={ICON_SIZE} />, label: "Category Analysis" },
    { icon: <Briefcase size={ICON_SIZE} />, label: "Brand Analysis" },
    { icon: <Layers size={ICON_SIZE} />, label: "Item Level Analysis" },
    { icon: <LineChart size={ICON_SIZE} />, label: "Sponsored AD Tracker" },
    { icon: <PieChart size={ICON_SIZE} />, label: "Share of Voice" },
    {
      icon: <Keyboard size={ICON_SIZE} />,
      label: "Keyword",
      isDropdown: true,
      items: ["Keyword Tracker", "Keyword Planner"]
    },
  ],
  "Shopper IQ": [
    { icon: <MessageSquare size={ICON_SIZE} />, label: "Review & Content Miner" },
    { icon: <BookOpen size={ICON_SIZE} />, label: "Brand & Category Insights" },
    { icon: <ShoppingBag size={ICON_SIZE} />, label: "Ask our AI Chatbot" },
    { icon: <Users size={ICON_SIZE} />, label: "Panel Data" },
  ],
  "Promotion IQ": [
    { icon: <Calendar size={ICON_SIZE} />, label: "Promotion Tracker" },
    { icon: <TrendingUp size={ICON_SIZE} />, label: "Promotion Planner" },
    { icon: <FileText size={ICON_SIZE} />, label: "Activation Partner" },
  ],
  "ChannelAMP": [
    { icon: <BarChart size={ICON_SIZE} />, label: "Dashboard" },
    { icon: <Users size={ICON_SIZE} />, label: "Profiles" },
    { icon: <Target size={ICON_SIZE} />, label: "Campaigns" },
    {
      icon: <LayoutList size={ICON_SIZE} />,
      label: "Ad Groups",
      isDropdown: true,
      items: ["Ads", "Keywords", "Search Terms", "Targets"]
    },
    { icon: <Zap size={ICON_SIZE} />, label: "Automation Rules" },
    { icon: <Clipboard size={ICON_SIZE} />, label: "Reporting" },
    { icon: <Link2 size={ICON_SIZE} />, label: "Connections" },
  ],
  "PIM": [
    { icon: <LayoutDashboard size={ICON_SIZE} />, label: "Dashboard" },
    { icon: <Package size={ICON_SIZE} />, label: "Products" },
    { icon: <Image size={ICON_SIZE} />, label: "Digital Assets" },
    { icon: <Share2 size={ICON_SIZE} />, label: "Syndication" },
    { icon: <Globe size={ICON_SIZE} />, label: "Channels" },
  ],
};

const DEFAULT_ACTIVE_ITEMS = {
  "Digital Shelf IQ": "Category Analysis",
  "Shopper IQ": "Review & Content Miner",
  "Promotion IQ": "Promotion Tracker",
  "ChannelAMP": "Dashboard",
  "PIM": "Dashboard",
};

const BOTTOM_MENU_ITEMS = [
  { icon: <Cog size={ICON_SIZE + 2} />, label: "App Settings" }
];

// Helper functions
const toSlug = (str) => str.toLowerCase()
  .replace(/ & /g, "-")
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-]/g, "");

const MenuItem = ({ 
  item, 
  isOpen, 
  active, 
  onClick, 
  onToggle, 
  expanded, 
  onHover, 
  onLeave 
}) => {
  const hasActiveSubItem = item.isDropdown && item.items.some(sub => 
    active === `${item.label}-${sub}`
  );
  const isActive = active === item.label || hasActiveSubItem;

  return (
    <div className="flex flex-col items-center py-[3px] relative">
      {isActive && (
        <div className="absolute left-0 top-0 h-full w-[3px] bg-primary-orange rounded-r" />
      )}
      
      <div
        className={`p-[6px] rounded-md group cursor-pointer my-[3px] transition-all duration-200 ease-in-out
          ${isActive ? "bg-peach" : "hover:bg-peach"}
          ${!isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
        title={item.label}
      >
        <div className="transition-transform duration-200 ease-in-out group-hover:scale-110 text-primary-orange">
          {item.icon}
        </div>
      </div>
    </div>
  );
};

const ExpandedMenuItem = ({ 
  item, 
  active, 
  onClick, 
  onToggle, 
  expanded 
}) => {
  const hasActiveSubItem = item.isDropdown && item.items.some(sub => 
    active === `${item.label}-${sub}`
  );
  const isActive = active === item.label || hasActiveSubItem;

  return (
    <>
      <div
        className={`relative flex items-center justify-between px-3 py-[6px] cursor-pointer 
          text-[10.5px] font-medium text-gray-600 hover:bg-peach rounded mx-[6px] group
          ${isActive ? "bg-peach" : ""} transition-all duration-200 ease-in-out`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-full w-[3px] bg-primary-orange rounded-r" />
        )}
        
        <div
          className="flex items-center p-[6px] transition-all duration-300 ease-in-out"
          onClick={() => onClick(item.label)} // Navigate to item page
        >
          <span className="mr-[6px] transition-transform duration-200 ease-in-out group-hover:scale-110 text-primary-orange">
            {item.icon}
          </span>
          <span className="transition-transform duration-200 ease-in-out group-hover:translate-x-1">
            {item.label}
          </span>
        </div>
        
        {item.isDropdown && (
          <div
            className="transition-transform duration-200 ease-in-out text-gray-500 p-1"
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation when clicking chevron
              onToggle(item.label);
            }}
          >
            {expanded.includes(item.label) ? (
              <ChevronDown size={12} className="transition-transform duration-300 ease-in-out" />
            ) : (
              <ChevronRight size={12} className="transition-transform duration-300 ease-in-out" />
            )}
          </div>
        )}
      </div>
      
      {item.isDropdown && expanded.includes(item.label) && (
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          <div className="mt-[3px]">
            {item.items.map((subItem, subIndex) => (
              <div
                key={subItem}
                className="relative"
                style={{
                  transform: expanded.includes(item.label) ? "translateY(0)" : "translateY(-7.5px)",
                  opacity: expanded.includes(item.label) ? 1 : 0,
                  transition: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${subIndex * 0.05}s, 
                               opacity 0.3s ease ${subIndex * 0.05}s`,
                }}
              >
                {active === `${item.label}-${subItem}` && (
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-primary-orange rounded-r" />
                )}
                <div
                  className="pl-9 pr-3 py-[6px] text-gray-600 hover:bg-peach cursor-pointer 
                    flex items-center group transition-all duration-200 ease-in-out"
                  onClick={() => onClick(item.label, subItem)}
                >
                  <span className="transition-transform duration-200 ease-in-out group-hover:translate-x-1 text-[10px]">
                    {subItem}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const HoverMenu = ({ section, position, active, onItemClick, onLeave }) => {
  return (
    <div
      className="fixed bg-white text-dark-gray rounded-md shadow-lg z-50 py-[6px] min-w-[150px] border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left + 1}px`,
      }}
      onMouseLeave={onLeave}
    >
      <div className="px-3 py-[6px] text-primary-orange font-medium text-[10.5px] border-b border-gray-200">
        {section.label}
      </div>
      <div className="mt-[3px]">
        {section.items.map((item, index) => (
          <div
        key={item}
        className={`px-3 py-[6px] hover:bg-peach cursor-pointer flex items-center relative group
          ${active === `${section.label}-${item}` ? "bg-peach" : ""}`}
        onClick={() => onItemClick(section.label, item)}
      >
        {active === `${section.label}-${item}` && (
          <div className="absolute left-0 top-0 h-full w-[3px] bg-primary-orange rounded-r" />
        )}
        <span className="transition-transform duration-200 ease-in-out group-hover:translate-x-1 text-[12px]">
          {item}
        </span>
      </div>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, selectedApp, toggleSidebar }) => {
  const [expanded, setExpanded] = useState([]);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const sidebarRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const menuItemsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = useMemo(() => 
    selectedApp ? MENU_ITEMS[selectedApp.name] || [] : []
  , [selectedApp]);

  const getActiveItemFromPath = useCallback(() => {
    const path = location.pathname.toLowerCase();
    const appSlug = toSlug(selectedApp?.name || "");

    // Map paths to menu items
    const pathToItemMap = {
      "digital-shelf-iq": {
        "/category-analysis": "Category Analysis",
        "/brand-analysis": "Brand Analysis",
        "/item-level-analysis": "Item Level Analysis",
        "/sponsored-ad-tracker": "Sponsored AD Tracker",
        "/share-of-voice": "Share of Voice",
        "/keyword-tracker": "Keyword-Keyword Tracker",
        "/keyword-planner": "Keyword-Keyword Planner",
      },
      "shopper-iq": {
        "/review-content-miner": "Review & Content Miner",
        "/brand-category-insights": "Brand & Category Insights",
        "/ask-ai-chatbot": "Ask our AI Chatbot",
        "/panel-data": "Panel Data",
      },
      "promotion-iq": {
        "/promotion-tracker": "Promotion Tracker",
        "/promotion-planner": "Promotion Planner",
        "/activation-partner": "Activation Partner",
      },
      "channelamp": {
        "/dashboard": "Dashboard",
        "/profiles": "Profiles",
        "/campaigns": "Campaigns",
        "/ad-groups": "Ad Groups",
        "/ads": "Ad Groups-Ads",
        "/keywords": "Ad Groups-Keywords",
        "/search-terms": "Ad Groups-Search Terms",
        "/targets": "Ad Groups-Targets",
        "/automation-rules": "Automation Rules",
        "/reporting": "Reporting",
        "/connections": "Connections",
      },
      "pim": {
        "/dashboard": "Dashboard",
        "/products": "Products",
        "/digital-assets": "Digital Assets",
        "/syndication": "Syndication",
        "/channels": "Channels",
      },
    };

    // Check for App Settings
    if (path.includes("/app-settings")) {
      return "App Settings";
    }

    // Get the relevant mapping for the current app
    const appPathMap = pathToItemMap[appSlug] || {};

    // Find the matching path
    const matchedPath = Object.keys(appPathMap).find((key) =>
      path.includes(`/${appSlug}${key}`)
    );

    // Return the corresponding menu item or subitem, or fall back to default
    return matchedPath ? appPathMap[matchedPath] : DEFAULT_ACTIVE_ITEMS[selectedApp?.name] || null;
  }, [location.pathname, selectedApp]);

  // Update activeItem based on URL changes
  useEffect(() => {
    const newActiveItem = getActiveItemFromPath();
    setActiveItem(newActiveItem);

    // Auto-expand dropdowns if a subitem is active
    if (newActiveItem && newActiveItem.includes("-")) {
      const [parentItem] = newActiveItem.split("-");
      setExpanded((prev) => prev.includes(parentItem) ? prev : [...prev, parentItem]);
    }
  }, [location.pathname, getActiveItemFromPath]);

  const handleSectionHover = useCallback((section, event) => {
    if (isOpen || !section.isDropdown) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({
      top: rect.top,
      left: rect.left + rect.width,
    });
    
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSection(section);
    }, 150);
  }, [isOpen]);

  const handleSectionLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSection(null);
    }, 100);
  }, []);

  const toggleSection = useCallback((section) => {
    setExpanded(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  }, []);

  const handleItemClick = useCallback((item, subItem = null) => {
    // Ensure item is a string (handle both string and object inputs)
    const itemLabel = typeof item === 'string' ? item : item?.label || '';
    const subItemLabel = typeof subItem === 'string' ? subItem : subItem?.label || null;
    
    let route;
    if (itemLabel === "App Settings") {
      route = "/app-settings";
    } else {
      const appSlug = toSlug(selectedApp.name);
      route = `/${appSlug}`;
      const itemSlug = toSlug(subItemLabel || itemLabel);
      route += `/${itemSlug}`;
      setActiveItem(subItemLabel ? `${itemLabel}-${subItemLabel}` : itemLabel);
    }
    navigate(route);
  }, [selectedApp, navigate]);

  const handleIconClick = useCallback((item, event) => {
    event.stopPropagation();
    if (!isOpen && toggleSidebar) toggleSidebar();
    handleItemClick(item.label); // Always navigate, even for dropdown items
  }, [isOpen, toggleSidebar, handleItemClick]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setHoveredSection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuItemsRef.current.length > 0) {
      gsap.fromTo(
        menuItemsRef.current,
        { opacity: 0, x: isOpen ? -15 : 0, y: !isOpen ? -15 : 0 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          stagger: 0.05,
          duration: 0.5,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }
  }, [isOpen, mainMenuItems]);

  return (
    <div className="flex">
      <aside
        ref={sidebarRef}
        className={`${isOpen ? "w-48" : "w-12"} h-full flex flex-col flex-shrink-0 
          bg-white text-dark-gray overflow-hidden overflow-y-auto relative
          shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out`}
      >
        <Link to="/">
          <div className="p-3 h-12 border-b border-gray-200 hover:bg-peach flex items-center justify-center relative">
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out
              ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-[3.75px] pointer-events-none"}`}>
              {selectedApp && (
                <img
                  src={selectedApp.name == "PIM" ? ('/app_logos/PIM_dummy.png') : (`/app_logos/${selectedApp.name.replace(/\s+/g, "")}-full.png`)}
                  alt={`${selectedApp.name} Full Logo`}
                  className={`h-[${selectedApp.name === "Digital Shelf IQ" ? "99" : 
                    selectedApp.name === "Promotion IQ" ? "60" : 
                    selectedApp.name === "PIM" ? "54" : "54"}px] w-auto object-contain mt-[3px]`}
                />
              )}
            </div>
            <div className={`transition-all duration-300 ease-in-out
              ${!isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[3.75px] pointer-events-none"}`}>
              {selectedApp && (
                <img
                  src={selectedApp.logo}
                  alt={`${selectedApp.name} Icon`}
                  className="h-[30px] w-[30px] object-contain"
                />
              )}
            </div>
          </div>
        </Link>

        <div className="py-[3px] flex-grow">
          <div className="mb-[3px] py-[3px]">
            {mainMenuItems.map((item, index) => (
              <div key={item.label} ref={(el: any) => (menuItemsRef.current[index] = el)}>
                {isOpen ? (
                  <ExpandedMenuItem
                    item={item}
                    active={activeItem}
                    onClick={handleItemClick}
                    onToggle={toggleSection}
                    expanded={expanded}
                  />
                ) : (
                  <MenuItem
                    item={item}
                    isOpen={isOpen}
                    active={activeItem}
                    onClick={(e) => handleIconClick(item, e)}
                    onHover={(e) => handleSectionHover(item, e)}
                    onLeave={handleSectionLeave}
                    {...{onToggle: undefined, expanded: undefined} as any}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pb-3">
          {BOTTOM_MENU_ITEMS.map((item, index) => (
            <div key={item.label} ref={(el: any) => (menuItemsRef.current[mainMenuItems.length + index] = el)}>
              {isOpen ? (
                <ExpandedMenuItem
                  item={item}
                  active={activeItem}
                  onClick={handleItemClick}
                  {...{onToggle: undefined, expanded: undefined} as any}
                />
              ) : (
                <MenuItem
                  item={item}
                  isOpen={isOpen}
                  active={activeItem}
                  onClick={(e) => handleIconClick(item, e)}
                  onHover={(e) => handleSectionHover(item, e)}
                  onLeave={handleSectionLeave}
                  {...{onToggle: undefined, expanded: undefined} as any}
                />
              )}
            </div>
          ))}
        </div>
      </aside>

      {!isOpen && hoveredSection && hoveredSection.isDropdown && (
        <HoverMenu
          section={hoveredSection}
          position={hoverPosition}
          active={activeItem}
          onItemClick={handleItemClick}
          onLeave={handleSectionLeave}
        />
      )}
    </div>
  );
};

export default Sidebar;