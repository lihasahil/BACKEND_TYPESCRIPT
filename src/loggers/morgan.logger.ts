import morgan from "morgan";
import fs from "fs";
import path from "path";

// Create a write stream for access.log
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "../../logs/access.log"),
  {
    flags: "a",
  }
);

// Export Morgan middleware that logs to:
// - console with 'dev' format
// - access.log with 'combined' format
const morganMiddleware = [
  morgan("dev"), // console
  morgan("combined", { stream: accessLogStream }), // file
];

export default morganMiddleware;
