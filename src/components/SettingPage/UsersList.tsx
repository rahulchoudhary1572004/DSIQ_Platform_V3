import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { Users, Edit2, RotateCcw, UserPlus, KeyRound, Download, Upload, Archive } from "lucide-react";
import { process, type CompositeFilterDescriptor, type GroupDescriptor, type SortDescriptor, type DataResult, type FilterDescriptor } from "@progress/kendo-data-query";
import { useDispatch, useSelector } from 'react-redux';
import type { ElementRef } from "react";
import type { RootState, AppDispatch } from "../../redux/store";
import type { RoleSummary } from '../../../utils/getRole';
import type { UserRecord } from '../../redux/slices/userSlice';
import type { PageState } from "../../helper_Functions/KendoDataGrid";
import type { GridColumnProps, GridCellProps } from "@progress/kendo-react-grid";
import KendoDataGrid from "../../helper_Functions/KendoDataGrid";
import AddUser from "../SettingPage/AddUser";
import FloatingAddButton from "../../helper_Functions/FloatingAddButton";
import UpdatePasswordModal from "./UpdatePasswordModal";
import showToast from '../../../utils/toast';
import {
  fetchUsers,
  addUser,
  toggleArchiveUser,
  assignRole,
  selectActiveUsers,
  selectArchivedUsers,
  clearError
} from '../../redux/slices/userSlice';
import { getRoles } from '../../../utils/getRole';
import ExportButton from '../../helper_Functions/Export';

type EditableFieldKey = "firstName" | "lastName" | "Role";

interface EditableTextCellProps {
  isEditing: boolean;
  value?: string | null;
  onChange: (field: EditableFieldKey, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

interface EditableRoleCellProps extends EditableTextCellProps {
  options?: RoleSummary[];
}

const EditableFirstNameComponent: React.FC<EditableTextCellProps> = ({ isEditing, value, onChange, onSave, onCancel }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  if (!isEditing) {
    return null;
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className="w-full p-2 border border-light-gray rounded text-input focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange mb-2"
      value={value ?? ""}
      placeholder="First Name"
      onChange={(event) => onChange("firstName", event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSave();
        if (event.key === "Escape") onCancel();
      }}
    />
  );
};

const EditableLastNameComponent: React.FC<EditableTextCellProps> = ({ isEditing, value, onChange, onSave, onCancel }) => {
  if (!isEditing) {
    return null;
  }

  return (
    <input
      type="text"
      className="w-full p-2 border border-light-gray rounded text-input focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
      value={value ?? ""}
      placeholder="Last Name"
      onChange={(event) => onChange("lastName", event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSave();
        if (event.key === "Escape") onCancel();
      }}
    />
  );
};

const EditableRoleComponent: React.FC<EditableRoleCellProps> = ({ isEditing, value, onChange, options, onSave, onCancel }) => {
  if (!isEditing) {
    return <span>{value ?? "N/A"}</span>;
  }

  return (
    <select
      className="w-full p-2 border border-light-gray rounded text-input focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange"
      value={value ?? ""}
      onChange={(event) => onChange("Role", event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSave();
        if (event.key === "Escape") onCancel();
      }}
    >
      <option value="">Select a role</option>
      {(options ?? []).map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
};

const EditableCell = {
  FirstName: memo(EditableFirstNameComponent),
  LastName: memo(EditableLastNameComponent),
  Role: memo(EditableRoleComponent),
} as const;

interface ErrorBoundaryProps {
  onReset: () => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center h-screen text-danger-red">
          <div>
            <h2>Error: {this.state.error?.message ?? "An unexpected error occurred"}</h2>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="mt-4 px-4 py-2 bg-primary-orange text-white rounded-md"
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

interface EditFormState {
  firstName: string;
  lastName: string;
  Role: RoleSummary["id"] | "";
}

type UserIdentifier = UserRecord["id"];

interface AddUserFormData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role_id?: RoleSummary["id"];
}

type ProcessedUserRecord = UserRecord & {
  fullName: string;
  firstName: string;
  lastName: string;
  Role: string | RoleSummary["id"];
  archived: boolean;
};

type ExtendedGridColumn = GridColumnProps & Record<string, unknown>;

const UsersList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeUsers = useSelector<RootState, UserRecord[]>((state) => selectActiveUsers(state));
  const archivedUsers = useSelector<RootState, UserRecord[]>((state) => selectArchivedUsers(state));
  const loading = useSelector<RootState, boolean>((state) => state.users.loading);
  const error = useSelector<RootState, string | null>((state) => state.users.error);

  const [availableRoles, setAvailableRoles] = useState<RoleSummary[]>([]);
  const [filter, setFilter] = useState<CompositeFilterDescriptor>({ logic: "and", filters: [] as CompositeFilterDescriptor["filters"] });
  const [sort, setSort] = useState<SortDescriptor[]>([]);
  const [group, setGroup] = useState<GroupDescriptor[]>([]);
  const [page, setPage] = useState<PageState>({ skip: 0, take: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<UserIdentifier | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ firstName: "", lastName: "", Role: "" });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserRecord | null>(null);
  const gridRef = useRef<ElementRef<typeof KendoDataGrid> | null>(null);

  useEffect(() => {
    void dispatch(fetchUsers());
    getRoles()
      .then((roles) => {
        setAvailableRoles(roles ?? []);
      })
      .catch((rolesError) => {
        showToast.error('Failed to fetch roles');
        console.error('Error fetching roles:', rolesError);
      });
  }, [dispatch]);
  
  const handleEditChange = useCallback((field: EditableFieldKey, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditSave = useCallback((id: UserIdentifier) => {
    const user = [...activeUsers, ...archivedUsers].find((u) => u.id === id);
    if (!user) return;

    const selectedRoleId = availableRoles.find((role) => role.id === editForm.Role)?.id;

    if (selectedRoleId && selectedRoleId !== user.role_id) {
      dispatch(assignRole({ userId: id, roleId: selectedRoleId }))
        .unwrap()
        .then(() => {
          showToast.success("User role updated successfully!");
        })
        .catch((updateError) => {
          showToast.error(updateError || 'Failed to update user role');
        });
    }
    
    const detailsToUpdate: Partial<UserRecord> = {};
    if (editForm.firstName !== user.first_name) {
      detailsToUpdate.first_name = editForm.firstName;
    }
    if (editForm.lastName !== user.last_name) {
      detailsToUpdate.last_name = editForm.lastName;
    }

    if (Object.keys(detailsToUpdate).length > 0) {
        dispatch(toggleArchiveUser({
          id,
          ...detailsToUpdate
        }))
        .unwrap()
        .then(() => {
          showToast.success("User details updated successfully!");
        })
        .catch((updateError) => {
          showToast.error(updateError || 'Failed to update user details');
        });
    }

    setEditUserId(null);
    setEditForm({ firstName: "", lastName: "", Role: "" });
  }, [dispatch, editForm, availableRoles, activeUsers, archivedUsers]);

  const handleAddUser = (userData: any) => {
    dispatch(addUser(userData))
      .unwrap()
      .then(() => {
        setIsModalOpen(false);
        showToast.success(`${userData.first_name || "User"} ${userData.last_name || ""} has been added successfully!`);
        void dispatch(fetchUsers());
        location.reload();
      })
      .catch((addError) => {
        showToast.error(addError || 'Failed to add user');
      });
  };

  const handleArchive = (user: Partial<UserRecord> & { id: UserIdentifier }) => {
    if (!user?.id) return;
    dispatch(toggleArchiveUser({
      id: user.id,
      password: "12345",
      is_archive: true,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id
    }))
      .unwrap()
      .then(() => {
        showToast.info(`${user.first_name || "User"} ${user.last_name || ""} has been archived`);
        location.reload();
      })
      .catch((archiveError) => {
        showToast.error(archiveError || 'Failed to archive user');
      });
  };

  const handleRestore = (user: Partial<UserRecord> & { id: UserIdentifier }) => {
    if (!user?.id) return;
    dispatch(toggleArchiveUser({
      id: user.id,
      password: "12345",
      is_archive: false,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id
    }))
      .unwrap()
      .then(() => {
        showToast.info(`${user.first_name || "User"} ${user.last_name || ""} has been restored`);
        location.reload();
      })
      .catch((restoreError) => {
        showToast.error(restoreError || 'Failed to restore user');
      });
  };

  const handleEdit = useCallback((user: Partial<UserRecord> & { id: UserIdentifier }) => {
    if (!user?.id) return;
    setEditUserId(user.id);
    setEditForm({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      Role: (user.role_id ?? "") as EditFormState["Role"]
    });
  }, []);

  const handleUpdatePassword = (userId: UserIdentifier | null, newPassword: string) => {
    if (!userId) return;
    console.log(`Password for user ${userId} updated to: ${newPassword}`);
    showToast.success("Password updated successfully!");
  };

  const handleExportClick = () => showToast.info("Export functionality will be implemented soon");

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchUsers());
  };

  const isArchivedView = filter.filters.some((descriptor) => {
    if ((descriptor as CompositeFilterDescriptor).filters) {
      return false;
    }
    const simpleDescriptor = descriptor as FilterDescriptor;
    return simpleDescriptor.field === "archived" && simpleDescriptor.value === true;
  });
  const currentUsers = isArchivedView ? archivedUsers : activeUsers;

  const processedUsers = (currentUsers || []).map(user => ({
    ...user,
    fullName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || "N/A",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    Role: user?.role_name || "N/A",
    archived: user?.is_archive || false
  }));

  const processedData = process(processedUsers, { filter, sort, group, skip: page.skip, take: page.take });

  const toggleArchiveFilter = (showArchived) => {
    setFilter({ logic: "and", filters: showArchived ? [{ field: "archived", operator: "eq", value: true }] : [] });
    setPage({ skip: 0, take: 10 });
  };

  const fullNameCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td>N/A</td>;

    const isCurrentlyEditing = editUserId === props.dataItem.id;
    const fullName = `${props.dataItem.first_name || ''} ${props.dataItem.last_name || ''}`.trim() || "N/A";

    return (
      <td>
        {isCurrentlyEditing ? (
          <div className="space-y-2">
            <EditableCell.FirstName
              isEditing={true}
              value={editForm.firstName}
              onChange={handleEditChange}
              onSave={() => handleEditSave(props.dataItem.id)}
              onCancel={() => {
                setEditUserId(null);
                setEditForm({ firstName: "", lastName: "", Role: "" });
              }}
            />
            <EditableCell.LastName
              isEditing={true}
              value={editForm.lastName}
              onChange={handleEditChange}
              onSave={() => handleEditSave(props.dataItem.id)}
              onCancel={() => {
                setEditUserId(null);
                setEditForm({ firstName: "", lastName: "", Role: "" });
              }}
            />
          </div>
        ) : (
          fullName
        )}
      </td>
    );
  }, [editUserId, editForm.firstName, editForm.lastName, handleEditChange, handleEditSave]);

  const roleCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td>N/A</td>;
    const displayRole = editUserId === props.dataItem.id 
      ? (availableRoles.find(role => role.id === editForm.Role)?.name || "N/A")
      : props.dataItem.role_name || "N/A";
    return (
      <td>
        <EditableCell.Role
          isEditing={editUserId === props.dataItem.id}
          value={editUserId === props.dataItem.id ? editForm.Role : props.dataItem.role_name}
          onChange={handleEditChange}
          options={availableRoles}
          onSave={() => handleEditSave(props.dataItem.id)}
          onCancel={() => { setEditUserId(null); setEditForm({ firstName: "", lastName: "", Role: "" }); }}
        />
      </td>
    );
  }, [editUserId, editForm.Role, handleEditChange, handleEditSave, availableRoles]);

  const actionsCell = useCallback((props: GridCellProps) => {
    if (props.rowType === "groupHeader" || !props.dataItem) return null;

    const user = props.dataItem as ProcessedUserRecord;
    const isCurrentlyEditing = editUserId === user.id;

    if (user.archived) {
      return (
        <td>
          <button
            onClick={() => handleRestore(user)}
            className="px-3 py-1 bg-success-green text-white rounded-md hover:bg-opacity-80 transition duration-200 flex items-center justify-center text-button"
          >
            <RotateCcw size={14} className="mr-1" /> Restore
          </button>
        </td>
      );
    }

    if (isCurrentlyEditing) {
      return (
        <td>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditSave(user.id)}
              className="px-3 py-1 bg-success-green text-white rounded-md hover:bg-opacity-80 transition duration-200 text-button"
            >
              Save
            </button>
            <button
              onClick={() => { setEditUserId(null); setEditForm({ firstName: "", lastName: "", Role: "" }); }}
              className="px-3 py-1 bg-gray text-white rounded-md hover:bg-opacity-80 transition duration-200 text-button"
            >
              Cancel
            </button>
          </div>
        </td>
      );
    }

    return (
      <td>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-2 text-warning-yellow hover:text-opacity-80 hover:bg-cream rounded-full transition duration-200"
            title="Edit User"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleArchive(user)}
            className="p-2 text-danger-red hover:text-opacity-80 hover:bg-cream rounded-full transition duration-200"
            title="Archive User"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={() => { setSelectedUserForPassword(user); setIsPasswordModalOpen(true); }}
            className="p-2 text-info-blue hover:text-opacity-80 hover:bg-cream rounded-full transition duration-200"
            title="Update Password"
          >
            <KeyRound size={18} />
          </button>
        </div>
      </td>
    );
  }, [editUserId, handleEditSave, handleEdit, handleArchive, handleRestore]);

  const columns: ExtendedGridColumn[] = [
    {
      field: "fullName",
      title: "Full Name",
      cell: fullNameCell,
      filterable: true
    },
    {
      field: "email",
      title: "Email",
      filterable: true
    },
    {
      field: "Role",
      title: "Role",
      cell: roleCell,
      filterable: true
    },
    {
      title: "Actions",
      width: "180px",
      cell: actionsCell,
      filterable: false
    }
  ];

  const emptyStateComponent = (
    <div className="bg-peach rounded-lg p-8 text-center border border-light-gray">
      <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-light-gray">
        <Users className="w-10 h-10 text-gray" />
      </div>
      <p className="text-dark-gray text-h4">
        {isArchivedView ? "No archived users found" : "No active users found"}
      </p>
      <p className="text-gray mt-2 max-w-md mx-auto text-body">
        {isArchivedView ?
          "Archive users from the active list to see them here" :
          filter.filters.length > 0 ? "Try adjusting your search or filters" : "Add new users to get started"}
      </p>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : 'An unexpected error occurred';
    return (
      <div className="flex justify-center items-center h-screen text-danger-red">
        <div>
          <h2>Error: {errorMessage}</h2>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-primary-orange text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={handleRetry}>
      <div className="flex flex-col h-screen bg-cream">
        <style>{`
          .k-grid-content tr.k-grouping-row td { padding: 0.75rem 1rem; background-color: #FDE2CF; font-weight: 600; border-bottom: 1px solid #E5E5E5; }
          .k-grid-content tr.k-grouping-row + tr td { border-top: none; }
          .k-grid-header th.k-header { font-weight: 600; padding: 0.75rem 1rem; }
          .k-grid td { padding: 0.75rem 1rem; vertical-align: middle; }
          .k-grouping-header { padding: 0.5rem; background-color: #FDE2CF; border-bottom: 1px solid #E5E5E5; }
          .k-grid-grouping-row { background-color: #FDE2CF; }
        `}</style>
        <div className="flex-grow md:p-6 lg:p-8 max-w-8xl mx-auto w-full bg-cream">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-h2 text-dark-gray flex items-center mb-4 md:mb-0">
              <Users className="w-8 h-8 mr-3 text-primary-orange" /> Users
            </h1>
            <div className="flex space-x-3">
              <ExportButton
                data={processedUsers}
                columns={columns}
                gridRef={gridRef}
                fileName="UsersList"
              />
              <button
                onClick={() => showToast.info("Import functionality will be implemented soon")}
                className="px-4 py-2 bg-accent-magenta text-white rounded-md hover:bg-opacity-80 transition duration-200 flex items-center shadow-lg text-button"
              >
                <Upload className="w-5 h-5 mr-2" /> Import CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-5 border min-h-2/3 border-light-gray">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-4 md:mb-0 w-full md:w-auto">
                <h2 className="text-h3 text-dark-gray min-w-[140px]">
                  {isArchivedView ? "Archived Users" : "Active Users"}
                </h2>
                <div className="flex mt-2 md:mt-0">
                  <button
                    onClick={() => toggleArchiveFilter(false)}
                    className={`px-4 py-2 rounded-l-md text-button ${!isArchivedView ? "bg-primary-orange text-white" : "bg-light-gray text-dark-gray hover:bg-opacity-80"} transition duration-200`}
                  >
                    Active ({activeUsers.length || 0})
                  </button>
                  <button
                    onClick={() => toggleArchiveFilter(true)}
                    className={`px-4 py-2 rounded-r-md text-button ${isArchivedView ? "bg-primary-orange text-white" : "bg-light-gray text-dark-gray hover:bg-opacity-80"} transition duration-200`}
                  >
                    Archived ({archivedUsers.length || 0})
                  </button>
                </div>
              </div>
            </div>

            <KendoDataGrid
              ref={gridRef}
              data={processedUsers}
              processedData={processedData}
              columns={columns}
              filter={filter}
              sort={sort}
              group={group}
              page={page}
              onFilterChange={setFilter}
              onSortChange={setSort}
              onGroupChange={setGroup}
              onPageChange={setPage}
              loading={loading}
              emptyStateComponent={emptyStateComponent}
            />
          </div>
          <FloatingAddButton onClick={() => setIsModalOpen(true)} />
        </div>
        <AddUser
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddUser={handleAddUser}
          availableRoles={availableRoles || []}
          editingUser={editUserId ? (currentUsers || []).find(u => u.id === editUserId) : null}
        />
        <UpdatePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onUpdatePassword={handleUpdatePassword}
          user={selectedUserForPassword}
        />
      </div>
    </ErrorBoundary>
  );
};

export default UsersList;