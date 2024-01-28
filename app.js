const path = require("path");
const express = require("express");
const { connectDb } = require("./config/db");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const {
  formatDate,
  truncate,
  stripTags,
  editIcon,
  select,
} = require("./helper/hbs");
require("dotenv").config({ path: "./config/config.env" });

const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
connectDb();

if (process.env.NODE_ENV === "development") {
  morgan("dev");
}

require("./config/passport")(passport);

app.use(express.static(path.join(__dirname, "public")));
app.engine(
  ".hbs",
  exphbs.engine({
    helpers: { formatDate, truncate, stripTags, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
app.use(express.json());
// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
