// components/DAM/DAMBreadcrumb.tsx - APPLE DESIGN
import React, { FC, useState, useEffect } from "react";
import { ChevronRight, Home } from "lucide-react";
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
        onClick: () => {
          onNavigateHome();
          onTabChange("library");
        },
        active: !selectedProduct && !viewingFolderId && activeTab === "library",
      },
    ];

    if (activeTab === "upload") {
      items.push({
        label: "Upload",
        onClick: () => onTabChange("upload"),
        active: true,
      });
    } else if (activeTab === "folders") {
      items.push({
        label: "Folders",
        onClick: () => onTabChange("folders"),
        active: !viewingFolderId,
      });

      if (viewingFolderId) {
        items.push({
          label: viewingFolderId,
          onClick: () => {},
          active: true,
        });
      }
    } else if (activeTab === "library") {
      if (viewingFolderId) {
        items.push({
          label: "Folders",
          onClick: () => onTabChange("folders"),
          active: false,
        });

        items.push({
          label: viewingFolderId,
          onClick: () => {},
          active: true,
        });
      } else if (selectedProduct) {
        items.push({
          label: selectedProduct.name,
          onClick: () => {},
          active: true,
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (!shouldShow) return null;

  return (
    <nav
      className={`fixed top-20 right-8 flex transition-all duration-400 ease-out pointer-events-none ${
        isVisible && shouldShow
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3"
      }`}
    >
      {/* APPLE DESIGN */}
      <div className="inline-flex items-center gap-2 text-sm pointer-events-auto">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={item.onClick}
                disabled={isLast}
                className={`px-3 py-2 transition-colors duration-200 text-sm whitespace-nowrap ${
                  item.active
                    ? "text-gray-900 font-semibold"
                    : isLast
                      ? "text-gray-500 cursor-default"
                      : "text-gray-600 hover:text-gray-900 cursor-pointer"
                }`}
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                <span className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs">
                  {item.label}
                </span>
              </button>

              {!isLast && (
                <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default DAMBreadcrumb;
