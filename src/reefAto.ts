import { IoBrokerHelper } from "./IoBrokerHelper";
import { ReefBeatApi } from "./reefBeatApi";
import { IReefBeat } from "./types";

export class ReefAto extends ReefBeatApi {
	constructor(ip: string, adapter: IReefBeat, helper: IoBrokerHelper) {
		super(ip, false, adapter, helper);

		this.localCapabilities.push("configuration");
	}

	public async pushValuesAsync(): Promise<void> {
		const config = await this.getDataAsync("/configuration");

		const payload = {
			auto_fill: config?.auto_fill ?? false,
		};

		await this.httpSendAsync("/configuration", payload, "PUT");
	}
}
