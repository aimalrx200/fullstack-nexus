import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeConversationId: null,
  messages: [],
  isTyping: false,
  typingUserName: "",
  unreadCount: 0,
  isWidgetOpen: false,
};

export const supportChatSlice = createSlice({
  name: "supportChat",
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setChatMessages: (state, action) => {
      state.messages = action.payload;
    },
    appendChatMessage: (state, action) => {
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
        if (!state.isWidgetOpen && action.payload.senderType === "admin") {
          state.unreadCount += 1;
        }
      }
    },
    setTypingIndicator: (state, action) => {
      state.isTyping = action.payload.isTyping;
      state.typingUserName = action.payload.senderName || "";
    },
    setWidgetOpen: (state, action) => {
      state.isWidgetOpen = action.payload;
      if (action.payload) state.unreadCount = 0;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const {
  setActiveConversation,
  setChatMessages,
  appendChatMessage,
  setTypingIndicator,
  setWidgetOpen,
  resetUnreadCount,
} = supportChatSlice.actions;
export default supportChatSlice.reducer;
