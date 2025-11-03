// src/components/WorkspaceCreation.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardActions,
} from "@progress/kendo-react-layout";
import { useNavigate } from "react-router-dom";
import showToast from "../../utils/toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiShoppingCart,
  FiGrid,
  FiTag,
} from "react-icons/fi";
import clsx from "clsx";
import Retailer from "../components/WorkspaceCreation/Retailer";
import Category from "../components/WorkspaceCreation/Category";
import Brand from "../components/WorkspaceCreation/Brand";
import {
  checkWorkspaceName,
  fetchRetailers,
  createWorkspace,
} from "../../utils/workspaceApi";
import { getModuleIdByName } from "../../utils/getModuleIdByName";

export default function WorkspaceCreation() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceNameError, setWorkspaceNameError] = useState("");
  const [isNameAvailable, setIsNameAvailable] = useState(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [selectedRetailers, setSelectedRetailers] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedBrands, setSelectedBrands] = useState({});
  const [retailers, setRetailers] = useState([]);
  const [categoriesByRetailer, setCategoriesByRetailer] = useState({});
  const [loadingRetailers, setLoadingRetailers] = useState(false);
  const [retailersError, setRetailersError] = useState(null);

  const hasWorkspace = localStorage.getItem("hasWorkspace") === "true";

  // Memoized props
  const memoizedSelectedRetailers = useMemo(
    () => selectedRetailers,
    [selectedRetailers]
  );
  const memoizedSelectedCategories = useMemo(
    () => selectedCategories,
    [selectedCategories]
  );
  const memoizedRetailers = useMemo(() => retailers, [retailers]);
  const memoizedCategoriesByRetailer = useMemo(
    () => categoriesByRetailer,
    [categoriesByRetailer]
  );

  // Debounce function with cleanup
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    const debouncedFunction = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };

    debouncedFunction.cancel = () => {
      clearTimeout(timeoutId);
    };

    return debouncedFunction;
  }, []);

  const latestRequestRef = useRef(null);

  // Check workspace name availability
  const checkWorkspaceNameAvailability = useCallback(async (name) => {
    console.log("API call started for:", name);

    if (!name.trim()) {
      setIsNameAvailable(null);
      setWorkspaceNameError("Workspace name is required");
      setIsCheckingName(false);
      return;
    }

    // Create a unique request ID
    const requestId = Date.now();
    latestRequestRef.current = requestId;

    try {
      const result = await checkWorkspaceName(name);
      console.log("API result:", result);

      // Only update state if this is still the latest request
      if (latestRequestRef.current === requestId) {
        setIsNameAvailable(result.available);
        if (result.available) {
          setWorkspaceNameError("");
        } else {
          setWorkspaceNameError(
            result.message || "Workspace name is not available"
          );
        }
        setIsCheckingName(false);
        console.log("State updated for latest request");
      } else {
        console.log("Outdated request, ignoring result");
      }
    } catch (error) {
      console.error("Error checking workspace name:", error);
      // Only show error if this is still the latest request
      if (latestRequestRef.current === requestId) {
        setIsNameAvailable(false);
        setWorkspaceNameError(
          "Error checking workspace name. Please try again."
        );
        setIsCheckingName(false);
      }
    }
  }, []);

  const debouncedCheckWorkspaceName = useCallback(
    debounce(checkWorkspaceNameAvailability, 500),
    [checkWorkspaceNameAvailability]
  );

  const handleWorkspaceNameChange = (e) => {
    const name = e.target.value;
    setWorkspaceName(name);
    console.log("Input changed to:", name);

    if (!name.trim()) {
      // Cancel any pending debounced calls
      debouncedCheckWorkspaceName.cancel();

      setWorkspaceNameError("Workspace name is required");
      setIsNameAvailable(null);
      setIsCheckingName(false);
      console.log("Input empty, clearing states");
    } else {
      if (workspaceNameError === "Workspace name is required") {
        setWorkspaceNameError("");
      }

      setIsCheckingName(true);
      setIsNameAvailable(null);
      // Clear any previous error messages when starting a new check
      if (
        workspaceNameError &&
        workspaceNameError !== "Workspace name is required"
      ) {
        setWorkspaceNameError("");
      }

      console.log("Starting check for:", name);
      debouncedCheckWorkspaceName(name);
    }
  };
  // Fetch retailers
  useEffect(() => {
    const loadRetailers = async () => {
      setLoadingRetailers(true);
      try {
        const result = await fetchRetailers();
        if (result.success) {
          setRetailers(result.data);
          setRetailersError(null);
        } else {
          setRetailersError(result.message);
        }
      } catch (error) {
        console.error("Error fetching retailers:", error);
        setRetailersError("Failed to load retailers. Please refresh the page.");
      } finally {
        setLoadingRetailers(false);
      }
    };

    loadRetailers();
  }, []);

  const isNextDisabled = useMemo(() => {
    if (step === 1) {
      return (
        selectedRetailers.length === 0 || !isNameAvailable || isCheckingName
      );
    }
    if (step === 2) {
      return (
        !isNameAvailable ||
        isCheckingName ||
        selectedRetailers.length === 0 ||
        !selectedRetailers.every(
          (retailerId) =>
            selectedCategories[retailerId] &&
            selectedCategories[retailerId].length > 0
        )
      );
    }
    return false;
  }, [
    step,
    selectedRetailers,
    selectedCategories,
    isNameAvailable,
    isCheckingName,
  ]);

  const isSubmitDisabled =
    !workspaceName ||
    workspaceNameError ||
    !isNameAvailable ||
    isCheckingName ||
    selectedRetailers.length === 0 ||
    Object.keys(selectedCategories).length === 0;

  const handleSubmit = async () => {
    try {
      const moduleId = getModuleIdByName("Workspace");

      const data = Object.entries(selectedCategories).flatMap(
        ([retailerId, categoryIds]) =>
          categoryIds.map((categoryId) => ({
            category_id: categoryId,
            retailer_id: retailerId,
          }))
      );

      const workspaceData = {
        name: workspaceName,
        data,
        module_id: moduleId,
      };

      const result = await createWorkspace(workspaceData);
      if (result.success) {
        showToast.success(`Workspace "${workspaceName}" created successfully!`);
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1500);
      } else {
        showToast.error(result.message);
      }
    } catch (err) {
      showToast.error("Failed to create workspace. Please try again.");
      console.error("Workspace Creation Error:", err);
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: "Retailers", icon: <FiShoppingCart /> },
      { number: 2, label: "Categories", icon: <FiGrid /> },
      { number: 3, label: "My Brands", icon: <FiTag /> },
    ];

    return (
      <div className="relative pb-1">
        <div className="absolute top-6 left-0 right-0 mx-auto h-1 bg-light-gray rounded w-[calc(100%-4rem)]">
          <div
            className="h-full bg-primary-orange rounded transition-all duration-500 ease-in-out"
            style={{ width: `${(step - 1) * (100 / (steps.length - 1))}%` }}
          />
        </div>
        <div className="flex justify-between relative z-10 px-4">
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300",
                  step >= s.number
                    ? "bg-primary-orange border-primary-orange text-white"
                    : "bg-white border-gray text-gray"
                )}
              >
                {step > s.number ? <FiCheck className="w-6 h-6" /> : s.icon}
              </div>
              <span
                className={clsx(
                  "mt-2 text-sm font-medium",
                  step >= s.number ? "text-primary-orange" : "text-gray"
                )}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <Card className="w-full max-h-[calc(100vh-4rem)] min-h-0 bg-white rounded-2xl shadow-xl overflow-y-auto border border-light-gray flex flex-col font-sans">
      <CardHeader className="border-b border-light-gray bg-cream">
        <CardTitle className="!text-h3 !font-bold text-accent-magenta text-center">
          Create Your Workspace
        </CardTitle>
        <div className="mt-3">{renderProgressBar()}</div>
      </CardHeader>

      <div className="flex gap-x-3 mt-3 px-6">
        <label
          htmlFor="workspaceName"
          className="text-body font-medium text-gray-700"
        >
          <div className="flex items-center gap-x-1 pt-1">
            Workspace Name <span className="text-danger-red">*</span>
          </div>
        </label>
        <div>
          <input
            type="text"
            id="workspaceName"
            placeholder="Enter workspace name..."
            value={workspaceName}
            onChange={handleWorkspaceNameChange}
            className={clsx(
              "w-full py-0.5 px-3 rounded-lg border shadow-sm outline-none transition-all duration-300 text-input",
              {
                "border-danger-red":
                  (workspaceNameError &&
                    workspaceNameError !== "Workspace name is required") ||
                  isNameAvailable === false,
                "border-success-green":
                  isNameAvailable === true && !workspaceNameError,
                "border-primary-orange": isCheckingName,
                "border-light-gray":
                  !isCheckingName &&
                  (isNameAvailable === null ||
                    workspaceNameError === "Workspace name is required"),
              }
            )}
          />

          {/* Show messages in priority order */}
          {isCheckingName && workspaceName.trim() && (
            <p className="text-small text-primary-orange mt-1 animate-pulse">
              Checking availability...
            </p>
          )}

          {!isCheckingName &&
            workspaceNameError === "Workspace name is required" && (
              <p className="text-small text-danger-red mt-1">
                Workspace name is required
              </p>
            )}

          {!isCheckingName &&
            workspaceNameError &&
            workspaceNameError !== "Workspace name is required" && (
              <p className="text-small text-danger-red mt-1">
                ✗ {workspaceNameError}
              </p>
            )}

          {!isCheckingName &&
            isNameAvailable === true &&
            !workspaceNameError && (
              <p className="text-small text-success-green mt-1">
                ✓ Workspace name is available
              </p>
            )}
        </div>
      </div>

      <CardBody className="!p-5 flex-grow overflow-y-auto scrollbar-thin">
        {loadingRetailers ? (
          <div className="text-center py-8 text-body text-gray-700">
            Loading retailers...
          </div>
        ) : retailersError ? (
          <p className="text-small text-danger-red">{retailersError}</p>
        ) : (
          <>
            {step === 1 && (
              <Retailer
                selectedRetailers={memoizedSelectedRetailers}
                setSelectedRetailers={setSelectedRetailers}
              />
            )}
            {step === 2 && (
              <Category
                selectedRetailers={memoizedSelectedRetailers}
                selectedCategories={memoizedSelectedCategories}
                setSelectedCategories={setSelectedCategories}
                retailers={memoizedRetailers}
                setCategoriesByRetailer={setCategoriesByRetailer}
              />
            )}
            {step === 3 && (
              <Brand
                selectedCategories={memoizedSelectedCategories}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                retailers={memoizedRetailers}
                categoriesByRetailer={memoizedCategoriesByRetailer}
              />
            )}
          </>
        )}
      </CardBody>

      <CardActions className="flex !justify-between items-center w-full p-8 border-t border-light-gray bg-cream">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => prev - 1)}
            className="px-4 py-2 rounded-lg border-2 border-primary-orange text-primary-orange hover:bg-peach transition-all duration-300 text-button font-medium flex items-center"
          >
            <FiChevronLeft className="mr-2" /> Back
          </button>
        ) : (
          <div></div>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => prev + 1)}
            disabled={isNextDisabled}
            className={clsx(
              "px-4 py-2 rounded-lg bg-primary-orange text-white hover:bg-brand-gradient transition-all duration-300 text-button font-medium flex items-center",
              { "opacity-50 cursor-not-allowed": isNextDisabled }
            )}
          >
            Next <FiChevronRight className="ml-2 h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={clsx(
              "px-4 py-2 rounded-lg bg-success-green text-white hover:bg-success-green/90 transition-all duration-300 text-button font-medium flex items-center",
              { "opacity-50 cursor-not-allowed": isSubmitDisabled }
            )}
          >
            Create Workspace <FiCheck className="ml-2 h-5 w-5" />
          </button>
        )}
      </CardActions>
    </Card>
  );

  return hasWorkspace ? (
    renderContent()
  ) : (
    <div className="flex items-center justify-center h-[95vh] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {renderContent()}
    </div>
  );
}
