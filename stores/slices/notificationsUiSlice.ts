import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface NotificationsUiState {
  readIds: string[];
  dismissedIds: string[];
}

const initialState: NotificationsUiState = {
  readIds: [],
  dismissedIds: [],
};

const notificationsUiSlice = createSlice({
  name: "notificationsUi",
  initialState,
  reducers: {
    markRead: (state, action: PayloadAction<string>) => {
      if (!state.readIds.includes(action.payload)) state.readIds.push(action.payload);
    },
    markAllRead: (state, action: PayloadAction<string[]>) => {
      state.readIds = Array.from(new Set([...state.readIds, ...action.payload]));
    },
    dismiss: (state, action: PayloadAction<string>) => {
      if (!state.dismissedIds.includes(action.payload)) state.dismissedIds.push(action.payload);
    },
  },
});

export const { markRead, markAllRead, dismiss } = notificationsUiSlice.actions;

interface RootStateWithNotificationsUi {
  notificationsUi: NotificationsUiState;
}

export const selectReadIds = (state: RootStateWithNotificationsUi) => state.notificationsUi.readIds;
export const selectDismissedIds = (state: RootStateWithNotificationsUi) => state.notificationsUi.dismissedIds;

export default notificationsUiSlice.reducer;
