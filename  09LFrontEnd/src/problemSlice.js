import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient'; // Assuming you have this utility

// Async Thunk to fetch all problems
export const fetchProblems = createAsyncThunk(
  'problems/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // UPDATED TO MATCH YOUR ROUTER:
      const response = await axiosClient.get('/problem/getAllProblems'); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch problems');
    }
  }
);

const problemSlice = createSlice({
  name: 'problems',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.isLoading = false;
        // The backend returns an array of problem objects
        state.items = action.payload; 
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default problemSlice.reducer;