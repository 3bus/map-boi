// import averageDailyTraffic from "../geojson/TrafficService.json";
import fs from "fs"

let averageDailyTraffic = JSON.parse(fs.readFileSync("./geojson/TrafficService.json", "utf8"))

console.log(averageDailyTraffic.features.length)

let adts = ""
for (let i = 0;i<averageDailyTraffic.features.length;i++){
    let adtItem = averageDailyTraffic.features[i]["properties"];
    adts += adtItem["adt"] + ","+adtItem["start_name"] + ","+ adtItem["end_name"] + ","+"\n"
}

fs.writeFileSync("./tmp/adts.csv", adts)