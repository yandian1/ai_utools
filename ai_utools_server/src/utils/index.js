import {fileURLToPath} from "url";
import {dirname} from "path";

export function getDirname(url) {
    const __filename = fileURLToPath(url);
    return dirname(__filename);
}