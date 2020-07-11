import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

export const Spinner = () => (
  <Dimmer active>
    <Loader size="large" content="Preparing Chat..." />
  </Dimmer>
);
