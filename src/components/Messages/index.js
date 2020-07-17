import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../firebase";
import { setUserPosts } from "../../store/actions";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    progressBar: false,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResult: [],
    privateChannel: this.props.isPrivateChannel,
    isChannelStared: false,
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    const { channel, user } = this.state;
    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStartListener(channel.id, user.uid);
    }
  }

  addListeners = (channelId) => {
    const loadMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", (snap) => {
      loadMessages.push(snap.val());
      this.setState({ messages: loadMessages, messagesLoading: false });
      this.countUniqueUsers(loadMessages);
      this.countUserPosts(loadMessages);
    });
  };

  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  addUserStartListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("value", (data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStared: prevStarred });
        }
      });
  };

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  displayMessages = (messages) => {
    return (
      messages.length > 0 &&
      messages.map((message) => (
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      ))
    );
  };

  isProgressBarVisible = (progress) => {
    if (progress > 0) {
      this.setState({ progressBar: true });
    } else {
      this.setState({ progressBar: false });
    }
  };

  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value, searchLoading: true }, () =>
      this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResult = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResult });
    setTimeout(() => {
      this.setState({ searchLoading: false });
    }, 1000);
  };

  getMessagesRef = () => {
    const { messagesRef, privateChannel, privateMessagesRef } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleStar = () => {
    this.setState(
      (prevState) => {
        prevState.isChannelStared = !prevState.isChannelStared;
        return prevState;
      },
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStared) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar,
          },
        },
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  render() {
    const {
      messagesRef,
      channel,
      user,
      messages,
      progressBar,
      numUniqueUsers,
      searchTerm,
      searchResult,
      searchLoading,
      privateChannel,
      isChannelStared,
    } = this.state;
    return (
      <>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStared={isChannelStared}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}
          >
            {/* Messages */}
            {searchTerm
              ? this.displayMessages(searchResult)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
