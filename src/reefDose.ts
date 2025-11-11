import { IoBrokerHelper } from "./IoBrokerHelper";
import { ReefBeatApi } from "./reefBeatApi";
import { IReefBeat } from "./types";

export class ReefDose extends ReefBeatApi {
	constructor(ip: string, adapter: IReefBeat, helper: IoBrokerHelper) {
		super(ip, false, adapter, helper);

		this.localCapabilities.push("head/1/settings");
		this.localCapabilities.push("head/2/settings");
		this.localCapabilities.push("head/3/settings");
		this.localCapabilities.push("head/4/settings");
	}

	public async pushValuesAsync(): Promise<void> {
		const config = await this.getDataAsync("/configuration");

		const payload = {
			auto_fill: config?.auto_fill ?? false,
		};

		await this.httpSendAsync("/configuration", payload, "PUT");
	}
}
