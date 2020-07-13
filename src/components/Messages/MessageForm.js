import React from "react";
import { Segment, Button, Input } from "semantic-ui-react";

import firebase from "../../firebase";

class MessageForm extends React.Component {
  state = {
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  createMessage = () => {
    const { user } = this.state;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      content: this.state.message,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      },
    };
    return message;
  };

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;
    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" }),
      });
    }
  };

  handleInputError = (errors, inputName) => {
    return errors.some((err) => err.message.toLowerCase().includes(inputName))
      ? "error"
      : "";
  };

  render() {
    const { errors, message, loading } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7em" }}
          onChange={this.handleChange}
          label={<Button icon="add" />}
          labelPosition="left"
          value={message}
          placeholder="Write yout message"
          className={this.handleInputError(errors, "message")}
        />
        <Button.Group icon widths={2}>
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            onClick={this.sendMessage}
            disabled={loading}
            icon="edit"
          />
          <Button
            color="teal"
            content="Upload media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;
