import { ReefBeatApi } from "./reefBeatApi";
import { IReefBeat } from "./types";

export class ReefDose extends ReefBeatApi {
	constructor(ip: string, adapter: IReefBeat) {
		super(ip, false, adapter);
		// Neues Source-Objekt hinzufügen
		this.data.sources.push({
			name: "/configuration",
			type: "config",
			data: null,
		});
	}

	public async pushValuesAsync(): Promise<void> {
		const config = await this.getDataAsync("/configuration");

		const payload = {
			auto_fill: config?.auto_fill ?? false,
		};

		await this.httpSendAsync("/configuration", payload, "PUT");
	}
}
