import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ProductDataProvider } from "./context/ProductDataContext";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/SignupPage";
import WorkspaceForm from "./pages/WorkspaceCreation";
import ModifyWorkspace from "./pages/WorkspaceView/ModifyWorkspace";
import Home from "./pages/Home";
import HelpPage from "./pages/HelpPage";
import Profile from "./components/Profile";
import ViewWorkspacesPage from "./pages/WorkspaceView/ViewWorkspace";
import ResetPassword from "./pages/ResetPassword";
import SettingsPage from "./pages/SettingsPage";
import WorkspaceDetailsPage from "./pages/WorkspaceView/WorkspaceDetailsPage";
import { initializePermissions } from "./redux/slices/permissionSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductAttribute from "./pages/PIM/ProductAttribute/ProductDetailPage";
//shopperIQ
import ReviewMinerPage from "./pages/ShopperIQ/ReviewMinerPage";
//ChannelAmp
import MainPage from "./pages/ChannelAmp/mainPage"
import ChannelAMPDashboard from "./pages/ChannelAmp/ChannelAMPDashboard";
import AuthCallback from "./pages/ChannelAmp/AuthCallback";
import ProfilesPage from "./pages/ChannelAmp/ProfilesPage";
import CampaignsPage from "./pages/ChannelAmp/CampaignsPage";
import AdGroupsPage from "./pages/ChannelAmp/AdGroupsPage";
import AdsPage from "./pages/ChannelAmp/AdsPage";
// PIM Components
import PIM_Dashboard from "./pages/PIM/Dashboard";
import ProductListing from "./pages/PIM/ProductCatalog";
import CreateProductPage from "./pages/PIM/CreateProductPage";
import ProductDetailsPage from "./pages/PIM/ProductDetailsPage";
import EditProductPage from "./pages/PIM/EditProductPage";
import ViewManagementPage from "./pages/PIM/ViewManagementPage";
import ViewConfigurationPage from "./pages/PIM/ViewConfigurationPage";
import DigitalAssets from "./pages/PIM/DAM";
import Syndication from "./pages/PIM/Syndication";
import Channels from "./pages/PIM/ChannelPages/Channels";
import ChannelDetails from "./pages/PIM/ChannelPages/ChannelDetails";

// Placeholder components for unmapped features
const CategoryAnalysis = () => <div>Category Analysis Page</div>;
const BrandAnalysis = () => <div>Brand Analysis Page</div>;
const ItemLevelAnalysis = () => <div>Item Level Analysis Page</div>;
const SponsoredADTracker = () => <div>Sponsored AD Tracker Page</div>;
const ShareOfVoice = () => <div>Share of Voice Page</div>;
const KeywordTracker = () => <div>Keyword Tracker Page</div>;
const KeywordPlanner = () => <div>Keyword Planner Page</div>;

const BrandCategoryInsights = () => <div>Brand & Category Insights Page</div>;
const AskAIChatbot = () => <div>Ask our AI Chatbot Page</div>;
const PanelData = () => <div>Panel Data Page</div>;

const PromotionTracker = () => <div>Promotion Tracker Page</div>;
const PromotionPlanner = () => <div>Promotion Planner Page</div>;
const ActivationPartner = () => <div>Activation Partner Page</div>;
const Keywords = () => <div>Keywords Page</div>;
const SearchTerms = () => <div>Search Terms Page</div>;
const Targets = () => <div>Targets Page</div>;
const AutomationRules = () => <div>Automation Rules Page</div>;
const Reporting = () => <div>Reporting Page</div>;
const AppSettings = () => <div>App Settings Page</div>;

// PIM Components
// const DigitalAssets = () => <div>Digital Assets Page</div>;
// const Syndication = () => <div>Syndication Page</div>;
// const Channels = () => <div>Channels Page</div>;
// Error Boundary Component

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const App = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [hasWorkspace, setHasWorkspace] = useState(false);

  useEffect(() => {
    const workspaceFlag = localStorage.getItem("hasWorkspace");
    if (workspaceFlag === "true") {
      setHasWorkspace(true);
    }
  }, []);

  useEffect(() => {
    const permissions = dispatch(initializePermissions());
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <ProductDataProvider>
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Home isLoggedIn={isLoggedIn} />
                ) : (
                  <WelcomePage isLoggedIn={isLoggedIn} />
                )
              }
            >
              {isLoggedIn && (
                <>
                  <Route
                    path="viewWorkspace"
                    element={<ViewWorkspacesPage isLoggedIn={isLoggedIn} />}
                  />
                  <Route
                    path="viewWorkspace/ModifyWorkspace"
                    element={<ModifyWorkspace isLoggedIn={isLoggedIn} />}
                  />
                  <Route
                    path="viewWorkspace/:name"
                    element={<WorkspaceDetailsPage />}
                  />
                  <Route
                    path="profile"
                    element={<Profile isLoggedIn={isLoggedIn} />}
                  />
                  {hasWorkspace && (
                    <Route
                      path="workspaceCreate"
                      element={
                        <WorkspaceForm
                          hasWorkspace={hasWorkspace}
                          setHasWorkspace={setHasWorkspace}
                          isLoggedIn={isLoggedIn}
                        />
                      }
                    />
                  )}
                  {/* Digital Shelf IQ Routes */}
                  <Route path="digital-shelf-iq">
                    <Route index element={<CategoryAnalysis />} />
                    <Route path="category-analysis" element={<CategoryAnalysis />} />
                    <Route path="brand-analysis" element={<BrandAnalysis />} />
                    <Route path="item-level-analysis" element={<ItemLevelAnalysis />} />
                    <Route path="sponsored-ad-tracker" element={<SponsoredADTracker />} />
                    <Route path="share-of-voice" element={<ShareOfVoice />} />
                    <Route path="keyword-tracker" element={<KeywordTracker />} />
                    <Route path="keyword-planner" element={<KeywordPlanner />} />
                  </Route>
                  {/* Shopper IQ Routes */}
                  <Route path="shopper-iq">
                    <Route index element={<ReviewMinerPage />} />
                    <Route path="review-content-miner" element={<ReviewMinerPage />} />
                    <Route path="brand-category-insights" element={<BrandCategoryInsights />} />
                    <Route path="ask-ai-chatbot" element={<AskAIChatbot />} />
                    <Route path="panel-data" element={<PanelData />} />
                  </Route>
                  {/* Promotion IQ Routes */}
                  <Route path="promotion-iq">
                    <Route index element={<PromotionTracker />} />
                    <Route path="promotion-tracker" element={<PromotionTracker />} />
                    <Route path="promotion-planner" element={<PromotionPlanner />} />
                    <Route path="activation-partner" element={<ActivationPartner />} />
                  </Route>

                  {/* ChannelAMP Routes */}
                  <Route path="channelamp">
                    <Route index element={<MainPage />} />
                    <Route path="dashboard" element={<ChannelAMPDashboard />} />
                    <Route path="profiles" element={<ProfilesPage />} />
                    <Route path="campaigns" element={<CampaignsPage />} />
                    <Route path="ad-groups" element={<AdGroupsPage />} />
                    <Route path="ads" element={<AdsPage />} />
                    <Route path="keywords" element={<Keywords />} />
                    <Route path="search-terms" element={<SearchTerms />} />
                    <Route path="targets" element={<Targets />} />
                    <Route path="automation-rules" element={<AutomationRules />} />
                    <Route path="reporting" element={<Reporting />} />
                  </Route>
                  {/* PIM */}
                  <Route path="pim">
                    <Route index element={<PIM_Dashboard />} />
                    <Route path="dashboard" element={<PIM_Dashboard />} />
                    {/* Product Management Routes */}
                    <Route path="products" element={<ProductListing />} />
                    <Route path="products/new" element={<CreateProductPage />} />
                    <Route path="products/:id" element={<ProductDetailsPage />} />
                    <Route path="products/:id/edit" element={<EditProductPage />} />
                    {/* Views Management Route */}
                    <Route path="views" element={<ViewManagementPage />} />
                    <Route path="views/:id" element={<ViewConfigurationPage />} />
                    <Route path="digital-assets" element={<DigitalAssets />} />
                    <Route path="syndication" element={<Syndication />} />
                    <Route path="channels" element={<Channels />} />
                    <Route path="channels/:channelName" element={<ChannelDetails />} />
                  </Route>
                  {/* App Settings Route */}
                  <Route path="app-settings" element={<AppSettings />} />
                </>
              )}
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/test/productAttributePage" element={<ProductAttribute />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/resetPassword/:token" element={<ResetPassword />} />
            <Route
              path="/workspaceCreate"
              element={
                isLoggedIn ? (
                  <WorkspaceForm
                    hasWorkspace={hasWorkspace}
                    setHasWorkspace={setHasWorkspace}
                    isLoggedIn={isLoggedIn}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/help" element={isLoggedIn ? <HelpPage /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
          <ToastContainer />
        </ProductDataProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;