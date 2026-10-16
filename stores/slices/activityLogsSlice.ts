import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { activityLogs } from "@/lib/dummy-data/activityLogs";
import type { ActivityLog } from "@/types/activityLog";

export interface ActivityLogsState {
  logs: ActivityLog[];
}

const initialState: ActivityLogsState = { logs: activityLogs };

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export type NewActivityLog = Omit<ActivityLog, "id" | "dateTime">;

const activityLogsSlice = createSlice({
  name: "activityLogs",
  initialState,
  reducers: {
    addActivityLog: {
      prepare: (input: NewActivityLog) => ({
        payload: { id: nextId("act"), dateTime: new Date().toISOString(), ...input },
      }),
      reducer: (state, action: PayloadAction<ActivityLog>) => {
        state.logs.unshift(action.payload);
      },
    },
  },
});

export const { addActivityLog } = activityLogsSlice.actions;

interface RootStateWithActivityLogs {
  activityLogs: ActivityLogsState;
}

export const selectActivityLogs = (state: RootStateWithActivityLogs) => state.activityLogs.logs;
export const selectActivityLogById = (state: RootStateWithActivityLogs, id: string) =>
  state.activityLogs.logs.find((log) => log.id === id);

export default activityLogsSlice.reducer;
