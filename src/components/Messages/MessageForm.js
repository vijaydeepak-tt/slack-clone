import React from "react";
import { Segment, Button, Input } from "semantic-ui-react";
import { v4 as uuidV4 } from "uuid";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import firebase from "../../firebase";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

class MessageForm extends React.Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    uploadState: "",
    uploadTask: null,
    percentUploaded: 0,
    emojiPicker: false,
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = (emoji) => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  handleKeyDown = (event) => {
    if (event.ctrlKey && event.keyCode === 13) {
      this.sendMessage();
    }
    const { message, typingRef, channel, user } = this.state;

    if (message) {
      typingRef.child(channel.id).child(user.uid).set(user.displayName);
    } else {
      typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  createMessage = (fileUrl = null) => {
    const { user } = this.state;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      },
    };
    if (fileUrl) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, typingRef, user } = this.state;
    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
          typingRef.child(channel.id).child(user.uid).remove();
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

  getFilePath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  uploadFile = (file, metadata) => {
    const { channel, storageRef, errors } = this.state;
    const pathToUpload = channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getFilePath()}/${uuidV4()}.jpeg`;
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.props.isProgressBarVisible(percentUploaded);
            this.setState({ percentUploaded });
          },
          (err) => {
            console.error(err);
            this.setState({
              errors: errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadURL) => {
                this.sendFileMessage(downloadURL, ref, pathToUpload);
              })
              .catch((err) => {
                console.error(err);
                this.setState({
                  errors: errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({
          uploadState: "done",
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
          uploadState: "error",
          uploadTask: null,
        });
      });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker,
    } = this.state;
    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="apple"
            onSelect={this.handleAddEmoji}
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
          />
        )}
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7em" }}
          ref={(node) => (this.messageInputRef = node)}
          onChange={this.handleChange}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "Close" : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          value={message}
          onKeyDown={this.handleKeyDown}
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
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
            icon="cloud upload"
          />
        </Button.Group>
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
      </Segment>
    );
  }
}

export default MessageForm;
