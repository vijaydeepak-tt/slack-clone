import { combineReducers } from "redux";

import {
  SET_USER,
  CLEAR_USER,
  SET_CURRENT_CHANNEL,
  SET_PRIVATE_CHANNEL,
  SET_USER_POSTS,
} from "../actions/types";

const initialUserState = {
  currentUser: null,
  isLoading: true,
};

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        currentUser: action.payload.currentUser,
        isLoading: false,
      };
    case CLEAR_USER:
      return {
        ...initialUserState,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null,
};

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel,
      };
    case SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel,
      };
    case SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer,
});

export default rootReducer;
