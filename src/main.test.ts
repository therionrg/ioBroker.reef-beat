/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import sinon from "sinon";
import { ReefBeat } from "../src/main";
import { ReefAto } from "../src/reefAto";
import { ReefDose } from "../src/reefDose";
import { ReefMat } from "../src/reefMat";
import { ReefRun } from "../src/reefRun";

describe("ReefBeat Adapter", () => {
	let adapter: ReefBeat;
	let clearIntervalStub: sinon.SinonSpy;

	beforeEach(() => {
		clearIntervalStub = sinon.spy(global, "clearInterval");

		// Stubs für die Reef-Klassen
		sinon.stub(ReefMat.prototype, "pollBasicDataAsync").resolves();
		sinon.stub(ReefAto.prototype, "pollBasicDataAsync").resolves();
		sinon.stub(ReefRun.prototype, "pollBasicDataAsync").resolves();
		sinon.stub(ReefDose.prototype, "pollBasicDataAsync").resolves();

		adapter = new ReefBeat({
			name: "reef-beat",
			log: {
				info: sinon.spy(),
				debug: sinon.spy(),
				error: sinon.spy(),
				warn: sinon.spy(),
			} as any,
		} as any);

		(adapter as any).config = {
			ipReefMat: "192.168.1.10",
			ipReefAto: "192.168.1.11",
			ipReefRun: "192.168.1.12",
			ipReefDose: "192.168.1.13",
			localPollingInterval: 1,
		};
	});

	afterEach(() => {
		sinon.restore();
	});

	it("should initialize Reef devices in onReady", async () => {
		await (adapter as any).onReady();

		expect((adapter as any).reefMat).to.be.instanceOf(ReefMat);
		expect((adapter as any).reefAto).to.be.instanceOf(ReefAto);
		expect((adapter as any).reefRun).to.be.instanceOf(ReefRun);
		expect((adapter as any).reefDose).to.be.instanceOf(ReefDose);

		expect((adapter as any).intervalHandle).to.be.a("object");
		expect((adapter as any).log.info).to.have.been.calledWithMatch("Start polling");
	});

	it("should call pollBasicDataAsync on all reef devices", async () => {
		await (adapter as any).onReady();

		const reefMat = (adapter as any).reefMat as ReefMat;
		const reefAto = (adapter as any).reefAto as ReefAto;
		const reefRun = (adapter as any).reefRun as ReefRun;
		const reefDose = (adapter as any).reefDose as ReefDose;

		expect((reefMat.pollBasicDataAsync as sinon.SinonStub).calledOnce).to.be.true;
		expect((reefAto.pollBasicDataAsync as sinon.SinonStub).calledOnce).to.be.true;
		expect((reefRun.pollBasicDataAsync as sinon.SinonStub).calledOnce).to.be.true;
		expect((reefDose.pollBasicDataAsync as sinon.SinonStub).calledOnce).to.be.true;
	});

	it("should clear interval and log message on unload", () => {
		const callback = sinon.spy();
		(adapter as any).intervalHandle = setInterval(() => {}, 1000);

		(adapter as any).onUnload(callback);

		expect(clearIntervalStub.calledOnce).to.be.true;
		expect((adapter as any).log.debug).to.have.been.calledWith("Polling-Timer gestoppt");
		expect(callback.calledOnce).to.be.true;
	});

	it("should log state changes correctly", () => {
		const id = "reef.0.state";
		const state = { val: 123, ack: true };

		(adapter as any).onStateChange(id, state);
		expect((adapter as any).log.info).to.have.been.calledWith(
			`state ${id} changed: ${state.val} (ack = ${state.ack})`,
		);

		(adapter as any).onStateChange(id, null);
		expect((adapter as any).log.info).to.have.been.calledWith(`state ${id} deleted`);
	});
});
