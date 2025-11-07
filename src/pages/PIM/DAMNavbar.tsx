// // components/DAM/DAMNavbar.tsx
// import React, { FC } from "react";
// import { Home, ChevronRight } from "lucide-react";
// import { Product, Collection } from "../../types/dam.types";

// interface DAMNavbarProps {
//   selectedProduct: Product | null;
//   viewingCollectionId: number | null;
//   collections: Collection[];
// }

// const DAMNavbar: FC<DAMNavbarProps> = ({
//   selectedProduct,
//   viewingCollectionId,
//   collections,
// }) => {
//   const currentCollection = collections.find((c) => c.id === viewingCollectionId);
  
//   const getTitle = () => {
//     if (viewingCollectionId) return currentCollection?.name || "Collection";
//     if (selectedProduct) return selectedProduct.name;
//     return "All Assets";
//   };

//   return (
//     <nav className="relative bg-white border-b border-slate-200/40 shadow-sm">
//       <div className="px-6 py-3 flex items-center gap-2 h-14">
        
//         {/* BREADCRUMB */}
//         <Home className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
//         <span className="text-xs font-medium text-slate-500 flex-shrink-0">Digital Assets</span>
//         <ChevronRight className="h-2.5 w-2.5 text-slate-300 flex-shrink-0" />
//         <span className="text-sm font-medium text-slate-900 truncate">{getTitle()}</span>
        
//       </div>
//     </nav>
//   );
// };

// export default DAMNavbar;
