"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Search,
  Plus,
  Edit,
  Package,
  Briefcase,
  ArrowRight,
  Archive,
  ChevronDown,
  Filter,
  Building2,
  Tag,
  Calendar,
  X,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWorkspaces,
  toggleWorkspaceArchive,
  selectActiveWorkspaces,
  selectArchivedWorkspaces,
  selectWorkspaceViewStatus,
  selectWorkspaceViewError,
  selectArchiveStatus,
  selectArchiveError,
  resetArchiveStatus,
} from "../../redux/slices/workspaceViewSlice";
import Pagination from "../../components/Pagination";

const Tooltip = ({ content, position = "top", children, delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const timeoutRef = useRef();

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    const positions = {
      top: [rect.top + scrollY - 35, rect.left + scrollX + rect.width / 2],
      bottom: [rect.bottom + scrollY + 8, rect.left + scrollX + rect.width / 2],
      left: [rect.top + scrollY + rect.height / 2, rect.left + scrollX - 8],
      right: [rect.top + scrollY + rect.height / 2, rect.right + scrollX + 8],
    };
    setTooltipPosition({
      top: positions[position][0],
      left: positions[position][1],
    });
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const transforms = {
    top: "translateX(-50%)",
    bottom: "translateX(-50%)",
    left: "translateX(-100%) translateY(-50%)",
    right: "translateY(-50%)",
  };

  const arrowStyles = {
    top: {
      top: "100%",
      left: "50%",
      transform: "translateX(-50%) translateY(-50%)",
    },
    bottom: {
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%) translateY(50%)",
    },
    left: {
      left: "100%",
      top: "50%",
      transform: "translateX(-50%) translateY(-50%)",
    },
    right: {
      right: "100%",
      top: "50%",
      transform: "translateX(50%) translateY(-50%)",
    },
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {mounted &&
        isVisible &&
        createPortal(
          <div
            className="fixed z-[10000] px-3 py-2 text-small font-medium text-white bg-dark-gray rounded-lg shadow-lg whitespace-nowrap pointer-events-none font-sans"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: transforms[position],
            }}
          >
            {content}
            <div
              className="absolute w-2 h-2 bg-dark-gray transform rotate-45"
              style={arrowStyles[position]}
            />
          </div>,
          document.body
        )}
    </>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isNaN(date)
    ? "N/A"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const LoadingState = () => (
  <div className="min-h-screen bg-light-gray flex items-center justify-center font-sans">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-peach border-t-primary-orange mx-auto mb-4"></div>
      <p className="text-body text-gray">Loading workspaces...</p>
    </div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="bg-danger-red/10 border border-danger-red rounded-xl p-4 mb-6 animate-fade-in">
    <div className="flex items-center">
      <div className="text-danger-red mr-3">
        <X className="h-5 w-5" />
      </div>
      <p className="text-danger-red font-medium">
        Error loading workspaces: {error}
      </p>
    </div>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray/30 hover:border-primary-orange/50 transition-colors animate-fade-in">
    <div className="text-center py-16">
      <div className="mx-auto h-20 w-20 bg-gradient-to-br from-peach to-cream rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Briefcase className="h-10 w-10 text-primary-orange" />
      </div>
      <h3 className="text-2xl font-bold text-dark-gray mb-3">
        No workspaces found
      </h3>
      <p className="text-body text-gray mb-8 max-w-md mx-auto">
        Get started by creating your first workspace and begin organizing your
        projects
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center px-6 py-3 bg-primary-orange text-white text-button rounded-lg hover:bg-accent-magenta focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 transition-colors shadow-lg hover:shadow-xl font-sans"
      >
        <Plus className="h-5 w-5 mr-2" />
        Create Your First Workspace
      </button>
    </div>
  </div>
);

const NoResultsState = ({ searchQuery, onClear }) => (
  <div className="bg-white rounded-xl shadow-lg animate-fade-in">
    <div className="text-center py-16">
      <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gray/20 to-gray/10 rounded-full flex items-center justify-center mb-6">
        <Search className="h-10 w-10 text-gray" />
      </div>
      <h3 className="text-2xl font-bold text-dark-gray mb-3">
        No workspaces found
      </h3>
      <p className="text-body text-gray mb-8 max-w-md mx-auto">
        {searchQuery
          ? "Try adjusting your search terms or filters to find what you're looking for"
          : "No workspaces match your current filters"}
      </p>
      {searchQuery && (
        <button
          onClick={onClear}
          className="inline-flex items-center px-4 py-2 bg-cream text-dark-gray text-button rounded-lg hover:bg-peach focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 transition-colors font-sans"
        >
          Clear Search
        </button>
      )}
    </div>
  </div>
);

const WorkspaceCard = ({
  workspace,
  onEdit,
  onArchiveToggle,
  onViewDetails,
  isArchived,
  isLoading,
}) => {
  const retailers =
    workspace.settings
      ?.map((s) => s?.retailer?.retailer_name)
      .filter(Boolean) || [];
  return (
    <div
      className={`bg-white rounded-xl shadow-md border-0 group hover-lift transition-all duration-300 ${
        isArchived
          ? "bg-gradient-to-br from-peach/30 to-cream/50 border-l-4 border-l-primary-orange/50"
          : "hover:bg-gradient-to-br hover:from-white hover:to-cream/20"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
              isArchived
                ? "bg-gradient-to-br from-peach to-cream"
                : "bg-gradient-to-br from-primary-orange/10 to-accent-magenta/10 group-hover:from-primary-orange/20 group-hover:to-accent-magenta/20"
            }`}
          >
            <Briefcase
              className={`h-6 w-6 transition-colors ${
                isArchived
                  ? "text-primary-orange"
                  : "text-primary-orange group-hover:text-accent-magenta"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3
                className={`text-lg font-bold text-dark-gray truncate transition-all ${
                  isArchived
                    ? "line-through opacity-70"
                    : "group-hover:text-primary-orange"
                }`}
              >
                {workspace.name || "Unnamed Workspace"}
              </h3>
              {isArchived && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-small font-medium bg-primary-orange/20 text-primary-orange border-primary-orange/30">
                  <Archive className="h-3 w-3 mr-1" />
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {retailers.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray group-hover:text-dark-gray transition-colors">
              <div className="p-1.5 rounded-lg bg-info-blue/10">
                <Building2 className="h-4 w-4 text-info-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold">Retailers:</span>
                <div className="truncate mt-1">
                  {retailers.slice(0, 2).map((retailer, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-info-blue/30 text-info-blue mr-1"
                    >
                      {retailer}
                    </span>
                  ))}
                  {retailers.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white border border-gray/30 text-gray">
                      +{retailers.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-gray group-hover:text-dark-gray transition-colors">
            <div className="p-1.5 rounded-lg bg-accent-magenta/10">
              <Calendar className="h-4 w-4 text-accent-magenta" />
            </div>
            <div>
              <span className="font-semibold">Modified:</span>
              <span className="ml-2">{formatDate(workspace.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-cream/50">
        <div className="flex items-center w-full">
          <div className="flex justify-center items-center gap-4 w-full">
            <Tooltip
              content={
                isArchived ? "Cannot edit archived workspace" : "Edit workspace"
              }
            >
              <button
                onClick={() => onEdit(workspace.id)}
                disabled={isArchived}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isArchived
                    ? "text-gray cursor-not-allowed opacity-50"
                    : "text-dark-gray hover:text-primary-orange hover:bg-primary-orange/10 hover:scale-105"
                }`}
              >
                <Edit className="h-4 w-4" />
              </button>
            </Tooltip>

            <Tooltip
              content={isArchived ? "Restore workspace" : "Archive workspace"}
            >
              <button
                onClick={() => onArchiveToggle(workspace.id, isArchived)}
                disabled={isLoading}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isArchived
                    ? "text-success-green hover:text-success-green/80 hover:bg-success-green/10"
                    : "text-dark-gray hover:text-primary-orange hover:bg-primary-orange/10"
                }`}
              >
                {isArchived ? (
                  <Package className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </button>
            </Tooltip>

            <Tooltip content="View details">
              <button
                onClick={() => onViewDetails(workspace.name, workspace.id)}
                className="p-2 rounded-xl text-info-blue hover:text-info-blue/80 hover:bg-info-blue/10 hover:scale-105 transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 9;
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [groupBy, setGroupBy] = useState("none");

  const activeWorkspaces = useSelector(selectActiveWorkspaces);
  const archivedWorkspaces = useSelector(selectArchivedWorkspaces);
  const status = useSelector(selectWorkspaceViewStatus);
  const error = useSelector(selectWorkspaceViewError);
  const archiveStatus = useSelector(selectArchiveStatus);
  const archiveError = useSelector(selectArchiveError);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const workspacesToDisplay = showArchived
    ? [...(activeWorkspaces || []), ...(archivedWorkspaces || [])]
    : activeWorkspaces || [];

  const searchFilteredWorkspaces = workspacesToDisplay.filter((workspace) => {
    if (!workspace || typeof workspace !== "object") return false;
    return (
      (workspace.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (workspace.settings || []).some(
        (setting) =>
          (setting?.retailer?.retailer_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (setting?.category?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    );
  });

  const sortedWorkspaces = [...searchFilteredWorkspaces].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "name":
        aValue = (a.name || "").toLowerCase();
        bValue = (b.name || "").toLowerCase();
        break;
      case "retailer":
        aValue = (a.settings?.[0]?.retailer?.retailer_name || "").toLowerCase();
        bValue = (b.settings?.[0]?.retailer?.retailer_name || "").toLowerCase();
        break;
      case "dateCreated":
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case "dateModified":
        aValue = new Date(a.updated_at || 0);
        bValue = new Date(b.updated_at || 0);
        break;
      default:
        return 0;
    }

    if (sortBy === "dateCreated" || sortBy === "dateModified") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
  });

  const groupedWorkspaces = (() => {
    if (groupBy === "category") {
      return sortedWorkspaces.reduce((groups, workspace) => {
        const categories = workspace.settings
          ?.map((setting) => setting?.category?.name)
          .filter(Boolean) || ["Uncategorized"];
        categories.forEach((category) => {
          if (!groups[category]) groups[category] = [];
          groups[category].push(workspace);
        });
        return groups;
      }, {});
    } else if (groupBy === "retailer") {
      return sortedWorkspaces.reduce((groups, workspace) => {
        const retailers = workspace.settings
          ?.map((setting) => setting?.retailer?.retailer_name)
          .filter(Boolean) || ["No Retailer"];
        retailers.forEach((retailer) => {
          if (!groups[retailer]) groups[retailer] = [];
          groups[retailer].push(workspace);
        });
        return groups;
      }, {});
    } else {
      return { "All Workspaces": sortedWorkspaces };
    }
  })();

  const filteredWorkspaces = sortedWorkspaces;

  useEffect(
    () => setCurrentPage(1),
    [searchQuery, showArchived, sortBy, sortOrder, groupBy]
  );

  const handleViewDetails = (name, id) =>
    navigate(`/viewWorkspace/${name || "unnamed"}?id=${id}`);
  const handleEdit = (id) =>
    navigate("/viewWorkspace/ModifyWorkspace/", { state: id });
  const handleCreateWorkspace = () => navigate("/workspaceCreate");

  const handleArchiveToggle = async (id, currentArchiveStatus) => {
    try {
      setIsLoading(true);
      await dispatch(
        toggleWorkspaceArchive({ id, is_archive: !currentArchiveStatus })
      ).unwrap();
      dispatch(resetArchiveStatus());
    } catch (error) {
      console.error("Failed to toggle archive status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  if (status === "loading" && !error) return <LoadingState />;

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      {/* Enhanced Header */}
      <div className="bg-brand-gradient border-b border-white/20 shadow-xl">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-8 gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-1">
                    Workspaces
                  </h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">
                      Manage and organize your workspace collections
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{activeWorkspaces?.length || 0} Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <span>{archivedWorkspaces?.length || 0} Archived</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateWorkspace}
              className="inline-flex items-center px-6 py-3 bg-white text-primary-orange hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-lg font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Workspace
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 sticky top-8">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary-orange/10 to-accent-magenta/10 rounded-xl">
                    <Filter className="h-5 w-5 text-primary-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-gray">
                    Filters & Sorting
                  </h3>
                </div>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <div className="space-y-3">
                  <label
                    htmlFor="sort-by"
                    className="text-sm font-semibold text-dark-gray"
                  >
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray/30 rounded-md px-3 py-2 pr-8 text-small focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange font-sans w-full"
                    >
                      <option value="name">Name</option>
                      <option value="retailer">Retailer</option>
                      <option value="dateCreated">Date Created</option>
                      <option value="dateModified">Date Modified</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="sort-order"
                    className="text-sm font-semibold text-dark-gray"
                  >
                    Order
                  </label>
                  <div className="relative">
                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="appearance-none bg-white border border-gray/30 rounded-md px-3 py-2 pr-8 text-small focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange font-sans w-full"
                    >
                      <option value="asc">A-Z</option>
                      <option value="desc">Z-A</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="group-by"
                    className="text-sm font-semibold text-dark-gray"
                  >
                    Group By
                  </label>
                  <div className="relative">
                    <select
                      id="group-by"
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                      className="appearance-none bg-white border border-gray/30 rounded-md px-3 py-2 pr-8 text-small focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange font-sans w-full"
                    >
                      <option value="none">None</option>
                      <option value="category">Category</option>
                      <option value="retailer">Retailer</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray pointer-events-none" />
                  </div>
                </div>

                <div className="h-px bg-gray/20 my-4"></div>

                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-dark-gray mb-3">
                    Archive Settings
                  </h4>
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`inline-flex items-center px-4 py-2 border rounded-lg text-button font-medium transition-all duration-200 w-full ${
                      showArchived
                        ? "bg-primary-orange hover:bg-primary-orange/90 text-white shadow-md"
                        : "bg-white text-dark-gray border-gray/30 hover:bg-cream hover:border-primary-orange"
                    } font-sans`}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {showArchived ? "Hide Archived" : "Show Archived"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="flex-1">
            {error && <ErrorMessage error={error} />}
            {archiveError && <ErrorMessage error={archiveError} />}

            {!error && (
              <>
                {/* Enhanced Search Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 mb-8">
                  <div className="p-6">
                    <div className="relative max-w-2xl">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
                      <input
                        type="text"
                        placeholder="Search workspaces, retailers, categories..."
                        className="block w-full pl-12 pr-12 h-12 text-base border border-gray/30 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange rounded-lg bg-white/50 backdrop-blur-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-danger-red/10 hover:text-danger-red"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Stats Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-dark-gray">
                      {filteredWorkspaces.length}{" "}
                      {filteredWorkspaces.length === 1
                        ? "Workspace"
                        : "Workspaces"}
                    </h2>
                    {showArchived && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-orange to-accent-magenta text-white border-0 shadow-md">
                        Including Archived
                      </span>
                    )}
                  </div>
                </div>

                {workspacesToDisplay.length === 0 && (
                  <EmptyState onCreate={handleCreateWorkspace} />
                )}

                {/* Enhanced Workspace Grid */}
                <div className="space-y-8">
                  {Object.entries(groupedWorkspaces).map(
                    ([groupName, groupWorkspaces]) => {
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginatedGroupWorkspaces = groupWorkspaces.slice(
                        startIndex,
                        startIndex + itemsPerPage
                      );

                      if (paginatedGroupWorkspaces.length === 0) return null;

                      return (
                        <div key={groupName} className="space-y-6">
                          {groupBy !== "none" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-gradient-to-br from-primary-orange/10 to-accent-magenta/10 rounded-xl">
                                  {groupBy === "category" ? (
                                    <Tag className="h-5 w-5 text-primary-orange" />
                                  ) : (
                                    <Building2 className="h-5 w-5 text-primary-orange" />
                                  )}
                                </div>
                                <h3 className="text-2xl font-bold text-dark-gray">
                                  {groupName}
                                </h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-small font-medium bg-gradient-to-r from-primary-orange/20 to-accent-magenta/20 text-primary-orange border-primary-orange/30">
                                  {groupWorkspaces.length}
                                </span>
                              </div>
                              <div className="h-0.5 bg-gradient-to-r from-primary-orange/20 to-accent-magenta/20"></div>
                            </div>
                          )}

                          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {paginatedGroupWorkspaces.map(
                              (workspace, index) => {
                                const isArchived = archivedWorkspaces.some(
                                  (w) => w.id === workspace.id
                                );
                                return (
                                  <div
                                    key={workspace.id}
                                    style={{
                                      animationDelay: `${index * 100}ms`,
                                    }}
                                  >
                                    <WorkspaceCard
                                      workspace={workspace}
                                      onEdit={handleEdit}
                                      onArchiveToggle={handleArchiveToggle}
                                      onViewDetails={handleViewDetails}
                                      isArchived={isArchived}
                                      isLoading={
                                        isLoading || archiveStatus === "loading"
                                      }
                                    />
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}

                  {filteredWorkspaces.length === 0 &&
                    workspacesToDisplay.length > 0 && (
                      <NoResultsState
                        searchQuery={searchQuery}
                        onClear={() => setSearchQuery("")}
                      />
                    )}
                </div>

                {/* Enhanced Pagination */}
                {Math.ceil(filteredWorkspaces.length / itemsPerPage) > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          filteredWorkspaces.length / itemsPerPage
                        )}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
