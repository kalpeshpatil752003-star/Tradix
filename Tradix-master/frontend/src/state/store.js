import { configureStore, combineReducers, isRejectedWithValue } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import globalSliceReducer from "state/index.js";
import api from "state/api";
import authSliceReducer from './api/auth/authSlice';
import accountSliceReducer from './api/accounts/accountSlice';
import { Toast } from 'components/common/alerts';

// ✅ Only persist auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'accessToken']
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  global: globalSliceReducer,
  auth: persistReducer(authPersistConfig, authSliceReducer),
  account: accountSliceReducer
});

const errorsMiddleware = (dispatch) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload } = action;
    payload.data != null
      ? Toast.error(payload.data.message)
      : Toast.error('Oops looks like Something went wrong Internal Server Error!!!');
  }
  return next(action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ Required to avoid redux-persist warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(api.middleware).concat(errorsMiddleware)
});

export const persistor = persistStore(store);