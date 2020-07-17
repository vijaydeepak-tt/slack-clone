import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import { setCurrentChannel, setPrivateChannel } from "../../store/actions";

class Starred extends React.Component {
  state = {
    staredChannels: [],
    activeChannel: "",
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
    const { staredChannels } = this.state;
    return (
      <Menu.Menu>
        {/* Heading */}
        <Menu.Item>
          <span>
            <Icon name="star" />
          </span>{" "}
          STARRED ({staredChannels.length})
        </Menu.Item>
        {/* Stared Channels */}
        {this.displayChannels(staredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
