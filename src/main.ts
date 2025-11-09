/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { ReefAto } from "./reefAto";
import { ReefDose } from "./reefDose";
import { ReefMat } from "./reefMat";
import { ReefRun } from "./reefRun";

// Load your modules here, e.g.:
// import * as fs from "fs";

export class ReefBeat extends utils.Adapter {
	private intervalHandle?: NodeJS.Timeout;
	private reefMat!: ReefMat;
	private reefAto!: ReefAto;
	private reefRun!: ReefRun;
	private reefDose!: ReefDose;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "reef-beat",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here
		this.reefMat = new ReefMat(this.config.ipReefMat, this);
		this.reefAto = new ReefAto(this.config.ipReefAto, this);
		this.reefRun = new ReefRun(this.config.ipReefRun, this);
		this.reefDose = new ReefDose(this.config.ipReefDose, this);

		await this.startPolling();

		this.intervalHandle = setInterval(
			async () => {
				await this.startPolling();
			},
			this.config.localPollingInterval * 60 * 1000,
		);
	}

	private async startPolling(): Promise<void> {
		this.log.info("Start polling...");

		await this.reefMat.pollBasicDataAsync();
		await this.reefAto.pollBasicDataAsync();
		await this.reefRun.pollBasicDataAsync();
		await this.reefDose.pollBasicDataAsync();
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			if (this.intervalHandle) {
				clearInterval(this.intervalHandle);
				this.log.debug("Polling-Timer gestoppt");
			}

			callback();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			callback();
		}
	}
	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new ReefBeat(options);
} else {
	// otherwise start the instance directly
	(() => new ReefBeat())();
}
