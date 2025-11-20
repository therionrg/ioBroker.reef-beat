/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { IoBrokerHelper } from "./IoBrokerHelper";
import { ReefAto } from "./reefAto";
import { ReefCloud } from "./reefCloud";
import { ReefDose } from "./reefDose";
import { ReefMat } from "./reefMat";
import { ReefRun } from "./reefRun";

// Load your modules here, e.g.:
// import * as fs from "fs";

export class ReefBeat extends utils.Adapter {
	private intervalHandle?: NodeJS.Timeout;
	private cloudIntervalHandle?: NodeJS.Timeout;
	private reefMat!: ReefMat;
	private reefAto!: ReefAto;
	private reefRun!: ReefRun;
	private reefDose!: ReefDose;
	private helper: IoBrokerHelper;
	private reefCloud!: ReefCloud;

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
		this.helper = new IoBrokerHelper(this);
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		// Initialize your adapter here
		if (this.config.ipReefMat) this.reefMat = new ReefMat(this.config.ipReefMat, this, this.helper);
		if (this.config.ipReefAto) this.reefAto = new ReefAto(this.config.ipReefAto, this, this.helper);
		if (this.config.ipReefRun) this.reefRun = new ReefRun(this.config.ipReefRun, this, this.helper);
		if (this.config.ipReefDose) this.reefDose = new ReefDose(this.config.ipReefDose, this, this.helper);
		if (this.config.cloudUrl)
			this.reefCloud = new ReefCloud(
				this.config.cloudUrl,
				this,
				this.helper,
				this.config.cloudUsername,
				this.config.cloudPassword,
			);

		if (this.reefCloud) {
			await this.reefCloud.pollCloudAsync();

			this.cloudIntervalHandle = setInterval(
				async () => {
					await this.reefCloud.pollCloudAsync();
				},
				this.config.cloudPollingInterval * 60 * 1000,
			);
		}

		if (this.reefMat || this.reefAto || this.reefRun || this.reefDose) {
			await this.localPolling();
			this.intervalHandle = setInterval(
				async () => {
					await this.localPolling();
				},
				this.config.localPollingInterval * 60 * 1000,
			);
		}
	}

	private async localPolling(): Promise<void> {
		this.log.info("Start local polling...");

		if (this.reefMat) await this.reefMat.pollBasicDataAsync();
		if (this.reefAto) await this.reefAto.pollBasicDataAsync();
		if (this.reefRun) await this.reefRun.pollBasicDataAsync();
		if (this.reefDose) await this.reefDose.pollBasicDataAsync();
		this.log.info("Finished local polling...");
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
			if (this.cloudIntervalHandle) {
				clearInterval(this.cloudIntervalHandle);
				this.log.debug("Cloud-Polling-Timer gestoppt");
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
			const parts = id.split(".");
			const name = parts[2];
			const subName = parts[3];
			const refresh = id.split(".").pop();

			if (refresh === "_refresh") {
				if (name === this.reefCloud.constructor.name) {
					this.reefCloud.pollCloudAsync(subName);
				} else {
					if (this.reefMat && name === this.reefMat.constructor.name) {
						this.reefMat.pollBasicDataAsync(subName);
					}
					if (this.reefAto && name === this.reefAto.constructor.name) {
						this.reefAto.pollBasicDataAsync(subName);
					}
					if (this.reefRun && name === this.reefRun.constructor.name) {
						this.reefRun.pollBasicDataAsync(subName);
					}
					if (this.reefDose && name === this.reefDose.constructor.name) {
						this.reefDose.pollBasicDataAsync(subName);
					}
				}
			}
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
