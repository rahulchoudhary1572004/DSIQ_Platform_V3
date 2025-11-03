import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';

const Breadcrumbs = () => {
  const location = useLocation();
  const breadcrumbsRef = useRef(null);
  const itemsRef = useRef([]);

  const pathSegments = location.pathname.split('/').filter(segment => segment);

  const pathNames = {
    'viewWorkspace': 'Workspaces',
    'workspaceCreate': 'Create Workspace',
    'ModifyWorkspace': 'Edit Workspace',
    'profile': 'Profile',
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (breadcrumbsRef.current) {
        gsap.fromTo(
          breadcrumbsRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 }
        );
      }

      const validItems = itemsRef.current.filter(item => item !== null);
      if (validItems.length > 0) {
        gsap.fromTo(
          validItems,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.4,
            ease: 'power2.out',
            delay: 0.3,
          }
        );
      }
    });

    return () => ctx.revert();
  }, [pathSegments]);

  return (
    <nav ref={breadcrumbsRef} className="inline-flex px-[15px] py-[9px] bg-peach md:px-[18px] md:py-[10px] lg:px-2 lg:py-1">
      <ol className="flex items-center space-x-[6px] md:space-x-[7px] lg:space-x-2">
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;

          if (segment.match(/^\d+$/) && index > 0 && pathSegments[index - 1] === 'ModifyWorkspace') {
            return (
              <li key={index} ref={el => itemsRef.current[index + 1] = el} className="flex items-center">
                <ChevronRight className="w-3 h-3 text-gray md:w-[14px] md:h-[14px] lg:w-4 lg:h-4" />
                <span className="ml-[6px] text-[10.5px] font-medium text-dark-gray md:ml-[7px] md:text-xs lg:ml-2 lg:text-sm">
                  {`Workspace ${segment}`}
                </span>
              </li>
            );
          }

          return (
            <li key={index} ref={el => itemsRef.current[index + 1] = el} className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray md:w-[14px] md:h-[14px] lg:w-4 lg:h-4" />
              {isLast ? (
                <span className="ml-[6px] text-[10px] font-medium text-dark-gray md:ml-[7px] md:text-xs lg:ml-2 lg:text-xsm">
                  {pathNames[segment] || segment}
                </span>
              ) : (
                <Link
                  to={path}
                  className="ml-[6px] text-[10px] font-medium text-primary-orange hover:text-accent-magenta transition-colors duration-200 md:ml-[7px] md:text-xs lg:ml-2 lg:text-xsm"
                >
                  {pathNames[segment] || segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;