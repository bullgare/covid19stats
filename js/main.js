(function main() {
    let region = "European Region",
        // country = "Russian Federation";
        country = "Germany";
    const valuesByType = generateValuesFor(region, country);
    const plots = generatePlotsBy(valuesByType);
    draw(plots);
}());

function generateValuesFor(region, country) {
    let valuesByType = {
        "Confirmed": {},
        "Confirmed, new": {},
        "Deaths": {},
        "Deaths, new": {},
        "Deaths / Confirmed": {},
        "New / Total Confirmed": {},
        "New / Total Deaths": {}
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

        valuesByType["Confirmed"][date] = confirmed;
        valuesByType["Confirmed, new"][date] = confirmedNew;
        valuesByType["Deaths"][date] = deaths;
        valuesByType["Deaths, new"][date] = deathsNew;
        valuesByType["Deaths / Confirmed"][date] = deathsToConfirmedRatio;
        valuesByType["New / Total Confirmed"][date] = newToConfirmedRatio;
        valuesByType["New / Total Deaths"][date] = newToTotalDeathsRatio;
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
    Plotly.newPlot(plot, plots, {
        margin: {t: 0}
    });
}