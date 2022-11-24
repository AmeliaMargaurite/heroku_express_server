const listLocations = [
	{ name: "IND_Amsterdam", key: "AM" },
	{ name: "IND_Den_Haag", key: "DH" },
	{ name: "IND_Zwolle", key: "ZW" },
	{ name: "IND_Den_Bosch", key: "DB" },
	{ name: "IND_Haarlem", key: "6b425ff9f87de136a36b813cccf26e23" },
	{ name: "Expat_Groningen", key: "0c127eb6d9fe1ced413d2112305e75f6" },
	{ name: "Expat_Maastricht", key: "6c5280823686521552efe85094e607cf" },
	{ name: "Expat_Wageningen", key: "b084907207cfeea941cd9698821fd894" },
	{ name: "Expat_Eindhoven", key: "0588ef4088c08f53294eb60bab55c81e" },
	{ name: "Expat_Den_Haag", key: "5e325f444aeb56bb0270a61b4a0403eb" },
	{ name: "Expat_Rotterdam", key: "f0ef3c8f0973875936329d713a68c5f3" },
	{ name: "Expat_Enschede", key: "3535aca0fb9a2e8e8015f768fb3fa69d" },
	{ name: "Expat_Utrecht", key: "fa24ccf0acbc76a7793765937eaee440" },
	{ name: "Expat_Amsterdam", key: "284b189314071dcd571df5bb262a31db" },
];

const apis = ["BIO", "DOC", "VAA", "TKV"];

const express = require("express");
const request = require("request");

const app = express();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

app.get("/:api/:location/:persons", (req, res) => {
	const location = listLocations.find(
		(location) => location.name === req.params.location
	);
	const persons = req.params.persons;
	const api = req.params.api;

	if (!location) {
		return res.status(500).json({ type: "error", message: "location" });
	}

	if (!persons) {
		return res.status(500).json({ type: "error", message: "persons" });
	}

	if (!apis.includes(api)) {
		return res.status(500).json({ type: "error", message: "api" });
	}

	if (location && persons && api) {
		request(
			{
				url: `https://oap.ind.nl/oap/api/desks/${location.key}/slots/?productKey=${api}&persons=${persons}`,
			},
			(error, response, body) => {
				if (error) {
					return res
						.status(500)
						.json({ type: "error", message: error.message });
				} else if (response.statusCode !== 200) {
					console.log(response);
					return res
						.status(500)
						.json({ type: "error", message: "Connection error" });
				}

				let respStart = "{";
				console.log(
					`Request received: API - ${api}, Location - ${location.name}, Persons - ${persons}`
				);
				const parts = response.body.split(')]}\',\n{"status":"OK",');
				res.json(JSON.parse((respStart += parts[1])).data);
			}
		);
	} else {
		return res
			.status(500)
			.json({ type: "error", message: "Missing parameters" });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on " + PORT));
