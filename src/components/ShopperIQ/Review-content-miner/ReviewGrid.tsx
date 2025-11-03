import React, { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import KendoGrid from "../../ChannelAmp/KendoGrid";

const sampleReviews = [
  {
    id: 1,
    brand: "Nike",
    retailer: "Amazon",
    productTitle: "Air Max Shoes",
    rating: "4",
    reviewDate: "2023-05-15",
    reviewTitle: "Great shoes",
    reviewText: "Very comfortable but a bit expensive.",
    author: "John Doe",
  },
  {
    id: 2,
    brand: "Adidas",
    retailer: "Walmart",
    productTitle: "Ultraboost",
    rating: "2",
    reviewDate: "2023-06-20",
    reviewTitle: "Not good",
    reviewText: "Not working after a week, cheap quality material.",
    author: "Jane Smith",
  },
  {
    id: 3,
    brand: "Nike",
    retailer: "Amazon",
    productTitle: "Soundbar 400",
    rating: "1",
    reviewDate: "2023-07-10",
    reviewTitle: "Poor quality",
    reviewText: "Breaks easily, very disappointing.",
    author: "Alex Brown",
  },
];

const filterReviews = (reviews, filters, selectedWord, treeData) => {
  let filteredData = [...reviews];

  if (filters?.retailer) {
    const retailers = filters.retailer.split(",").map((r) => r.trim().toLowerCase());
    filteredData = filteredData.filter((review) =>
      retailers.includes(review.retailer.toLowerCase())
    );
  }

  if (filters?.brand) {
    const brands = filters.brand.split(",").map((b) => b.trim().toLowerCase());
    filteredData = filteredData.filter((review) =>
      brands.includes(review.brand.toLowerCase())
    );
  }

  if (filters?.productTitle) {
    const products = filters.productTitle.split(",").map((p) => p.trim().toLowerCase());
    filteredData = filteredData.filter((review) =>
      products.includes(review.productTitle.toLowerCase())
    );
  }

  if (filters?.rating && (filters.rating.min || filters.rating.max)) {
    filteredData = filteredData.filter(
      (review) =>
        review.rating >= (filters.rating.min || 1) &&
        review.rating <= (filters.rating.max || 5)
    );
  }

  if (filters?.dateRange?.start && filters?.dateRange?.end) {
    filteredData = filteredData.filter(
      (review) =>
        review.reviewDate >= new Date(filters.dateRange.start) &&
        review.reviewDate <= new Date(filters.dateRange.end)
    );
  }

  if (selectedWord) {
    const wordsToFilter = [selectedWord.toLowerCase()];
    const collectSubWords = (node) => {
      if (node?.children) {
        node.children.forEach((child) => {
          if (child.word) {
            wordsToFilter.push(child.word.toLowerCase());
            collectSubWords(child);
          }
        });
      }
    };
    if (treeData) collectSubWords(treeData);
    filteredData = filteredData.filter((review) =>
      wordsToFilter.some(
        (word) =>
          review.reviewText.toLowerCase().includes(word) ||
          review.reviewTitle.toLowerCase().includes(word)
      )
    );
  }

  return filteredData;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode; onReset: () => void }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center h-screen text-rose-600">
          <div>
            <h2>Error: {this.state.error?.message || "An unexpected error occurred"}</h2>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ReviewGrid = ({ filters, selectedWord, treeData }) => {
  const [data, setData] = useState(sampleReviews);
  const [selectedRows, setSelectedRows] = useState([]);
  const [gridDataState, setGridDataState] = useState({
    filter: { logic: "and", filters: [] },
    sort: [],
    group: [],
    skip: 0,
    take: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([
    { field: "brand", title: "Brand", filter: "text", width: "120px" },
    { field: "retailer", title: "Retailer", filter: "text", width: "120px" },
    { field: "productTitle", title: "Product", filter: "text", width: "180px" },
    { field: "rating", title: "Rating", filter: "text", width: "120px" },
    { field: "author", title: "Author", filter: "text", width: "140px" },
    { field: "reviewDate", title: "Date", filter: "date", format: "{0:yyyy-MM-dd}", width: "120px" },
    { field: "reviewTitle", title: "Title", filter: "text", width: "200px" },
    { field: "reviewText", title: "Review Text", filter: "text", width: "300px" },
  ]);
  const [allColumnsState, setAllColumnsState] = useState({
    visible: columns,
    available: [],
  });
  const nonRemovableColumns = columns.map((col) => col.field);

  useEffect(() => {
    setLoading(true);
    try {
      const filteredData = filterReviews(sampleReviews, filters, selectedWord, treeData);
      const isFilterApplied =
        filters?.retailer ||
        filters?.brand ||
        filters?.productTitle ||
        (filters?.rating && (filters.rating.min > 1 || filters.rating.max < 5)) ||
        filters?.dateRange?.start ||
        selectedWord;

      setData(filteredData.length > 0 || !isFilterApplied ? filteredData : sampleReviews);
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred while processing data");
    } finally {
      setLoading(false);
    }
  }, [filters, selectedWord, treeData]);

  const handleRetry = () => {
    setError(null);
    setData(sampleReviews);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-rose-600">
        <div>
          <h2>Error: {error}</h2>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={handleRetry}>
      <div className="flex flex-col h-screen bg-orange-50">
        <div className="bg-white shadow-xl p-3 border min-h-2/3 border-gray-200">
          {data.length === 0 ? (
            <div className="bg-orange-100 rounded-lg p-8 text-center border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                <Star className="w-10 h-10 text-gray-500" />
              </div>
              <p className="text-gray-800 text-xl">No reviews found</p>
              <p className="text-gray-600 mt-2 max-w-md mx-auto text-sm">
                {gridDataState.filter.filters.length > 0 || selectedWord
                  ? "Try adjusting your search or filters"
                  : "No reviews available at the moment"}
              </p>
            </div>
          ) : (
            <KendoGrid
              data={data}
              columns={columns}
              setColumns={setColumns}
              allColumnsState={allColumnsState}
              setAllColumnsState={setAllColumnsState}
              gridDataState={gridDataState}
              setGridDataState={setGridDataState}
              nonRemovableColumns={nonRemovableColumns}
              showCheckboxColumn={false}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              onRowClick={() => {}}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ReviewGrid;