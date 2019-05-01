const { Router } = require("express");
const moment = require("moment");
const router = new Router();
const request = require("../config/request");
const Promise = require("bluebird");
const _ = require("underscore");

const { TOKEN: token } = process.env;

router.get("/", (_req, res) =>
	res.status(200).json({ success: true, date: moment().valueOf(), message: "API is working" }),
);

router.get("/search", async (req, res) => {
	const now = moment();
	const outboundDate = now.add(7, "days");
	const inboundDate = outboundDate.add(5, "days");

	try {
		const flights = await request(token).post(`/search?time=${Date.now()}`, {
			tripType: "RT",
			from: "CNF",
			to: "BSB",
			outboundDate: outboundDate.format("YYYY-MM-DD"),
			inboundDate: inboundDate.format("YYYY-MM-DD"),
			cabin: "EC",
			adults: 2,
			children: 1,
			infants: 0,
		});

		const searchId = flights.id;

		if (!searchId) return res.end();

		const airlinesPromise = _.chain(flights.airlines)
			.filter(airline => airline.status.enable)
			.map(airline => request(token).get(`/search/${searchId}/flights?airline=${airline.label}`))
			.value();

		const airlines = await Promise.all(airlinesPromise);

		let outboundAirlines = _.chain(airlines)
			.map("outbound")
			.value();

		let inboundAirlines = _.chain(airlines)
			.map("inbound")
			.value();

		outboundAirlines = _.union(...outboundAirlines);
		inboundAirlines = _.union(...inboundAirlines);

		flights.airlines = _.map(flights.airlines, airline => {
			airline.outbound = _.filter(outboundAirlines, oFlights => oFlights.airline === airline.label);
			airline.inbound = _.filter(inboundAirlines, iFlights => iFlights.airline === airline.label);
			return airline;
		});

		return res.json({ flights });
	} catch (error) {
		const e = error.data || error;
		console.log("error:", e);
		return res.status(500).json({ error: e });
	}
});

module.exports = router;
