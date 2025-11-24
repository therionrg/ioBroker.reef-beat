import axios from "axios";
import json2iob from "json2iob";
import { IoBrokerHelper } from "./IoBrokerHelper";
import { IReefBeat } from "./types";

export class ReefBeatApi {
	protected adapter: IReefBeat;
	protected ip: string;
	protected baseUrl: string;
	protected secure: boolean;
	protected localCapabilities: string[];
	protected headers: { [key: string]: string } = {};
	protected json2iob: json2iob;
	protected token!: string;
	protected tokenExpires: number = 0;
	protected helper: IoBrokerHelper;
	public aquariumSource: string = "aquarium";

	constructor(ip: string, secure: boolean = false, adapter: IReefBeat, helper: IoBrokerHelper) {
		this.ip = ip;
		this.secure = secure;
		this.baseUrl = (secure ? "https://" : "http://") + ip;
		this.adapter = adapter;
		this.json2iob = new json2iob(adapter);
		this.localCapabilities = ["device-info", "mode", "dashboard"];
		this.helper = helper;
	}

	// GET Request
	public async httpGetAsync(path: string): Promise<any | null> {
		const url = this.baseUrl + "/" + path;

		try {
			this.adapter.log.info(`GET ${url}`);

			// axios verwendet 'data' für den Response-Body
			const resp = await axios.get(url, { headers: this.headers });
			return resp.data;
		} catch (ex: any) {
			const status = ex.response ? ex.response.status : "N/A";
			this.adapter.log.error(`GET ${path} failed (Status: ${status}): ${ex.message}`);
			return null;
		}
	}

	// PPOST or PUT request
	protected async httpSendAsync(path: string, payload: any, method: "POST" | "PUT"): Promise<boolean> {
		const url = this.baseUrl + path;
		this.adapter.log.debug("Calling " + url);
		try {
			this.adapter.log.debug(`${method} ${url} Payload: ${JSON.stringify(payload)}`);

			const response = await axios({
				method: method,
				url: url,
				headers: {
					...this.headers,
					"Content-Type": "application/json",
				},
				data: undefined,
			});

			if (response.status === 200) {
				return true;
			} else {
				const text = response.statusText;
				this.adapter.log.info("Error calling: " + text);
				return false;
			}
		} catch (ex: any) {
			const status = ex.response ? ex.response.status : "N/A";
			this.adapter.log.error(`${method} ${path} failed (Status: ${status}): ${ex.message}`);
			return false;
		}
	}

	protected async getDataAsync<T = any>(sourceName: string): Promise<T | null> {
		const result = await this.httpGetAsync(sourceName);
		this.adapter.log.debug(`Data from ${sourceName}: ${JSON.stringify(result)}`);

		return result;
	}

	private async applyFeedMaintMode(baseDataPoint: string): Promise<void> {
		this.helper.ensureStateAsync(baseDataPoint + ".feedMode", "Feed Mode", "boolean", "switch", true, true);
		this.helper.ensureStateAsync(baseDataPoint + ".maintMode", "Maintenance Mode", "boolean", "switch", true, true);
	}

	protected async getAndSetDataAsync(sourceName: string): Promise<void> {
		const result = await this.getDataAsync(sourceName);

		const count = result?.length ?? 0;

		if (this.constructor.name != "ReefCloud") {
			const prefix = `${this.constructor.name}.${sourceName}`;
			this.json2iob.parse(prefix, result, { forceIndex: true });
			this.helper.ensureStateAsync(
				this.constructor.name + "." + sourceName + "._refresh",
				"Refresh data",
				"boolean",
				"button",
				true,
				true,
			);
			if (sourceName === "aquarium") this.applyFeedMaintMode(prefix);
		} else {
			result.forEach((entry: any, counter: number) => {
				const key = entry.model?.trim() || counter + 1;
				const prefix = `${this.constructor.name}.${sourceName}${count === 1 ? "" : "s." + key}`;
				this.json2iob.parse(prefix, entry, { forceIndex: true });
				this.helper.ensureStateAsync(
					this.constructor.name + "." + sourceName + (count === 1 ? "" : "s") + "._refresh",
					"Refresh data",
					"boolean",
					"button",
					true,
					true,
				);
				if (sourceName === "aquarium") this.applyFeedMaintMode(prefix);
			});
		}
	}

	public async pollBasicDataAsync(sourceName?: string): Promise<void> {
		if (sourceName) {
			await this.getAndSetDataAsync(sourceName);
		} else {
			const requests = this.localCapabilities.map(async (capability) => {
				this.getAndSetDataAsync(capability);
			});

			await Promise.all(requests);
		}
	}
}
