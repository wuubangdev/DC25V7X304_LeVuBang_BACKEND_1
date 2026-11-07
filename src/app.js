const express = require("express");
const cors = require("cors");
const contactsRouter = require("./routes/contact.route");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();
app.set("json spaces", 2);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to contact book application." });
});
app.use("/api/contacts", contactsRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
