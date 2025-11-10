import React, { useState, useRef, useEffect } from "react";
import {
  TableOfContents,
  Bell,
  Settings,
  Plus,
  HelpCircle,
  ArrowRightFromLine,
  ChevronDown,
  Search,
  X,
  Pin as IconPin,
  PinOff,
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useSelector, useDispatch } from "react-redux";
import {
  selectActiveWorkspaces,
  selectArchivedWorkspaces,
  selectCurrentWorkspace,
  setCurrentWorkspace,
  fetchWorkspaces,
} from "../redux/slices/workspaceViewSlice";
import DigitalShelfLogo from "/app_logos/icon.png";
import ShopperLogo from "/app_logos/ShopperIQ_ICON.png";
import PromotionLogo from "/app_logos/PromotionIQ_ICON.png";
import ChannelAMPLogo from "/app_logos/ChannelAMP_ICON.png";
// import PIMLogo from "/app_logos/PIM_ICON.png";

import MainLogo from "/app_logos/DigitalShelfIQ-full.png";

const initialApps = [
  { id: 1, name: "Digital Shelf IQ", logo: DigitalShelfLogo, description: "Product visibility analytics" },
  { id: 2, name: "Shopper IQ", logo: ShopperLogo, description: "Consumer behavior insights" },
  { id: 3, name: "Promotion IQ", logo: PromotionLogo, description: "Promotional performance tracking" },
  { id: 4, name: "ChannelAMP", logo: ChannelAMPLogo, description: "Amplify your channel strategy" },
  { id: 5, name: "PIM", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN4D4wBE5-0_tRNZ4sZZT6p1Ic_SiEmNx14A&s" , description: "Product Information Management" },
];

const defaultApp = initialApps[0];
const defaultRoutes = {
  "Digital Shelf IQ": "digital-shelf-iq/category-analysis",
  "Shopper IQ": "shopper-iq/review-content-miner",
  "Promotion IQ": "promotion-iq/promotion-tracker",
  "ChannelAMP": "channelamp/dashboard",
  // "PIM": "pim/dashboard",
};

const toSlug = (str) => str.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const sendPinnedAppToBackend = async (app) => {
  try {
    console.log("Sending pinned app to backend:", app);
    return { success: true, data: app };
  } catch (error) {
    console.error("Error sending pinned app to backend:", error);
    return { success: false, error };
  }
};

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, isLoggedIn, selectedApp, setSelectedApp }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [pinnedApp, setPinnedApp] = useState(null);
  const [apps, setApps] = useState(initialApps);

  const activeWorkspaces = useSelector(selectActiveWorkspaces);
  const archivedWorkspaces = useSelector(selectArchivedWorkspaces);
  const currentWorkspace = useSelector(selectCurrentWorkspace);
  const allWorkspaces = [...activeWorkspaces, ...archivedWorkspaces];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const showMainNav = !isLoggedIn || ["/settings", "/help"].includes(location.pathname);

  const navRef = useRef(null);
  const workspaceDropdownRef = useRef(null);
  const appDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const sidebarToggleRef = useRef(null);
  const appButtonRef = useRef(null);
  const workspaceButtonRef = useRef(null);
  const createButtonRef = useRef(null);
  const navButtonsRef = useRef([]);

  const animate = (element, props, onComplete) => {
    gsap.to(element, { ...props, duration: 0.3, ease: "power2.out", onComplete });
  };

  useEffect(() => {
    animate(navRef.current, { y: 0, opacity: 1 }, null);
    dispatch(fetchWorkspaces() as any);
  }, [dispatch]);

  useEffect(() => {
    if (typeof setSelectedApp !== "function") return;
    const storedApp = localStorage.getItem("selectedApp");
    let app = defaultApp;
    if (storedApp) {
      try {
        const parsed = JSON.parse(storedApp);
        if (parsed?.id && parsed?.name) app = parsed;
      } catch (error) {
        console.error("Error parsing stored app:", error);
        localStorage.removeItem("selectedApp");
      }
    }
    setSelectedApp(app);
    setPinnedApp(app);
    setApps([app, ...initialApps.filter(a => a.id !== app.id)]);
  }, [setSelectedApp]);

  useEffect(() => {
    if (selectedApp) {
      localStorage.setItem("selectedApp", JSON.stringify(selectedApp));
      setApps([selectedApp, ...initialApps.filter(a => a.id !== selectedApp.id)]);
    }
  }, [selectedApp]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!workspaceDropdownRef.current?.contains(e.target)) setIsWorkspaceDropdownOpen(false);
      if (!appDropdownRef.current?.contains(e.target)) setIsAppDropdownOpen(false);
      if (!profileDropdownRef.current?.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredWorkspaces = allWorkspaces.filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase()));
  const selectWorkspace = (workspace) => {
    dispatch(setCurrentWorkspace(workspace));
    setIsWorkspaceDropdownOpen(false);
  };

  const selectApp = (app) => {
    setSelectedApp(app);
    setIsAppDropdownOpen(false);
    localStorage.setItem("selectedApp", JSON.stringify(app));
    navigate(`/${defaultRoutes[app.name] || toSlug(app.name)}`);
  };

  const togglePinApp = async (app, e) => {
    e.stopPropagation();
    const isPinned = pinnedApp?.id === app.id;
    const response = await sendPinnedAppToBackend(isPinned ? null : app);
    if (response.success) {
      setPinnedApp(isPinned ? null : app);
      setApps(isPinned ? initialApps : [app, ...initialApps.filter(a => a.id !== app.id)]);
      animate(e.target.closest("button"), { scale: isPinned ? 1 : 1.2, rotation: isPinned ? 0 : 15 }, null as any);
    }
  };

  const handleSidebarToggle = () => {
    animate(sidebarToggleRef.current, { scale: 0.95, yoyo: true, repeat: 1 }, null as any);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDropdownToggle = (setOpen: any, isOpen: any, ref: any) => {
    animate(ref.current, { scale: 0.95, yoyo: true, repeat: 1 }, null as any);
    setOpen(!isOpen);
    animate(ref.current.querySelector("[data-chevron]"), { rotation: isOpen ? 0 : 180 }, null as any);
  };

  const handleCreateButtonClick = (e: any) => {
    animate(e.currentTarget, { rotate: 180 }, null as any);
    navigate("/workspaceCreate");
  };

  const displayApp = selectedApp || pinnedApp || defaultApp;

  return (
    <nav ref={navRef} className={`flex h-12 items-center justify-between ${showMainNav ? "pr-3" : "px-[18px]"} bg-peach transition-colors z-5 relative`}>
      <div className="flex items-center space-x-[18px]">
        {isLoggedIn ? (
          !showMainNav ? (
            <>
              <button ref={sidebarToggleRef} onClick={handleSidebarToggle} className="p-[6px] rounded-md text-gray-600 hover:bg-primary-orane hover:text-white" aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}>
                {isSidebarOpen ? <TableOfContents size={15} /> : <ArrowRightFromLine size={15} />}
              </button>
              <div className="relative" ref={appDropdownRef}>
                <button ref={appButtonRef} onClick={() => handleDropdownToggle(setIsAppDropdownOpen, isAppDropdownOpen, appButtonRef)} className="px-3 py-[6px] bg-white rounded-md flex items-center min-w-[100px] text-dark-gray shadow-md hover:shadow-lg hover:bg-dark-gray hover:text-white text-[12px]" aria-expanded={isAppDropdownOpen}>
                  <div className="flex items-center space-x-[6px]">
                    <img src={displayApp.logo} alt={displayApp.name} className="h-[18px] object-contain" />
                    <span className="font-medium text-[12px]">{displayApp.name}</span>
                  </div>
                  <ChevronDown size={12} className="ml-[6px]" data-chevron />
                </button>
                {isAppDropdownOpen && (
                  <div className="absolute left-0 mt-[6px] w-[216px] bg-white rounded-md shadow-lg py-[6px] z-50 border border-gray-200">
                    <div className="px-[9px] py-[6px] border-b border-gray-200 bg-cream">
                      <h3 className="text-[10.5px] font-medium text-dark-gray">Applications</h3>
                    </div>
                    {apps.map((app) => (
                      <button key={app.id} onClick={() => selectApp(app)} className={`w-full text-left px-3 py-[9px] hover:bg-peach flex items-start space-x-[9px] ${selectedApp?.id === app.id ? "bg-peach" : ""}`}>
                        <img src={app.logo} alt={app.name} className="h-[18px] object-contain mt-[6px]" />
                        <div className="flex-1">
                          <div className="font-medium text-dark-gray text-[12px]">{app.name}</div>
                          <div className="text-[9px] text-gray-500">{app.description}</div>
                        </div>
                        <button onClick={(e) => togglePinApp(app, e)} className="p-[3px] text-gray-400 hover:text-primary-orange" title={pinnedApp?.id === app.id ? "Unpin app" : "Pin app"}>
                          {pinnedApp?.id === app.id ? <IconPin size={12} className="fill-primary-orange text-primary-orange" /> : <PinOff size={12} />}
                        </button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex items-center" ref={workspaceDropdownRef}>
                <button ref={workspaceButtonRef} onClick={() => handleDropdownToggle(setIsWorkspaceDropdownOpen, isWorkspaceDropdownOpen, workspaceButtonRef)} className="px-3 py-[6px] bg-gradient-to-r from-accent-magenta to-primary-orange border border-gray-300 rounded-md flex items-center min-w-[120px] text-white hover:border-primary-orange text-[12px]" aria-expanded={isWorkspaceDropdownOpen}>
                  <div className="flex items-center space-x-[6px]">
                    <span className="truncate max-w-24 font-medium">{currentWorkspace?.name || "Select Workspace"}</span>
                    {currentWorkspace?.is_archive && <span className="text-[7.5px] bg-white/20 text-white px-[4.5px] py-[1.5px] rounded">ARCHIVED</span>}
                  </div>
                  <ChevronDown size={12} className="text-white ml-auto" data-chevron />
                </button>
                <div className="relative group">
                  <button ref={createButtonRef} className="ml-[6px] p-[6px] bg-primary-orange text-white rounded-md hover:bg-accent-magenta shadow-md" onClick={handleCreateButtonClick} aria-label="Create new workspace">
                    <Plus size={12} />
                  </button>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-[6px] py-[3px] bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">create new</div>
                </div>
                {isWorkspaceDropdownOpen && (
                  <div className="absolute left-0 top-9 w-[216px] bg-white rounded-md shadow-lg z-50 border-t border-gray-200 flex flex-col">
                    <div className="px-[9px] py-[6px] border-b border-gray-200 bg-cream">
                      <div className="relative">
                        <Search size={12} className="absolute left-[9px] top-[9px] text-gray-400" />
                        <input type="text" placeholder="Search workspaces..." value={workspaceSearch} onChange={(e) => setWorkspaceSearch(e.target.value)} className="pl-[30px] pr-[9px] py-[6px] w-full bg-white border border-gray-300 rounded-md text-[10.5px] focus:outline-none focus:ring-2 focus:ring-primary-orange text-dark-gray-600" />
                        {workspaceSearch && <button onClick={() => setWorkspaceSearch("")} className="absolute right-[9px] top-[9px] text-gray-400 hover:text-primary-orange"><X size={12} /></button>}
                      </div>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto">
                      {filteredWorkspaces.length ? (
                        <>
                          {activeWorkspaces.filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase())).length > 0 && (
                            <>
                              <div className="px-3 py-[6px] text-[9px] font-semibold text-gray-500 uppercase bg-gray-50">Active Workspaces</div>
                              {activeWorkspaces.filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase())).map(workspace => (
                                <button key={workspace.id} onClick={() => selectWorkspace(workspace)} className={`w-full text-left px-3 py-[9px] hover:bg-peach flex items-center justify-between ${currentWorkspace?.id === workspace.id ? "bg-peach font-medium" : ""}`}>
                                  <span className="text-dark-gray text-[12px]">{workspace.name}</span>
                                  <span className="text-[9px] bg-green-100 text-green-700 px-[6px] py-[3px] rounded">Active</span>
                                </button>
                              ))}
                            </>
                          )}
                          {archivedWorkspaces.filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase())).length > 0 && (
                            <>
                              {activeWorkspaces.filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase())).length > 0 && <div className="border-t border-gray-200 my-[3px]" />}
                              <div className="px-3 py-[6px] text-[9px] font-semibold text-gray-500 uppercase bg-gray-50">Archived Workspaces</div>
                              {archivedWorkspaces.filter(w => w.name.toLowerCase().includes(workspaceSearch.toLowerCase())).map(workspace => (
                                <button key={workspace.id} onClick={() => selectWorkspace(workspace)} className={`w-full text-left px-3 py-[9px] hover:bg-gray-100 flex items-center justify-between opacity-75 ${currentWorkspace?.id === workspace.id ? "bg-gray-100 font-medium" : ""}`}>
                                  <span className="text-gray-600 text-[12px]">{workspace.name}</span>
                                  <span className="text-[9px] bg-gray-200 text-gray-600 px-[6px] py-[3px] rounded">Archived</span>
                                </button>
                              ))}
                            </>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-[9px] text-gray-500 text-center text-[12px]">No workspaces found</div>
                      )}
                    </div>
                    <div className="mt-auto border-t border-gray-200 bg-cream">
                      <button onClick={() => { setIsWorkspaceDropdownOpen(false); navigate("/viewWorkspace"); }} className="w-full text-center py-[9px] text-primary-orange hover:text-accent-magenta font-medium text-[12px]">See all workspaces</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center w-48">
              <a href="/"><img src={MainLogo} alt="Digital Shelf IQ Logo" className="h-[99] w-auto object-contain" /></a>
            </div>
          )
        ) : (
          <div className="flex items-center"><a href="/"><img src={MainLogo} alt="Digital Shelf IQ Logo" className="h-9" /></a></div>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {!showMainNav && isLoggedIn && (
          <>
            <div className="relative group">
              <button ref={(el: any) => (navButtonsRef.current[0] = el)} className="p-[6px] rounded-md text-gray-600 hover:text-primary-orange hover:bg-peach" onClick={() => navigate("/help")} aria-label="Help"><HelpCircle size={15} /></button>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-[6px] py-[3px] bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">Help</div>
            </div>
            <div className="relative group">
              <button ref={(el: any) => (navButtonsRef.current[1] = el)} className="p-[6px] rounded-md text-gray-600 hover:text-primary-orange hover:bg-peach" onClick={() => navigate("/settings")} aria-label="Settings"><Settings size={15} /></button>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-[6px] py-[3px] bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">Settings</div>
            </div>
            <div className="relative group">
              <button ref={(el: any) => (navButtonsRef.current[2] = el)} className="p-[6px] rounded-md text-gray-600 hover:text-primary-orange hover:bg-peach relative" aria-label="Notifications">
                <Bell size={15} />
                <span className="absolute top-[3px] right-[3px] w-[7.5px] h-[7.5px] bg-accent-magenta rounded-full border-[1.5px] border-white" />
              </button>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-[6px] py-[3px] bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">Notifications</div>
            </div>
          </>
        )}
        {isLoggedIn ? (
          <div className="relative group" ref={profileDropdownRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-[27px] h-[27px] rounded-full overflow-hidden hover:ring-2 hover:ring-primary-orange flex items-center justify-center" aria-label="User menu" aria-expanded={isProfileOpen}>
              <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600" alt="User profile" className="w-full h-full object-cover" />
            </button>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-[6px] py-[3px] bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">Profile</div>
            {isProfileOpen && (
              <div className="absolute right-0 mt-[6px] w-[171px] bg-white rounded-md shadow-lg py-[3px] z-50 border border-gray-200">
                <ProfileDropdown onClose={() => setIsProfileOpen(false)} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-[9px]">
            <button onClick={() => navigate("/login")} className="px-3 py-[6px] bg-white border border-primary-orange text-primary-orange rounded-md hover:bg-primary-orange hover:text-white font-medium text-[12px]" aria-label="Login">Login</button>
            <button onClick={() => navigate("/signup")} className="px-3 py-[6px] bg-gradient-to-r from-primary-orange to-accent-magenta text-white rounded-md hover:shadow-md font-medium text-[12px]" aria-label="Sign Up">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;