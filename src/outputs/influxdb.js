import { exec } from "node:child_process";

import { getConnection } from "../util/connections.js";
import Output from "../util/generic-output.js";

export default class InfluxDB extends Output {
  constructor(config, task) {
    super(config, task);
  }

  async register() {
    if (!this.config.disabled && !this.task.disabled) {
      return this.enable();
    }
  }

  async enable() {
    this.influxdb = getConnection(this.name);
    this.enabled = true;
  }

  async disable() {
    this.enabled = false;
  }

  async send({ event, labels }) {
    const measurementName = this.config.measurement;
    let data = [],
      labelsArray = [],
      labelsString = "";

    for (const [key, value] of Object.entries(event)) {
      if (key !== "metadata") {
        data.push(`${key}=${value}`);
      } else {
        labelsArray.push(`${key}=${value}`);
      }
    }

    labelsString = labelsArray.join(",");
    if (labelsString.length) labelsString = `,${labelsString}`;
    data = data.join(",");

    let line = `${measurementName}${labelsString} ${data} ${new Date().valueOf()}`;
    const { url, organization, bucket, precision, token } =
      this.influxdb.config;
    let command = `curl --request POST \
--header "Authorization: Token ${token}" \
--header "Content-Type: text/plain; charset=utf-8" \
--header "Accept: application/json" \
--data-binary "${line}" \
"${url}?org=${organization}&bucket=${bucket}&precision=${precision}"`;
    console.log(`Running command: ${command}`);
    // const result = exec(command);
    // console.log(`Result: ${result}`);
  }
}

/*
{
  "type": "output:mqtt:personal-mqtt",
  "disabled": false,
  "topic": "data/weather/${state.location}"
}
*/
