import { configureStore } from "@reduxjs/toolkit"; 
import authReducer from "../authSlice";
import problemReducer from "../problemSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
   problems: problemReducer,
  }, 
});

export default store;