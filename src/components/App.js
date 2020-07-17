import React from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";
import "./App.css";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts }) => {
  return (
    <Grid className="app" columns="equal" style={{ background: "#eee" }}>
      <ColorPanel />
      <SidePanel
        key={currentUser && currentUser.id}
        currentUser={currentUser}
      />
      <Grid.Column style={{ marginLeft: 260 }}>
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel
          currentChannel={currentChannel}
          key={currentChannel && currentChannel.id}
          isPrivateChannel={isPrivateChannel}
          userPosts={userPosts}
        />
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = ({ user, channel }) => ({
  currentUser: user.currentUser,
  currentChannel: channel.currentChannel,
  isPrivateChannel: channel.isPrivateChannel,
  userPosts: channel.userPosts,
});

export default connect(mapStateToProps)(App);
