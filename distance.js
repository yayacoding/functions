
//-- Define radius function
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

//-- Define degrees function
if (typeof (Number.prototype.toDeg) === "undefined") {
    Number.prototype.toDeg = function () {
        return this * (180 / Math.PI);
    }
}

//-- Define middle point function
const middlePoint = async (lat1,lng1,lat2,lng2, ) => {
    console.log("🚀 ~ file: helper.js ~ line 253 ~ middlePoint ~ lng1", lng1,lat1,lng2, lat2)
    
    //-- Longitude difference
    var dLng = (lng2 - lng1).toRad();

    //-- Convert to radians
    lat1 = Number(lat1).toRad();
    lat2 = Number(lat2).toRad();
    lng1 = Number(lng1).toRad();

    var bX = Math.cos(lat2) * Math.cos(dLng);
    var bY = Math.cos(lat2) * Math.sin(dLng);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
    var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);
    console.log("🚀 ~ file: helper.js ~ line 249 ~ middlePoint ~ lng3",lat3, lng3)

    //-- Return result
    return [lng3.toDeg(), lat3.toDeg()];
}
//get distance between to lat long in givrn UNTI
const getDistanceINKM = (lat1, lon1, lat2, lon2, unit) => {
    console.log("🚀 ~ file: helper.js ~ line 290 ~ getDistanceINKM ~ lat1", lat1, lon1, lat2, lon2, unit)
    
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        console.log("🚀 ~ file: helper.js ~ line 306 ~ getDistanceINKM ~ dist", dist)

        return dist;
    }

}
