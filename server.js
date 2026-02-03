const express = require("express"); const app = express(); app.get("/test-flow", (req, res) => res.send("Test flow works!")); app.listen(3000);
