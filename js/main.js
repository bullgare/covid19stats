const titleConfirmed = "Confirmed",
    titleConfirmedNew = "Confirmed, new",
    titleDeaths = "Deaths",
    titleDeathsNew = "Deaths, new",
    titleRationDeathsConfirmed = "Deaths / Confirmed",
    titleRationNewTotalConfirmed = "New / Total Confirmed",
    titleRationNewTotalDeaths = "New / Total Deaths";

const allTitles = [titleConfirmed,
    titleConfirmedNew,
    titleDeaths,
    titleDeathsNew,
    titleRationDeathsConfirmed,
    titleRationNewTotalConfirmed,
    titleRationNewTotalDeaths];

(function main() {
    const region = "European Region",
        // country = "Russian Federation";
        country = "Germany";
    const {elementCheckboxes, state: stateFilters} = generateCheckboxes(allTitles, function (title) {
        onStateChange(region, country, stateFilters, stateLocations);
    });
    const {elementLocations, state: stateLocations} = generateLocationSelectors(data, function (title) {
        onStateChange(region, country, stateFilters, stateLocations);
        elementFilters2.innerHTML = "";
        elementFilters2.appendChild(elementLocations);
    });

    elementFilters.appendChild(elementCheckboxes);
    elementFilters2.appendChild(elementLocations);

    onStateChange(region, country, stateFilters, stateLocations);
}());

function onStateChange(region, country, stateFilters, stateLocations) {
    const valuesByType = generateValuesFor(stateLocations, stateFilters);
    const plots = generatePlotsBy(valuesByType);
    draw(plots);
}

function generateValuesFor(stateLocations, stateFilters) {
    const {region, country} = stateLocations;

    let valuesByType = {
        [titleConfirmed]: {},
        [titleConfirmedNew]: {},
        [titleDeaths]: {},
        [titleDeathsNew]: {},
        [titleRationDeathsConfirmed]: {},
        [titleRationNewTotalConfirmed]: {},
        [titleRationNewTotalDeaths]: {}
    };

    for (let k of Object.keys(data)) {
        const date = k;
        const v = data[k];
        let value = null;
        if (v.regions && v.regions[region] && v.regions[region][country]) {
            value = v.regions[region][country]
        }

        const confirmed = value ? value[0] : null;
        const confirmedNew = value ? value[1] : null;
        const deaths = value ? value[2] : null;
        const deathsNew = value ? value[3] : null;
        const deathsToConfirmedRatio = ratio(deaths, confirmed);
        const newToConfirmedRatio = ratio(confirmedNew, confirmed);
        const newToTotalDeathsRatio = ratio(deathsNew, deaths);

        if (stateFilters[titleConfirmed]) {
            valuesByType[titleConfirmed][date] = confirmed;
        }
        if (stateFilters[titleConfirmedNew]) {
            valuesByType[titleConfirmedNew][date] = confirmedNew;
        }
        if (stateFilters[titleDeaths]) {
            valuesByType[titleDeaths][date] = deaths;
        }
        if (stateFilters[titleDeathsNew]) {
            valuesByType[titleDeathsNew][date] = deathsNew;
        }
        if (stateFilters[titleRationDeathsConfirmed]) {
            valuesByType[titleRationDeathsConfirmed][date] = deathsToConfirmedRatio;
        }
        if (stateFilters[titleRationNewTotalConfirmed]) {
            valuesByType[titleRationNewTotalConfirmed][date] = newToConfirmedRatio;
        }
        if (stateFilters[titleRationNewTotalDeaths]) {
            valuesByType[titleRationNewTotalDeaths][date] = newToTotalDeathsRatio;
        }
    }

    return valuesByType;
}

function ratio(val, total) {
    if (val === null || total === null) {
        return null;
    }
    if (total === 0) {
        return 0
    }
    return 100 * val / total;
}

function generatePlotsBy(valuesByType) {
    let plots = [];

    for (let k of Object.keys(valuesByType)) {
        let data = valuesByType[k];
        let plotData = {
            "x": [],
            "y": [],
            "name": k
        };

        for (let date of Object.keys(data)) {
            plotData.x.push(date);
            plotData.y.push(data[date]);
        }

        plots.push(plotData);
    }

    return plots;
}

function draw(plots) {
    Plotly.newPlot(elementPlot, plots, {
        margin: {t: 0}
    });
}

function generateCheckboxes(allTitles, cb) {
    const parentElem = document.createElement("div");
    const state = {};
    for (let title of allTitles) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        state[title] = true;
        checkbox.addEventListener("change", function () {
            state[title] = checkbox.checked;
            console.log(title);
            cb(title);
        });
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + title));
        parentElem.appendChild(label);
        parentElem.appendChild(document.createElement("br"));
    }

    return {elementCheckboxes: parentElem, state: state};
}

function generateLocationSelectors(data, cb) {
    const parentElem = document.createElement("div");
    const state = {
        region: "",
        country: ""
    };
    const countriesByRegion = {};

    let dataAsArray = Object.values(data);
    if (!dataAsArray.length) {
        return {elementLocations: parentElem, state: state};
    }

    let regionSet = false;
    // TODO last date can have less data than the dates before
    const regionsData = dataAsArray[0].regions || {},
        regions = [];
    for (let region of Object.keys(regionsData)) {
        if (!regionSet) {
            state.region = region;
            regionSet = true;
        }
        regions.push(region);
        for (let country of Object.keys(regionsData[region])) {
            if (!countriesByRegion[region]) {
                countriesByRegion[region] = [];
            }
            countriesByRegion[region].push(country);
        }
    }

    const selectorRegions = document.createElement("select");
    for (let region of regions) {
        const optionRegion = document.createElement("option");
        optionRegion.value = region;
        optionRegion.text = region;
        if (state.region === region) {
            optionRegion.selected = true;
        }
        selectorRegions.appendChild(optionRegion);
    }
    selectorRegions.addEventListener("change", function () {
        state.region = selectorRegions.value;

        const selectorCountries = generateCountrySelector(state.region);
        parentElem.innerHTML = "";
        parentElem.appendChild(selectorRegions);
        parentElem.appendChild(selectorCountries);
        cb(state.region, state.country, parentElem);
    });

    function generateCountrySelector(region) {
        const countries = countriesByRegion[region] || [];
        let countrySet = false;

        const selectorCountries = document.createElement("select");
        for (let country of countries) {
            if (!countrySet) {
                state.country = country;
                countrySet = true;
            }

            const optionCountry = document.createElement("option");
            optionCountry.value = country;
            optionCountry.text = country;
            if (state.country === country) {
                optionCountry.selected = true;
            }
            selectorCountries.appendChild(optionCountry);
        }

        selectorCountries.addEventListener("change", function () {
            state.country = selectorCountries.value;
            cb(state.region, state.country, parentElem);
        });

        return selectorCountries;
    }

    parentElem.appendChild(selectorRegions);
    parentElem.appendChild(generateCountrySelector(state.region));

    return {elementLocations: parentElem, state: state};
}
