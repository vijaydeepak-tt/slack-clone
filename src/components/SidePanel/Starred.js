import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../firebase";

import { setCurrentChannel, setPrivateChannel } from "../../store/actions";

class Starred extends React.Component {
  state = {
    starredChannels: [],
    activeChannel: "",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = (userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snap) => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel],
        });
      });

    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snap) => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(
          (channel) => channel.id !== channelToRemove.id
        );
        this.setState({
          starredChannels: filteredChannels,
        });
      });
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  displayChannels = (staredChannels) =>
    staredChannels.length > 0 &&
    staredChannels.map((channel) => (
      <Menu.Item
        key={channel.id}
        name={channel.name}
        onClick={() => this.changeChannel(channel)}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ));

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu>
        {/* Heading */}
        <Menu.Item>
          <span>
            <Icon name="star" />
          </span>{" "}
          STARRED ({starredChannels.length})
        </Menu.Item>
        {/* Stared Channels */}
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
