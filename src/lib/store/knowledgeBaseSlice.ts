import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  chunkCount: number;
  sourceType: string;
  sourceUrl: string | null;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface KnowledgeBaseStats {
  totalKnowledgeBases: number;
  readyKnowledgeBases: number;
  totalChunks: number;
  byStatus?: Record<string, number>;
  bySourceType?: Record<string, number>;
}

interface KnowledgeBaseState {
  knowledgeBases: KnowledgeBase[];
  stats: KnowledgeBaseStats;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: KnowledgeBaseState = {
  knowledgeBases: [],
  stats: {
    totalKnowledgeBases: 0,
    readyKnowledgeBases: 0,
    totalChunks: 0
  },
  status: 'idle',
  error: null,
  lastFetched: null,
};

// Async thunk to fetch knowledge base list and stats
export const fetchKnowledgeBases = createAsyncThunk(
  'knowledgeBase/fetchKnowledgeBases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/knowledge-base');
      
      if (!response.ok) {
        return rejectWithValue(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return rejectWithValue(`Invalid response type: ${contentType}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.error || 'Unknown error');
      }

      return data.knowledgeBases || [];
    } catch (_) {
      return rejectWithValue('Network error while fetching knowledge bases');
    }
  }
);

// Async thunk to fetch knowledge base stats only
export const fetchKnowledgeBaseStats = createAsyncThunk(
  'knowledgeBase/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/knowledge-base/search?action=stats');
      
      if (!response.ok) {
        return rejectWithValue(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.error || 'Unknown error');
      }

      return data.data || { totalKnowledgeBases: 0, readyKnowledgeBases: 0, totalChunks: 0 };
    } catch (_) {
      return rejectWithValue('Network error while fetching knowledge base stats');
    }
  }
);

const knowledgeBaseSlice = createSlice({
  name: 'knowledgeBase',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch knowledge bases
      .addCase(fetchKnowledgeBases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchKnowledgeBases.fulfilled, (state, action: PayloadAction<KnowledgeBase[]>) => {
        state.status = 'succeeded';
        state.knowledgeBases = action.payload;
        state.lastFetched = Date.now();
        
        // Calculate stats from the knowledge bases
        const kbs = action.payload;
        state.stats = {
          totalKnowledgeBases: kbs.length,
          readyKnowledgeBases: kbs.filter(kb => kb.status === 'READY').length,
          totalChunks: kbs.reduce((sum, kb) => sum + (kb.chunkCount || 0), 0)
        };
      })
      .addCase(fetchKnowledgeBases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch stats only
      .addCase(fetchKnowledgeBaseStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchKnowledgeBaseStats.fulfilled, (state, action: PayloadAction<KnowledgeBaseStats>) => {
        state.status = 'succeeded';
        state.stats = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchKnowledgeBaseStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetStatus } = knowledgeBaseSlice.actions;

// Selectors
export const selectKnowledgeBases = (state: { knowledgeBase: KnowledgeBaseState }) => state.knowledgeBase.knowledgeBases;
export const selectKnowledgeBaseStats = (state: { knowledgeBase: KnowledgeBaseState }) => state.knowledgeBase.stats;
export const selectKnowledgeBaseStatus = (state: { knowledgeBase: KnowledgeBaseState }) => state.knowledgeBase.status;
export const selectKnowledgeBaseError = (state: { knowledgeBase: KnowledgeBaseState }) => state.knowledgeBase.error;
export const selectKnowledgeBaseLastFetched = (state: { knowledgeBase: KnowledgeBaseState }) => state.knowledgeBase.lastFetched;

// Helper selector to check if data is fresh (less than 5 minutes old)
export const selectIsKnowledgeBaseFresh = (state: { knowledgeBase: KnowledgeBaseState }) => {
  const lastFetched = state.knowledgeBase.lastFetched;
  if (!lastFetched) return false;
  return Date.now() - lastFetched < 5 * 60 * 1000; // 5 minutes
};

export default knowledgeBaseSlice.reducer;
