import axios from "axios";
import { IReefBeat } from "./types";

interface ReefBeatData {
	sources: Source[];
	local?: any;
}

interface Source {
	name: string;
	type: "device-info" | "config" | "data" | "preview";
	data: any;
}

export class ReefBeatApi {
	protected adapter: IReefBeat;
	protected ip: string;
	protected baseUrl: string;
	protected secure: boolean;
	public data: ReefBeatData;
	protected headers: { [key: string]: string } = {};

	constructor(ip: string, secure: boolean = false, adapter: IReefBeat) {
		this.ip = ip;
		this.secure = secure;
		this.baseUrl = (secure ? "https://" : "http://") + ip;
		this.adapter = adapter;

		this.data = {
			sources: [
				{ name: "/device-info", type: "device-info", data: null },
				{ name: "/firmware", type: "device-info", data: null },
				{ name: "/mode", type: "config", data: null },
				{ name: "/cloud", type: "config", data: null },
				{ name: "/wifi", type: "data", data: null },
				{ name: "/dashboard", type: "data", data: null },
			],
		};
	}

	// GET Request
	public async httpGetAsync(path: string): Promise<any | null> {
		const url = this.baseUrl + path;
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

	// POST/PUT Request (verwendet axios)
	protected async httpSendAsync(path: string, payload: any, method: "POST" | "PUT"): Promise<boolean> {
		const url = this.baseUrl + path;
		try {
			this.adapter.log.debug(`${method} ${url} Payload: ${JSON.stringify(payload)}`);

			await axios({
				method: method,
				url: url,
				headers: {
					...this.headers,
					"Content-Type": "application/json",
				},
				data: payload,
			});

			return true;
		} catch (ex: any) {
			const status = ex.response ? ex.response.status : "N/A";
			this.adapter.log.error(`${method} ${path} failed (Status: ${status}): ${ex.message}`);
			return false;
		}
	}

	public async getDataAsync<T = any>(sourceName: string): Promise<T | null> {
		const source = this.data.sources.find((s) => s.name === sourceName);
		if (!source) return null;

		const result = await this.httpGetAsync(sourceName);
		this.adapter.log.info(`Data from ${sourceName}: ${JSON.stringify(result)}`);
		if (result) source.data = result;

		return source.data as T;
	}

	public async fetchAllDataAsync(): Promise<void> {
		for (const source of this.data.sources) {
			await this.getDataAsync(source.name);
		}
	}
}
