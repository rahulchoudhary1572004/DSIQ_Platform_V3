// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './slices/profileSlice';
import authReducer from './slices/authSlice';
import permissionReducer from './slices/permissionSlice';
import moduleReducer from './slices/moduleSlice';
import rolesReducer from './slices/rolesSlice';
import usersReducer from './slices/userSlice';
import workspaceViewReducer from './slices/workspaceViewSlice';
import dateRangeReducer from './slices/dateRangeSlice'; 

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    workspaceView: workspaceViewReducer, 
    auth: authReducer,
    permissions: permissionReducer,
    modules: moduleReducer,
    users: usersReducer,
    roles: rolesReducer,
    dateRange: dateRangeReducer
  }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
