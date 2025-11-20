import { IoBrokerHelper } from "./IoBrokerHelper";
import { ReefBeatApi } from "./reefBeatApi";
import { IReefBeat } from "./types";

export class ReefCloud extends ReefBeatApi {
	private username: string;
	private password: string;
	private refreshToken?: string;

	constructor(ip: string, adapter: IReefBeat, helper: IoBrokerHelper, username: string, password: string) {
		super(ip, false, adapter, helper);
		this.username = username;
		this.password = password;
		this.adapter.log.info("ReefCloud initialized.");
	}

	public async pollCloudAsync(sourceName: string): Promise<void> {
		if (!(await this.ensureTokenAsync())) {
			this.adapter.log.error("Cannot ensure valid token. Aborting pollCloudAsync.");
			return;
		}

		this.adapter.log.info("Start cloud polling for " + sourceName + "...");

		if (sourceName) {
			if (sourceName.endsWith("s")) {
				sourceName = sourceName.slice(0, -1);
			}

			this.getAndSetDataAsync(sourceName);
		} else {
			this.getAndSetDataAsync("aquarium");
			this.getAndSetDataAsync("device");
			this.getAndSetDataAsync("reef-wave/library");
		}

		this.adapter.log.info("Finished cloud polling...");
	}

	private async connectAsync(): Promise<boolean> {
		const payload = new URLSearchParams({
			grant_type: "password",
			username: this.username,
			password: this.password,
		});

		return await this.requestTokenAsync(payload);
	}

	private async refreshTokenAsync(): Promise<boolean> {
		if (!this.refreshToken) {
			this.adapter.log.warn("No refresh token available.");
			return false;
		}

		const payload = new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: this.refreshToken,
		});

		return await this.requestTokenAsync(payload);
	}

	private async requestTokenAsync(payload: URLSearchParams): Promise<boolean> {
		try {
			const url = `https://${this.ip}/oauth/token`;

			const headers = {
				Authorization: "Basic Z0ZqSHRKcGE6Qzlmb2d3cmpEV09SVDJHWQ==",
				"Content-Type": "application/x-www-form-urlencoded",
			};

			const response = await fetch(url, {
				method: "POST",
				headers,
				body: payload.toString(),
			});

			const text = await response.text();

			if (!response.ok) {
				this.adapter.log.error("Token Request failed:\n" + text);
				return false;
			}

			const json = JSON.parse(text);

			// Tokens speichern
			this.token = json["access_token"];
			this.tokenExpires = Date.now() + json["expires_in"] * 1000;

			if (json["refresh_token"]) {
				this.refreshToken = json["refresh_token"];
			}

			this.headers["Authorization"] = `Bearer ${this.token}`;
			this.adapter.log.info("Successfully received access token.");
			return true;
		} catch (err) {
			this.adapter.log.error("Token Request Error:" + err);
			return false;
		}
	}

	private async ensureTokenAsync(): Promise<boolean> {
		const now = Date.now();
		if (this.token) {
			if (this.token && now < this.tokenExpires - 30000) {
				return true;
			}

			if (this.refreshToken) {
				const ok = await this.refreshTokenAsync();
				if (ok) return true;

				this.adapter.log.warn("Refresh token expired or invalid.");
			}
		}

		if (!(await this.connectAsync())) {
			this.adapter.log.error("New authetification failed. Check username and/or password.");
			return false;
		}

		return true;
	}
}
