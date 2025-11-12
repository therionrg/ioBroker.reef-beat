import { IoBrokerHelper } from "./IoBrokerHelper";
import { ReefBeatApi } from "./reefBeatApi";
import { IReefBeat } from "./types";

export class ReefCloud extends ReefBeatApi {
	private username: string;
	private password: string;

	constructor(ip: string, adapter: IReefBeat, helper: IoBrokerHelper, username: string, password: string) {
		super(ip, false, adapter, helper);
		this.username = username;
		this.password = password;
	}

	public async pollCloudAsync(): Promise<void> {
		if (!this.token || Date.now() >= this.tokenExpires) {
			await this.connectAsync();
		}

		this.getAndSetDataAsync("aquarium");
		this.getAndSetDataAsync("device");
		this.getAndSetDataAsync("reef-wave/library");
	}

	private async connectAsync(): Promise<string | null> {
		try {
			const url = `https://${this.ip}/oauth/token`;

			// Exakt derselbe Basic-Auth-Header wie im Python/C#-Code
			const headers = {
				Authorization: "Basic Z0ZqSHRKcGE6Qzlmb2d3cmpEV09SVDJHWQ==",
				"Content-Type": "application/x-www-form-urlencoded",
			};

			// URL-encoded payload
			const payload = new URLSearchParams({
				grant_type: "password",
				username: this.username,
				password: this.password,
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
