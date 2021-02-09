import RenderApp from "./index.jsx";
import Logger from "js-logger";
import { loadProgressBar } from "axios-progress-bar";
import * as serviceWorker from "./serviceWorker";

const rootElement = "root";

Logger.useDefaults({ logLevel: Logger.DEBUG });
Logger.debug("Configured logger!", { logLevel: Logger.getLevel() });

loadProgressBar({ showSpinner: true, parent: `#${rootElement}` });

RenderApp(rootElement);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
