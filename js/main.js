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
    const {elementCheckboxes, state} = generateCheckboxes(allTitles, function (title) {
        onStateChange(region, country, state)
    });

    elementFilters.appendChild(elementCheckboxes);

    onStateChange(region, country, state);
}());

function onStateChange(region, country, stateFilters) {
    const valuesByType = generateValuesFor(region, country, stateFilters);
    const plots = generatePlotsBy(valuesByType);
    draw(plots);
}

function generateValuesFor(region, country, stateFilters) {
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