import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  companyInfo?: string;
  widgetKey?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    aiReplies: number;
  };
}

interface ProfileState {
  data: ProfileData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: ProfileState = {
  data: null,
  status: 'idle',
  error: null,
  lastFetched: null,
};

// Async thunk to fetch profile data
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile');
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to fetch profile');
      }
      
      return result.data;
    } catch {
      return rejectWithValue('Network error while fetching profile');
    }
  }
);

// Async thunk to update profile data
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (updateData: Partial<ProfileData>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to update profile');
      }
      
      return result.data;
    } catch {
      return rejectWithValue('Network error while updating profile');
    }
  }
);

// Async thunk to generate widget key
// Note: Widget key now requires knowledge base data instead of company data
export const generateWidgetKey = createAsyncThunk(
  'profile/generateWidgetKey',
  async (_, { rejectWithValue }) => {
    try {
      // Check if user has knowledge base data first
      const kbResponse = await fetch('/api/knowledge-base/search?action=stats');
      const kbResult = await kbResponse.json();
      
      if (!kbResult.success || !kbResult.data?.totalKnowledgeBases || kbResult.data.totalKnowledgeBases === 0) {
        return rejectWithValue('At least one knowledge base is required before generating a widget key. Please upload knowledge base content first.');
      }
      
      const response = await fetch('/api/widget/key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to generate widget key');
      }
      
      return result.data.widgetKey;
    } catch {
      return rejectWithValue('Network error while generating widget key');
    }
  }
);

// Async thunk to delete company data
// Note: This also deletes the widget key since it depends on company data
export const deleteCompanyData = createAsyncThunk(
  'profile/deleteCompanyData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/company-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to delete company data');
      }
      
      return true;
    } catch {
      return rejectWithValue('Network error while deleting company data');
    }
  }
);

// Async thunk to increment AI replies count
export const incrementAiRepliesCount = createAsyncThunk(
  'profile/incrementAiRepliesCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile/increment-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return rejectWithValue(result.error || 'Failed to increment AI replies count');
      }
      
      return result.data.count;
    } catch {
      return rejectWithValue('Network error while incrementing AI replies count');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Manual update for optimistic updates
    updateProfileData: (state, action: PayloadAction<Partial<ProfileData>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile cases
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Generate widget key cases
      .addCase(generateWidgetKey.pending, (state) => {
        state.error = null;
      })
      .addCase(generateWidgetKey.fulfilled, (state, action) => {
        if (state.data) {
          state.data.widgetKey = action.payload;
        }
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(generateWidgetKey.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Delete company data cases
      .addCase(deleteCompanyData.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCompanyData.fulfilled, (state) => {
        if (state.data) {
          state.data.companyInfo = '';
          state.data.widgetKey = ''; // Also clear widget key when company data is deleted
        }
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(deleteCompanyData.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Increment AI replies count
      .addCase(incrementAiRepliesCount.fulfilled, (state, action) => {
        if (state.data) {
          state.data._count.aiReplies = action.payload;
        }
      });
  },
});

export const { clearProfile, clearError, updateProfileData } = profileSlice.actions;

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile.data;
export const selectProfileStatus = (state: { profile: ProfileState }) => state.profile.status;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.status === 'loading';
export const selectHasCompanyData = (state: { profile: ProfileState }) => 
  !!(state.profile.data?.companyInfo?.trim().length);
export const selectWidgetKey = (state: { profile: ProfileState }) => state.profile.data?.widgetKey;
export const selectHasWidgetKey = (state: { profile: ProfileState }) => 
  !!(state.profile.data?.widgetKey?.trim().length);
export const selectAiRepliesCount = (state: { profile: ProfileState }) => 
  state.profile.data?._count?.aiReplies || 0;

// Helper to determine if profile should be fetched
export const selectShouldFetchProfile = (state: { profile: ProfileState }) => {
  const { status, lastFetched } = state.profile;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  if (status === 'idle') return true;
  if (status === 'failed') return true;
  if (lastFetched && Date.now() - lastFetched > CACHE_DURATION) return true;
  
  return false;
};

export default profileSlice.reducer;
