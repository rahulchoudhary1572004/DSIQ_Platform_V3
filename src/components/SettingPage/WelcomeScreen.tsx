// Welcome Screen Component
const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white border border-gray-200 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 text-center">Welcome to the Settings Page</h2>
      <p className="text-gray-600 mb-8 text-center">
        Manage users, roles, and data settings to optimize your experience. Get started by managing your users.
      </p>
      <button
        onClick={onGetStarted}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow"
      >
        Get Started
      </button>
    </div>
  );
};

export default WelcomeScreen;