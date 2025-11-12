import { useState, useEffect, useMemo } from "react";
import { Check, X, Copy, Loader2 } from "lucide-react";
import { Card, CardHeader, CardBody, CardTitle, CardSubtitle, CardActions } from '@progress/kendo-react-layout';
import { useDebounce } from 'use-debounce';
import { useSelector, useDispatch } from 'react-redux';
import { createRoleWithPermissions } from '../../redux/slices/rolesSlice';
import api from '../../api/axios';
import { getModuleIdByName } from "../../../utils/getModuleIdByName";
import showToast from '../../../utils/toast'; 
import { getRequest } from '../../api/apiHelper/getHelper';

const CreateRoles = ({ onCancel, onRoleCreated }: any) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state: any) => state.roles);
  const organization_id = useSelector((state: any) => state.auth?.user?.organization_id);
  // State for wizard flow
  const [activeTab, setActiveTab] = useState("details");
  const [creationComplete, setCreationComplete] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    details: {
      name: "",
      description: "",
    },
    permissions: {
      copiedFrom: null
    },
  });

  // Validation state
  const [validation, setValidation] = useState({
    details: {
      isValid: false,
      message: ""
    },
    permissions: {
      isValid: true,
      message: "Please select at least one permission"
    }
  });

  // API states
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameAvailability, setNameAvailability] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [modules, setModules] = useState([]);

  // Debounce the role name for API checking
  const [debouncedName] = useDebounce(formData.details.name, 500);

  // Permission matrix state
  const [permissionMatrix, setPermissionMatrix] = useState([]);

  // Steps for the progress path
  const steps = [
    { id: "details", label: "Role Details" },
    { id: "permissions", label: "Permissions" },
    { id: "review", label: "Review & Create" }
  ];

  // UI state
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Fetch modules from backend
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoadingModules(true);
      try {
        // Use the correct endpoint: /modules instead of /get-modules
        const response = await getRequest('/modules'); 
        const list = Array.isArray(response) ? response as any[] : (response as any)?.data || (response as any)?.modules || [];
        setModules(list as any);
        // Initialize permission matrix with fetched modules (use display name normalized)
        setPermissionMatrix((list as any[]).map((module: any) => {
          const rawName = module.name ?? module.module_name ?? 'Unknown Module';
          const display = String(rawName).replace(/_/g, ' ');
          return {
            name: display,
            create: false,
            read: true,
            update: false,
            archived: false
          };
        }));
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        showToast.error(err.message, { autoClose: 5000 });
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

  // Calculate total permissions (memoized for performance)
  const totalPermissions = useMemo(() => {
    return permissionMatrix.reduce((total, module) => {
      return total +
        (module.create ? 1 : 0) +
        (module.read ? 1 : 0) +
        (module.update ? 1 : 0) +
        (module.archived ? 1 : 0);
    }, 0);
  }, [permissionMatrix]);

  // Check role name availability with backend
  useEffect(() => {
    const checkNameAvailability = async () => {
      if (debouncedName.trim() === "") {
        setNameAvailability(null);
        setValidation(prev => ({
          ...prev,
          details: {
            isValid: false,
            message: "Role name is required"
          }
        }));
        return;
      }

      if (debouncedName.length < 3) {
        setNameAvailability(false);
        setValidation(prev => ({
          ...prev,
          details: {
            isValid: false,
            message: "Role name must be at least 3 characters long"
          }
        }));
        return;
      }

      // Check against existing roles from Redux store (client-side cache)
      setIsCheckingName(true);
      try {
        // Check if role name already exists in the roles list
        const existingRole = roles.find(
          (role: any) => role.name.toLowerCase() === debouncedName.trim().toLowerCase()
        );

        const isAvailable = !existingRole;

        setNameAvailability(isAvailable);
        setValidation(prev => ({
          ...prev,
          details: {
            isValid: isAvailable && debouncedName.trim() !== "",
            message: isAvailable ? "" : "Role name already exists"
          }
        }));
      } catch (err) {
        // If check fails, allow creation (optimistic approach)
        setNameAvailability(true);
        setValidation(prev => ({
          ...prev,
          details: {
            isValid: true,
            message: ""
          }
        }));
      } finally {
        setIsCheckingName(false);
      }
    };

    checkNameAvailability();
  }, [debouncedName]);

  // Handle role name and description change
  const handleDetailsChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id === "role-name" ? "name" : "description";

    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [fieldName]: value
      }
    }));

    if (fieldName === "name" && value.trim() === "") {
      setValidation(prev => ({
        ...prev,
        details: {
          isValid: false,
          message: "Role name is required"
        }
      }));
    }
  };

  // Handle permission selection
  const handlePermissionChange = (moduleIndex, permType) => {
    const updatedMatrix = permissionMatrix.map((module, idx) =>
      idx === moduleIndex ? { ...module, [permType]: !module[permType] } : module
    );

    setPermissionMatrix(updatedMatrix);

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        copiedFrom: null
      }
    }));

    const newTotal = updatedMatrix.reduce((total, module) => {
      return total +
        (module.create ? 1 : 0) +
        (module.read ? 1 : 0) +
        (module.update ? 1 : 0) +
        (module.archived ? 1 : 0);
    }, 0);

    setValidation(prev => ({
      ...prev,
      permissions: {
        isValid: newTotal > 0,
        message: newTotal > 0 ? "" : "Please select at least one permission"
      }
    }));
  };

  // Transform frontend permissions to backend format
  const transformPermissionsToBackend = (matrix) => {
    // Not used anymore for compact format; kept for reference
    return matrix.map((module: any) => ({
      module_id: (modules as any[]).find((m: any) => {
        const rawName = m.name ?? m.module_name ?? '';
        return String(rawName).replace(/_/g, ' ') === module.name;
      })?.id || '',
      can_create: Boolean(module.create),
      can_read: Boolean(module.read),
      can_update: Boolean(module.update),
      can_archive: Boolean(module.archived),
    })).filter((p: any) => p.module_id);
  };

  // Handle create role submission with backend
  const handleCreateRole = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!organization_id) {
        showToast.error('Organization is missing. Please re-login or select an organization.');
        setIsSubmitting(false);
        return;
      }
      // Build permissions payload for /create-role-with-permissions
      const permissionsPayload = transformPermissionsToBackend(permissionMatrix);

      // Pull organization_id from auth slice (fallback null)
      const apiPayload = {
        role: {
          name: formData.details.name.trim(),
          organization_id,
        },
        permissions: permissionsPayload,
      };

      await (dispatch(createRoleWithPermissions(apiPayload) as any) as any).unwrap();
      if (typeof onRoleCreated === 'function') {
        onRoleCreated();
      }
      showToast.success(`Role "${formData.details.name}" created successfully!`, { autoClose: 2000 });
      setCreationComplete(true);
    } catch (err: any) {
      showToast.error(err, { autoClose: 2000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle copying permissions from template
  const handleCopyFromTemplate = (roleId) => {
    const selectedRole = roles.find(role => role.id === roleId);

    if (selectedRole) {
      const newMatrix = modules.map((module: any) => {
        const rawName = module.name ?? module.module_name ?? 'Unknown Module';
        const display = String(rawName).replace(/_/g, ' ');
        const modulePermissions = selectedRole.permissions[display] || {
          create: false, read: true, update: false, archived: false
        };

        return {
          name: display,
          ...modulePermissions
        };
      });

      setPermissionMatrix(newMatrix);
      setFormData(prev => ({
        ...prev,
        permissions: {
          copiedFrom: selectedRole.name
        }
      }));
      setValidation(prev => ({
        ...prev,
        permissions: {
          isValid: Object.values(newMatrix).some(m => m.create || m.read || m.update || m.archived),
          message: Object.values(newMatrix).some(m => m.create || m.read || m.update || m.archived)
            ? ""
            : "Please select at least one permission"
        }
      }));
      setShowTemplateSelector(false);
    }
  };

  // Handle tab navigation with validation
  const handleTabChange = (tabId) => {
    if (tabId === "permissions" && !validation.details.isValid) return;
    if (tabId === "review" && (!validation.details.isValid || !validation.permissions.isValid)) return;

    setActiveTab(tabId);
    setError(null);
  };

  // Determine current step index
  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

  // Show loading state while fetching modules
  if (isLoadingModules) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-12 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-primary-orange" />
        <span className="ml-2 text-dark-gray text-body">Loading modules...</span>
      </div>
    );
  }

  // Success view after creation
  if (creationComplete) {
    return (
      <div className="max-w-6xl mx-auto font-sans">
        <Card className="shadow-sm">
          <CardBody className="text-center p-12">
            <div className="bg-primary-orange/20 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-primary-orange" />
            </div>
            <CardTitle className="text-h2 font-sans text-dark-gray mb-2">
              Role Created Successfully
            </CardTitle>
            <CardSubtitle className="text-body text-gray mb-6">
              Role "{formData.details.name}" has been created.
            </CardSubtitle>
            <CardActions className="!justify-between gap-4">
              <button
                onClick={() => {
                  setFormData({
                    details: { name: "", description: "" },
                    permissions: { copiedFrom: null }
                  });
                  setPermissionMatrix(modules.map(module => ({
                    name: module.module_name,
                    create: false,
                    read: true,
                    update: false,
                    archived: false
                  })));
                  setValidation({
                    details: { isValid: false, message: "" },
                    permissions: { isValid: true, message: "" }
                  });
                  setActiveTab("details");
                  setCreationComplete(false);
                  setError(null);
                  setNameAvailability(null);
                }}
                className="px-4 py-3 bg-gradient-to-r from-gradient-from to-gradient-to text-white rounded-md hover:from-gradient-from/90 hover:to-gradient-to/90 transition-colors text-button"
              >
                Create Another Role
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-3 bg-light-gray text-dark-gray rounded-md hover:bg-light-gray/80 transition-colors text-button"
              >
                Return to Roles
              </button>
            </CardActions>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 text-dark-gray">Create New Role</h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-light-gray text-dark-gray rounded-md hover:bg-light-gray/80 transition-colors text-button"
          aria-label="Cancel role creation"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-danger-red/10 border-l-4 border-danger-red p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-danger-red" />
            </div>
            <div className="ml-3">
              <p className="text-small text-danger-red">{error}</p>
            </div>
          </div>
        </div>
      )}

      <nav aria-label="Progress">
        <div className="flex items-center justify-between mb-9">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative w-full">
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${index < currentStepIndex ? "bg-gradient-to-r from-gradient-from to-gradient-to" : "bg-light-gray"}`}
                  aria-hidden="true"
                ></div>
              )}
              <button
                onClick={() => handleTabChange(step.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${index < currentStepIndex
                    ? "bg-primary-orange text-white"
                    : index === currentStepIndex
                      ? "bg-primary-orange text-white"
                      : "bg-light-gray text-gray"
                  } ${(index === 1 && !validation.details.isValid) ||
                    (index === 2 && (!validation.details.isValid || !validation.permissions.isValid))
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                  } text-button`}
                disabled={
                  (index === 1 && !validation.details.isValid) ||
                  (index === 2 && (!validation.details.isValid || !validation.permissions.isValid))
                }
                aria-current={index === currentStepIndex ? "step" : undefined}
                aria-label={step.label}
              >
                {index < currentStepIndex ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
              </button>
              <span
                className={`mt-2 text-small ${index <= currentStepIndex ? "text-primary-orange" : "text-gray"}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </nav>

      {activeTab === "details" && (
        <Card className="shadow-sm">
          <CardBody>
            <div className="space-y-6">
              <div>
                <label htmlFor="role-name" className="block text-body text-dark-gray mb-1">
                  Role Name <span className="text-danger-red">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="role-name"
                    className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange text-input"
                    placeholder="e.g., Marketing Analyst"
                    value={formData.details.name}
                    onChange={handleDetailsChange}
                    aria-describedby="name-validation"
                  />
                  {isCheckingName && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-gray" />
                    </div>
                  )}
                </div>
                <div id="name-validation" className="mt-1">
                  {validation.details.message && (
                    <p className="text-small text-danger-red">{validation.details.message}</p>
                  )}
                  {formData.details.name.trim() !== "" && nameAvailability === true && !validation.details.message && (
                    <p className="text-small text-success-green">Name is available</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="role-description" className="block text-body text-dark-gray mb-1">
                  Description
                </label>
                <textarea
                  id="role-description"
                  rows={4}
                  className="w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange text-input"
                  placeholder="Describe the purpose and scope of this role..."
                  value={formData.details.description}
                  onChange={handleDetailsChange}
                  aria-describedby="description-help"
                ></textarea>
                <p id="description-help" className="mt-1 text-small text-gray">
                  Optional description to explain this role's purpose
                </p>
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  onClick={() => handleTabChange("permissions")}
                  className={`px-4 py-2 ${validation.details.isValid
                      ? "bg-primary-orange hover:bg-primary-orange/90"
                      : "bg-primary-orange/50 cursor-not-allowed"
                    } text-white rounded-md transition-colors text-button`}
                  disabled={!validation.details.isValid}
                  aria-disabled={!validation.details.isValid}
                >
                  Next: Set Permissions
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === "permissions" && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-light-gray bg-cream">
            <CardTitle className="text-h3 text-dark-gray">Permission Matrix</CardTitle>
            <CardSubtitle className="text-body text-gray">
              Configure access levels for each system module <span className="text-danger-red">*</span>
            </CardSubtitle>
          </CardHeader>
          <CardBody className="p-6">
            <div className="mb-6">
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="flex items-center px-4 py-2 bg-primary-orange/10 text-primary-orange border border-primary-orange/20 rounded-md hover:bg-primary-orange/20 transition-colors text-button"
                aria-expanded={showTemplateSelector}
                aria-controls="template-selector"
              >
                <Copy size={16} className="mr-2" aria-hidden="true" />
                Copy from existing role
              </button>

              {showTemplateSelector && (
                <Card id="template-selector" className="mt-2 shadow-sm">
                  <CardBody className="p-2">
                    <p className="text-small text-gray mb-2 px-2">Select a role to copy permissions from:</p>
                    <ul className="divide-y divide-light-gray">
                      {roles.map(role => (
                        <li key={role.id}>
                          <button
                            onClick={() => handleCopyFromTemplate(role.id)}
                            className="w-full text-left px-3 py-2 hover:bg-peach rounded-md transition-colors"
                          >
                            <p className="text-body text-dark-gray">{role.name}</p>
                            <p className="text-small text-gray">{role.description}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}

              {formData.permissions.copiedFrom && (
                <div className="mt-2 text-small text-gray flex items-center">
                  <Check size={14} className="text-success-green mr-1" aria-hidden="true" />
                  <span>
                    Permissions copied from <strong>{formData.permissions.copiedFrom}</strong>. You can modify them below.
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-gray">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 bg-cream text-left text-table text-gray uppercase tracking-wider">
                      Module
                    </th>
                    <th scope="col" className="px-6 py-3 bg-cream text-center text-table text-gray uppercase tracking-wider">
                      Create
                    </th>
                    <th scope="col" className="px-6 py-3 bg-cream text-center text-table text-gray uppercase tracking-wider">
                      Read
                    </th>
                    <th scope="col" className="px-6 py-3 bg-cream text-center text-table text-gray uppercase tracking-wider">
                      Update
                    </th>
                    <th scope="col" className="px-6 py-3 bg-cream text-center text-table text-gray uppercase tracking-wider">
                      Archived
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-light-gray">
                  {permissionMatrix.map((module, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-table text-dark-gray">
                        {module.name}
                      </td>
                      {['create', 'read', 'update', 'archived'].map((perm) => (
                        <td key={perm} className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-orange border-light-gray rounded focus:ring-primary-orange"
                            checked={module[perm]}
                            onChange={() => handlePermissionChange(idx, perm)}
                            aria-label={`${perm} permission for ${module.name}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!validation.permissions.isValid && (
              <div className="mt-3">
                <p className="text-small text-danger-red">{validation.permissions.message}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => handleTabChange("details")}
                className="px-4 py-2 border border-light-gray text-dark-gray rounded-md hover:bg-peach transition-colors text-button"
              >
                Back
              </button>
              <button
                onClick={() => handleTabChange("review")}
                className={`px-4 py-2 ${validation.permissions.isValid
                    ? "bg-primary-orange hover:bg-primary-orange/90"
                    : "bg-primary-orange/50 cursor-not-allowed"
                  } text-white rounded-md transition-colors text-button`}
                disabled={!validation.permissions.isValid}
                aria-disabled={!validation.permissions.isValid}
              >
                Next: Review
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === "review" && (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-light-gray bg-cream">
            <CardTitle className="text-h3 text-dark-gray">Review and Create Role</CardTitle>
            <CardSubtitle className="text-body text-gray">Review role details before creation</CardSubtitle>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-body text-dark-gray mb-2">Role Details</h4>
                <Card className="bg-cream">
                  <CardBody className="p-4">
                    <div className="mb-3">
                      <span className="block text-small text-gray">Name</span>
                      <span className="block text-body text-dark-gray">{formData.details.name}</span>
                    </div>
                    <div>
                      <span className="block text-small text-gray">Description</span>
                      <span className="block text-body text-dark-gray">
                        {formData.details.description || "No description provided"}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {formData.permissions.copiedFrom && (
                <div>
                  <h4 className="text-body text-dark-gray mb-2">Template Source</h4>
                  <Card className="bg-cream">
                    <CardBody className="p-4">
                      <div className="flex items-center">
                        <Copy size={16} className="text-primary-orange mr-2" aria-hidden="true" />
                        <span className="text-body text-dark-gray">
                          Based on <strong>{formData.permissions.copiedFrom}</strong> role with modifications
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-body text-dark-gray mb-2">Permission Summary</h4>
              <Card className="bg-cream">
                <CardBody className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {permissionMatrix.map((module, idx) => (
                      <div key={idx}>
                        <h5 className="text-table text-dark-gray mb-1">{module.name}</h5>
                        <ul className="text-small text-gray space-y-1">
                          {['create', 'read', 'update', 'archived'].map((perm) => (
                            <li key={perm} className="flex items-center">
                              <span
                                className={`h-2 w-2 ${module[perm] ? "bg-success-green" : "bg-danger-red"} rounded-full mr-1`}
                                aria-hidden="true"
                              ></span>
                              {perm.charAt(0).toUpperCase() + perm.slice(1)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => handleTabChange("permissions")}
                className="px-4 py-2 border border-light-gray text-dark-gray rounded-md hover:bg-peach transition-colors text-button"
              >
                Back
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-gradient-to-r from-gradient-from to-gradient-to text-white rounded-md hover:from-gradient-from/90 hover:to-gradient-to/90 transition-colors flex items-center text-button"
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {isSubmitting ? "Creating..." : "Create Role"}
              </button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default CreateRoles;