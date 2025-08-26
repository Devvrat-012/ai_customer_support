import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Customer {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerMeta?: Record<string, unknown>;
  sessionCount: number;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties from API responses
  conversationCount?: number;
  latestConversation?: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface CustomerConversation {
  id: string;
  customerId: string;
  sessionId: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  messageCount?: number;
  lastMessage?: CustomerMessage;
}

export interface CustomerMessage {
  id: string;
  conversationId: string;
  sender: 'CUSTOMER' | 'AI';
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  aiModel?: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface CustomerConversationWithMessages extends CustomerConversation {
  messages: CustomerMessage[];
}

export interface CustomersFilters {
  search?: string;
  status?: 'ACTIVE' | 'RESOLVED' | 'CLOSED' | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'lastSeenAt' | 'createdAt' | 'sessionCount' | 'customerName';
  sortOrder?: 'asc' | 'desc';
}

interface CustomersState {
  customers: Customer[];
  conversations: CustomerConversation[];
  selectedConversation: CustomerConversationWithMessages | null;
  filters: CustomersFilters;
  loading: {
    customers: boolean;
    conversations: boolean;
    messages: boolean;
  };
  error: {
    customers: string | null;
    conversations: string | null;
    messages: string | null;
  };
  pagination: {
    customers: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    conversations: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const initialState: CustomersState = {
  customers: [],
  conversations: [],
  selectedConversation: null,
  filters: {
    status: 'ALL',
    sortBy: 'lastSeenAt',
    sortOrder: 'desc',
  },
  loading: {
    customers: false,
    conversations: false,
    messages: false,
  },
  error: {
    customers: null,
    conversations: null,
    messages: null,
  },
  pagination: {
    customers: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    conversations: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: { 
    page?: number; 
    limit?: number; 
    filters?: CustomersFilters 
  } = {}) => {
    const { page = 1, limit = 20, filters = {} } = params;
    
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    const response = await fetch(`/api/customers?${searchParams}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    return await response.json();
  }
);

export const fetchConversations = createAsyncThunk(
  'customers/fetchConversations',
  async (params: { 
    customerId?: string;
    page?: number; 
    limit?: number; 
    filters?: CustomersFilters 
  } = {}) => {
    const { customerId, page = 1, limit = 20, filters = {} } = params;
    
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(customerId && { customerId }),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    const response = await fetch(`/api/customers/conversations?${searchParams}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return await response.json();
  }
);

export const fetchConversationMessages = createAsyncThunk(
  'customers/fetchConversationMessages',
  async (conversationId: string) => {
    const response = await fetch(`/api/customers/conversations/${conversationId}/messages`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation messages');
    }

    return await response.json();
  }
);

export const updateConversationStatus = createAsyncThunk(
  'customers/updateConversationStatus',
  async ({ conversationId, status }: { conversationId: string; status: string }) => {
    const response = await fetch(`/api/customers/conversations/${conversationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update conversation status');
    }

    return await response.json();
  }
);

// Slice
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CustomersFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'ALL',
        sortBy: 'lastSeenAt',
        sortOrder: 'desc',
      };
    },
    setSelectedConversation: (state, action: PayloadAction<CustomerConversationWithMessages | null>) => {
      state.selectedConversation = action.payload;
    },
    clearErrors: (state) => {
      state.error = {
        customers: null,
        conversations: null,
        messages: null,
      };
    },
    resetCustomers: (state) => {
      state.customers = [];
      state.pagination.customers = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
    resetConversations: (state) => {
      state.conversations = [];
      state.pagination.conversations = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading.customers = true;
        state.error.customers = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading.customers = false;
        state.customers = action.payload.data.customers;
        state.pagination.customers = action.payload.data.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading.customers = false;
        state.error.customers = action.error.message || 'Failed to fetch customers';
      })
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error.conversations = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload.data.conversations;
        state.pagination.conversations = action.payload.data.pagination;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error.conversations = action.error.message || 'Failed to fetch conversations';
      })
      // fetchConversationMessages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading.messages = true;
        state.error.messages = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        const conversation = action.payload.data.conversation;
        state.selectedConversation = conversation;
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error.messages = action.error.message || 'Failed to fetch messages';
      })
      // updateConversationStatus
      .addCase(updateConversationStatus.fulfilled, (state, action) => {
        const updatedConversation = action.payload.data.conversation;
        // Update in conversations list
        const index = state.conversations.findIndex(c => c.id === updatedConversation.id);
        if (index !== -1) {
          state.conversations[index] = { ...state.conversations[index], ...updatedConversation };
        }
        // Update selected conversation if it's the same one
        if (state.selectedConversation && state.selectedConversation.id === updatedConversation.id) {
          state.selectedConversation = { ...state.selectedConversation, ...updatedConversation };
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedConversation,
  clearErrors,
  resetCustomers,
  resetConversations,
} = customersSlice.actions;

export default customersSlice.reducer;
