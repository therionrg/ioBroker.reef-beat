import { ReefBeatApi } from "./reefBeatApi";
import { IReefBeat } from "./types";

export class ReefMat extends ReefBeatApi {
	private readonly MAT_MIN_ROLL_DIAMETER = 50.0;
	private readonly MAT_MAX_ROLL_DIAMETERS: { [key: string]: number } = {
		modelA: 200.0,
		modelB: 180.0,
	};
	private readonly MAT_ROLL_THICKNESS = 5.0;

	constructor(ip: string, adapter: IReefBeat) {
		super(ip, false, adapter);

		if (!this.data.sources.some((s) => s.name === "/configuration")) {
			this.data.sources.push({ name: "/configuration", type: "config", data: null });
		}
		this.data.local = { started_roll_diameter: this.MAT_MIN_ROLL_DIAMETER };
		this.localCapabilities.push("configuration");
	}

	public async newRollAsync(): Promise<void> {
		const config = await this.getDataAsync("/configuration");
		const model = config?.model || "modelA";
		let diameter = this.data.local.started_roll_diameter;

		let name: string;
		let isPartial: boolean;

		if (diameter === this.MAT_MIN_ROLL_DIAMETER) {
			name = "New Roll";
			isPartial = false;
			diameter = this.MAT_MAX_ROLL_DIAMETERS[model] || this.MAT_MAX_ROLL_DIAMETERS["modelA"];
		} else {
			name = "Started Roll";
			isPartial = true;
		}

		const payload = {
			external_diameter: diameter,
			name: name,
			thickness: this.MAT_ROLL_THICKNESS,
			is_partial: isPartial,
		};

		const success = await this.httpSendAsync("/new-roll", payload, "POST");
		if (success) {
			this.adapter.log.info(`ReefMat: Befehl 'New Roll' erfolgreich an ${this.ip} gesendet.`);
		} else {
			this.adapter.log.error(`ReefMat: Befehl 'New Roll' fehlgeschlagen.`);
		}
	}
}
