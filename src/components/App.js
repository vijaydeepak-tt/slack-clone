import React from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";
import "./App.css";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";

const App = ({
  currentUser,
  currentChannel,
  isPrivateChannel,
  userPosts,
  primaryColor,
  secondaryColor,
}) => {
  return (
    <Grid
      className="app"
      columns="equal"
      style={{ background: secondaryColor }}
    >
      <ColorPanel
        key={currentUser && currentUser.id}
        currentUser={currentUser}
      />
      <SidePanel
        key={currentUser && currentUser.id}
        currentUser={currentUser}
        primaryColor={primaryColor}
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

const mapStateToProps = ({ user, channel, colors }) => ({
  currentUser: user.currentUser,
  currentChannel: channel.currentChannel,
  isPrivateChannel: channel.isPrivateChannel,
  userPosts: channel.userPosts,
  primaryColor: colors.primaryColor,
  secondaryColor: colors.secondaryColor,
});

export default connect(mapStateToProps)(App);
