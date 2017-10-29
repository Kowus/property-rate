module.exports = {
    AR1: {
        name: "Assessed Residential Property",
        rate: 0.0015

    },
    AR2: {
        name: "Assessed Hybrid Property",
        rate: 0.0035
    },
    AR3: {
            name: "Assessed First Class Commercial Building",
            rate: 0.0285
    },
    AR4: {
            name: "Assessed Second Class Commercial Building",
            rate: 0.0065
    },
    AR5: {
            name: "Assessed Third Class Commercial Building",
            rate: 0.0025
    },
    AR6: {
            name: "ECG Transformer",
            rate: 0.0400
    },
    UR1: {
        name: "Unassessed Residential Building (> 3 storey)",
        rate: 250
    },
    UR2: {
        name: "Unassessed 3 Storey Residential Building",
        rate: 200
    },
    UR3: {
        name: "Unassessed 2 Storey Residential Building",
        rate: 150
    },
    UR4: {
        name: "Unassessed 1 Storey Residential Building",
        rate: 100
    },
    UR5: {
        name: "Unassessed Ground Property",
        rate: 50
    },
    UR6: {
        name: "UNCLASSIFIED",
        rate: 10
    },
    UR7: {
        name: "Unassessed Commercial Building (>3 Storey)",
        rate: 700
    },
    UR8: {
        name: "Unassessed 3 Storey Commercial Building",
        rate: 500
    }, UR9: {
        name: "Unassessed 2 Storey Commercial Building",
        rate: 400
    }
};

// Persist use code storage in redis later