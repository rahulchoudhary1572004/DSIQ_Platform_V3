// components/DAM/DAMBreadcrumb.tsx - Apple Minimalist (Fixed for Folders)
import React, { FC, useState, useEffect } from "react";
import { Home, Upload as UploadIcon, Folder as FolderIcon, ChevronRight } from "lucide-react";
import { Product } from "../../types/dam.types";

type ActiveTab = "library" | "upload" | "folders";

interface DAMBreadcrumbProps {
  selectedProduct: Product | null;
  viewingFolderId?: string | null;
  activeTab: ActiveTab;
  onNavigateHome: () => void;
  onTabChange: (tab: ActiveTab) => void;
}

interface BreadcrumbItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active: boolean;
}

const DAMBreadcrumb: FC<DAMBreadcrumbProps> = ({
  selectedProduct,
  viewingFolderId,
  activeTab,
  onNavigateHome,
  onTabChange,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const isNavigated =
      selectedProduct !== null ||
      viewingFolderId !== null ||
      activeTab !== "library";
    setShouldShow(isNavigated);
  }, [selectedProduct, viewingFolderId, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!shouldShow) {
        setIsVisible(false);
        return;
      }

      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY === 0) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, shouldShow]);

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      {
        label: "Home",
        icon: Home,
        onClick: () => {
          onNavigateHome();
          onTabChange("library");
        },
        active:
          !selectedProduct && !viewingFolderId && activeTab === "library",
      },
    ];

    if (activeTab === "upload") {
      items.push({
        label: "Upload",
        icon: UploadIcon,
        onClick: () => onTabChange("upload"),
        active: true,
      });
    } else if (activeTab === "folders") {
      items.push({
        label: "Folders",
        icon: FolderIcon,
        onClick: () => onTabChange("folders"),
        active: !viewingFolderId,
      });

      if (viewingFolderId) {
        items.push({
          label: viewingFolderId,
          icon: FolderIcon,
          onClick: () => {},
          active: true,
        });
      }
    } else if (activeTab === "library") {
      if (viewingFolderId) {
        items.push({
          label: "Folders",
          icon: FolderIcon,
          onClick: () => onTabChange("folders"),
          active: false,
        });

        items.push({
          label: viewingFolderId,
          icon: FolderIcon,
          onClick: () => {},
          active: true,
        });
      } else if (selectedProduct) {
        items.push({
          label: selectedProduct.name,
          icon: FolderIcon,
          onClick: () => {},
          active: true,
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav
      className={`fixed top-20 left-0 right-0 px-8 transition-all duration-400 ease-out pointer-events-none z-40 ${
        isVisible && shouldShow
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3"
      }`}
    >
      {/* Ultra Minimalist Breadcrumb */}
      <div className="flex items-center gap-0.5 text-sm pointer-events-auto">
        {breadcrumbItems.map((item, index) => {
          const IconComponent = item.icon;
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <div key={index} className="flex items-center gap-0.5">
              <button
                onClick={item.onClick}
                disabled={isLast}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 font-medium text-sm ${
                  item.active
                    ? "text-gray-900 bg-gray-50/80 hover:bg-gray-100"
                    : isLast
                      ? "text-gray-600 cursor-default"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/60 cursor-pointer"
                }`}
              >
                <IconComponent className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline truncate max-w-xs">
                  {item.label}
                </span>
              </button>

              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default DAMBreadcrumb;
