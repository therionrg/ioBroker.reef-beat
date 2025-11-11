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
	public async httpGetAsync(path: string, isCloud: boolean = false): Promise<any | null> {
		const url = isCloud ? path : this.baseUrl + "/" + path;

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
		this.adapter.log.debug("Calling " + url);
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

	protected async getDataAsync<T = any>(sourceName: string): Promise<T | null> {
		const result = await this.httpGetAsync(sourceName);
		this.adapter.log.debug(`Data from ${sourceName}: ${JSON.stringify(result)}`);

		return result;
	}

	protected async getAndSetDataAsync(sourceName: string): Promise<void> {
		const result = await this.getDataAsync(sourceName);
		this.json2iob.parse(this.constructor.name + "." + sourceName, result, { forceIndex: true });
		this.helper.ensureStateAsync(
			this.constructor.name + "." + sourceName + "._Refresh",
			"Refresh data",
			"boolean",
			"button",
			true,
			true,
		);
	}

	public async pollBasicDataAsync(): Promise<void> {
		const requests = this.localCapabilities.map(async (capability) => {
			this.getAndSetDataAsync(capability);
		});

		await Promise.all(requests);
	}

	public async getAquariumAsync(ip: string, username: string, password: string): Promise<void> {
		if (!this.token || Date.now() >= this.tokenExpires) {
			await this.connectAsync(ip, username, password);

			const result = await this.httpGetAsync("https://cloud.reef-beat.com/aquarium", true);
			this.adapter.log.info("Aquarium replay: " + JSON.stringify(result));
			this.json2iob.parse(this.constructor.name + ".aquariums", result, { forceIndex: true });
		}
	}

	public async pollCloudAsync(ip: string, username: string, password: string): Promise<void> {
		if (!this.token || Date.now() >= this.tokenExpires) {
			await this.connectAsync(ip, username, password);
		}

		const result = await this.httpGetAsync("https://cloud.reef-beat.com/reef-wave/library", true);
		const result2 = await this.httpGetAsync("https://cloud.reef-beat.com/device", true);
		const result3 = await this.httpGetAsync("https://cloud.reef-beat.com/aquarium", true);

		this.adapter.log.info("Cloud replay: " + JSON.stringify(result));
		this.adapter.log.info("Cloud replay: " + JSON.stringify(result2));
		this.adapter.log.info("Cloud replay: " + JSON.stringify(result3));
	}

	private async connectAsync(ip: string, username: string, password: string): Promise<string | null> {
		try {
			const url = `https://${ip}/oauth/token`;

			// Exakt derselbe Basic-Auth-Header wie im Python/C#-Code
			const headers = {
				Authorization: "Basic Z0ZqSHRKcGE6Qzlmb2d3cmpEV09SVDJHWQ==",
				"Content-Type": "application/x-www-form-urlencoded",
			};

			// URL-encoded payload
			const payload = new URLSearchParams({
				grant_type: "password",
				username,
				password,
			});

			const response = await fetch(url, {
				method: "POST",
				headers,
				body: payload.toString(),
			});

			this.adapter.log.info("HTTP Status:" + response.status);

			const text = await response.text();
			this.adapter.log.info("Response body:\n" + text);

			if (!response.ok) {
				this.adapter.log.error("Fehlerhafte Antwort vom Server.");
				return null;
			}

			// JSON parsen
			const json = JSON.parse(text);
			const token = json["access_token"];
			if (!token) {
				this.adapter.log.error("Kein access_token im Response.");
				return null;
			}

			const now = Date.now();
			this.token = json["access_token"];
			this.tokenExpires = now + json["expires_in"] * 1000; // timestamp in ms
			this.headers["Authorization"] = `Bearer ${this.token}`;

			this.adapter.log.info("Access Token:" + token);
			return token;
		} catch (err) {
			this.adapter.log.error("ConnectAsync Fehler:" + err);
			return null;
		}
	}
}
