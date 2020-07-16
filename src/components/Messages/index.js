import React from "react";
import { Segment, Comment } from "semantic-ui-react";

import firebase from "../../firebase";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    progressBar: false,
  };

  componentDidMount() {
    const { channel, user } = this.state;
    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = (channelId) => {
    const { messagesRef } = this.state;
    const loadMessages = [];
    messagesRef.child(channelId).on("child_added", (snap) => {
      loadMessages.push(snap.val());
      this.setState({ messages: loadMessages, messagesLoading: false });
    });
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

  render() {
    const { messagesRef, channel, user, messages, progressBar } = this.state;
    return (
      <>
        <MessagesHeader currentChannel={channel} />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}
          >
            {/* Messages */}
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </>
    );
  }
}

export default Messages;
