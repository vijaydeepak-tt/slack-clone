import React from "react";
import mime from "mime-types";
import { Modal, Button, Input, Icon } from "semantic-ui-react";

class FileModal extends React.Component {
  state = {
    file: null,
    authorized: ["image/jpg", "image/png"],
  };

  addFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file });
    }
  };

  clearFile = () => this.setState({ file: null });

  isAuthorized = (fileName) => {
    return this.state.authorized.includes(mime.lookup(fileName));
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;

    if (file) {
      if (this.isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  };

  render() {
    const { modal, closeModal } = this.props;
    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            onChange={this.addFile}
            label={"File types: jpg, png"}
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button inverted color="green" onClick={this.sendFile}>
            <Icon name="checkmark" /> Send
          </Button>
          <Button inverted color="red" onClick={closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
